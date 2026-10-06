/**
 * Construiește harta desenată de pe pagina de pornire: `pnpm map:city`.
 *
 * Geometria nu e inventată și nici copiată de pe o captură: se citește din chiar
 * dalele vectoriale pe care le servim pe `/harta`, se proiectează într-o cutie de
 * desen și se simplifică până rămâne silueta orașului. Iese un Brașov recognoscibil
 * care nu costă nicio cerere de rețea la încărcarea paginii.
 *
 * Rulează doar când vrem alt cadru sau alte straturi; rezultatul se versionează.
 */

import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";

const TILEJSON_URL = "https://tiles.openfreemap.org/planet";
const ZOOM = 13;
const EXTENT = 4096;

/** Cadrul: centrul Brașovului plus dealurile din jur, pe un format lat. */
const TILES_X = [4677, 4678, 4679];
const TILES_Y = [2925, 2926];

/** Cutia de desen. Raportul urmează blocul de dale, 3 pe 2. */
const WIDTH = 1200;
const HEIGHT = 800;

/**
 * Cât de aproape pot sta două puncte vecine înainte ca al doilea să fie de prisos.
 * La mărimea la care se vede harta, sub atât nu se mai distinge nimic, iar fiecare
 * punct păstrat degeaba e greutate în pagină.
 */
const MIN_STEP = 3.4;

/**
 * Decupajul care ajunge pe pagină, din cutia mare. Blocul de dale prinde și
 * dealurile din jur, dar pe pagină vrem orașul dens, nu pădurea din marginea lui.
 */
const VIEW = { x: 250, y: 40, width: 900, height: 560 };

/** Câte semne așezăm pe hartă și cât de rar, în puncte de desen. */
const PIN_COUNT = 22;
const PIN_SPACING = 62;

/** Sub lungimea asta un contur e un ciot care nu se citește ca drum. */
const MIN_LENGTH = { street: 26, minor: 14, major: 10, water: 0, waterway: 18, green: 22 };

/** Ce luăm din fiecare strat, și în ce grup ajunge. */
const ROAD_GROUPS = {
  major: ["motorway", "trunk", "primary"],
  minor: ["secondary", "tertiary"],
  street: ["minor"],
};

const scaleX = WIDTH / (TILES_X.length * EXTENT);
const scaleY = HEIGHT / (TILES_Y.length * EXTENT);

async function tileUrl() {
  const response = await fetch(TILEJSON_URL);
  const body = await response.json();
  return body.tiles[0];
}

async function readTile(url, x, y) {
  const response = await fetch(
    url.replace("{z}", String(ZOOM)).replace("{x}", String(x)).replace("{y}", String(y)),
  );
  if (!response.ok) throw new Error(`${response.status} pentru dala ${x}/${y}`);
  return new VectorTile(new PbfReader(new Uint8Array(await response.arrayBuffer())));
}

const project = (point, tx, ty) => [
  ((tx - TILES_X[0]) * EXTENT + point.x) * scaleX,
  ((ty - TILES_Y[0]) * EXTENT + point.y) * scaleY,
];

const round = (value) => Math.round(value * 10) / 10;

/**
 * Un contur, scris ca o comandă SVG, cu punctele prea apropiate aruncate.
 * Întoarce un șir gol dacă din formă n-a mai rămas nimic de desenat.
 */
function toPath(ring, tx, ty, close, minLength, collectPoints = false) {
  const points = [];
  for (const point of ring) {
    const [x, y] = project(point, tx, ty);
    const last = points.at(-1);
    if (last && Math.hypot(x - last[0], y - last[1]) < MIN_STEP) continue;
    points.push([x, y]);
  }
  if (points.length < 2) return "";

  // Ce cade cu totul în afara cadrului nu se desenează: dalele sunt tăiate cu o
  // margine de siguranță, iar marginea aia ar fi ieșit din cutie.
  if (points.every(([x, y]) => x < -40 || x > WIDTH + 40 || y < -40 || y > HEIGHT + 40)) return "";

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  if (length < minLength) return "";

  if (collectPoints) {
    for (const [x, y] of points) {
      const inside =
        x > VIEW.x + 40 &&
        x < VIEW.x + VIEW.width - 40 &&
        y > VIEW.y + 40 &&
        y < VIEW.y + VIEW.height - 40;
      if (inside) roadPoints.push([round(x), round(y)]);
    }
  }

  const head = `M${round(points[0][0])} ${round(points[0][1])}`;
  const tail = points
    .slice(1)
    .map(([x, y]) => `L${round(x)} ${round(y)}`)
    .join("");
  return head + tail + (close ? "Z" : "");
}

const groups = { major: [], minor: [], street: [], water: [], waterway: [], green: [] };

/** Vârfuri de drum din decupaj, din care ies pozițiile semnelor. */
const roadPoints = [];

const url = await tileUrl();

for (const tx of TILES_X) {
  for (const ty of TILES_Y) {
    const tile = await readTile(url, tx, ty);

    /** `pick` întoarce grupul în care intră forma, sau null dacă n-o vrem. */
    const collect = (layerName, pick, close) => {
      const layer = tile.layers[layerName];
      if (!layer) return;
      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        const bucket = pick(feature.properties);
        if (!bucket) continue;
        for (const ring of feature.loadGeometry()) {
          const path = toPath(
            ring,
            tx,
            ty,
            close,
            MIN_LENGTH[bucket],
            bucket === "street" || bucket === "minor",
          );
          if (path) groups[bucket].push(path);
        }
      }
    };

    collect(
      "transportation",
      (props) =>
        Object.entries(ROAD_GROUPS).find(([, classes]) => classes.includes(props.class))?.[0] ??
        null,
      false,
    );
    collect("water", (props) => (props.class === "swimming_pool" ? null : "water"), true);
    collect("waterway", () => "waterway", false);
    collect(
      "landcover",
      (props) => (props.class === "wood" || props.class === "grass" ? "green" : null),
      true,
    );
    collect("park", () => "green", true);
  }
}

/**
 * Semnele se aleg dintre vârfurile drumurilor, nu la întâmplare pe pânză: așa
 * fiecare cade pe o stradă adevărată, cum ar cădea o sesizare reală. Alegerea e
 * deterministă, deci harta arată la fel la fiecare generare.
 */
const centre = [VIEW.x + VIEW.width / 2, VIEW.y + VIEW.height / 2];
const ordered = roadPoints
  .map((point, index) => ({ point, index }))
  .sort((a, b) => {
    const da = Math.hypot(a.point[0] - centre[0], a.point[1] - centre[1]);
    const db = Math.hypot(b.point[0] - centre[0], b.point[1] - centre[1]);
    // Alternăm aproape/departe ca semnele să nu se strângă toate în mijloc.
    return (da % 97) - (db % 97) || a.index - b.index;
  });

const pins = [];
for (const { point } of ordered) {
  if (pins.length >= PIN_COUNT) break;
  if (pins.every(([x, y]) => Math.hypot(x - point[0], y - point[1]) >= PIN_SPACING)) {
    pins.push(point);
  }
}

const out = join(process.cwd(), "src", "components", "landing", "city-map-data.ts");
const literal = (name, paths) => `export const ${name} =\n  "${paths.join("")}";\n`;

await writeFile(
  out,
  `/**
 * Geometria hărții de pe pagina de pornire, generată cu \`pnpm map:city\`
 * (\`scripts/build-city-map.mjs\`) din dalele vectoriale ale hărții.
 *
 * Nu se editează de mână.
 */

/** Decupajul care se desenează, în coordonatele cutiei mari. */
export const CITY_VIEW_BOX = "${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}";
export const CITY_VIEW_WIDTH = ${VIEW.width};
export const CITY_VIEW_HEIGHT = ${VIEW.height};

/** Pozițiile semnelor, fiecare pe o stradă adevărată din decupaj. */
export const CITY_PINS: readonly (readonly [number, number])[] = [
${pins.map(([x, y]) => `  [${x}, ${y}],`).join("\n")}
];

${literal("CITY_GREEN", groups.green)}
${literal("CITY_WATER", groups.water)}
${literal("CITY_WATERWAY", groups.waterway)}
${literal("CITY_STREETS", groups.street)}
${literal("CITY_MINOR_ROADS", groups.minor)}
${literal("CITY_MAJOR_ROADS", groups.major)}`,
  "utf8",
);

const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
const bytes = Object.values(groups).reduce(
  (sum, list) => sum + list.reduce((inner, path) => inner + path.length, 0),
  0,
);
console.log(
  Object.entries(groups)
    .map(([name, list]) => `${name} ${list.length}`)
    .join(" · "),
);
console.log(`${total} contururi, ${(bytes / 1024).toFixed(0)} KB de cale, în ${out}`);

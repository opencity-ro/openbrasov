/**
 * Generează glifele hărții.
 *
 * Etichetele MapLibre nu se desenează cu CSS: harta cere, pentru fiecare interval
 * de 256 de caractere, un fișier cu glifele redate ca „signed distance field" —
 * o hartă de distanțe din care placa video reconstruiește litera la orice mărime,
 * clară și la 10px, și la 40px, și rotită.
 *
 * Rulează manual, `pnpm map:glyphs`, când schimbăm fontul. Rezultatul se comite:
 * build-ul aplicației nu depinde de scriptul ăsta și nu are nevoie de rețea.
 */
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import opentype from "opentype.js";
import { PbfWriter } from "pbf";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Inter, licențiat SIL OFL. Suficient de aproape de fonturile de sistem, și liber.
 * Fișierul drept și cel italic sunt fonturi variabile separate; motorul de desen
 * le încadrează pe fiecare în două greutăți, exact cele de care avem nevoie.
 */
const FONT_BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/";
const FONTS = {
  upright: {
    url: `${FONT_BASE}Inter%5Bopsz%2Cwght%5D.ttf`,
    family: "InterMapUpright",
    cache: path.join("node_modules", ".cache", "inter-upright.ttf"),
  },
  italic: {
    url: `${FONT_BASE}Inter-Italic%5Bopsz%2Cwght%5D.ttf`,
    family: "InterMapItalic",
    cache: path.join("node_modules", ".cache", "inter-italic.ttf"),
  },
};

/** Cele trei tăieturi pe care le cere stilul de bază: dreaptă, îngroșată, italică. */
const STACKS = [
  { name: "Inter Regular", font: FONTS.upright, weight: 400 },
  { name: "Inter Bold", font: FONTS.upright, weight: 700 },
  { name: "Inter Italic", font: FONTS.italic, weight: 400 },
];

/**
 * Versiunea intră în cale, nu într-un parametru: fișierele se servesc cu cache
 * de un an, „immutable", deci o regenerare pe aceeași cale nu ar ajunge niciodată
 * la un browser care le are deja. Crește numărul de fiecare dată când regenerezi
 * și schimbă-l și în `map-theme.ts`.
 */
const GLYPHS_VERSION = "3";
const OUT_DIR = path.join("public", "map-fonts", GLYPHS_VERSION);

/** Mărimea la care sunt redate glifele; MapLibre le scalează de aici. */
const FONT_SIZE = 24;
/** Marginea din jurul literei, cerută de MapLibre pentru contur și halo. */
const BUFFER = 3;
/** Cât de departe de literă mai are sens distanța, în pixeli. */
const RADIUS = 8;
const CUTOFF = 0.25;

/**
 * Linia de bază, măsurată de sus în jos, în glifele pe care le așteaptă MapLibre.
 *
 * `top` nu e înălțimea literei, ci poziția ei față de această linie — aproape
 * mereu negativă. Valoarea e o convenție a formatului, nu ceva ce ține de font:
 * am verificat-o pe glifele Noto Sans Regular, Bold și Italic servite de
 * furnizorul de dale și e 26 la toate trei. Scrisă greșit, fiecare etichetă de
 * pe hartă urcă cu 26 de pixeli și iese din scutul sau din pastila ei.
 */
const BASELINE = 26;

/** Ultimul punct de cod la care ne uităm; deasupra nu mai e nimic din font. */
const LAST_CODE_POINT = 0xffff;

const INF = 1e20;

/**
 * Transformata distanței euclidiene, pe o dimensiune (Felzenszwalb & Huttenlocher).
 * Rulată pe coloane și apoi pe linii, dă distanța exactă până la cel mai apropiat
 * pixel plin, în timp liniar.
 */
function edt1d(grid, offset, stride, length, f, v, z) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const dx = q - r;
    grid[offset + q * stride] = f[r] + dx * dx;
  }
}

function edt(data, width, height) {
  const size = Math.max(width, height);
  const f = new Float64Array(size);
  const v = new Int16Array(size);
  const z = new Float64Array(size + 1);

  for (let x = 0; x < width; x++) edt1d(data, x, width, height, f, v, z);
  for (let y = 0; y < height; y++) edt1d(data, y * width, 1, width, f, v, z);
}

/**
 * Din acoperirea fiecărui pixel (cât din el e acoperit de literă) scoatem
 * distanța cu semn: negativă în interiorul literei, pozitivă în afară.
 */
function toSignedDistanceField(alpha, width, height) {
  const outer = new Float64Array(width * height);
  const inner = new Float64Array(width * height);

  for (let i = 0; i < alpha.length; i++) {
    const a = alpha[i] / 255;
    outer[i] = a === 1 ? 0 : a === 0 ? INF : Math.max(0, 0.5 - a) ** 2;
    inner[i] = a === 1 ? INF : a === 0 ? 0 : Math.max(0, a - 0.5) ** 2;
  }

  edt(outer, width, height);
  edt(inner, width, height);

  const sdf = new Uint8Array(width * height);
  for (let i = 0; i < sdf.length; i++) {
    const distance = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);
    sdf[i] = Math.max(0, Math.min(255, Math.round(255 - 255 * (distance / RADIUS + CUTOFF))));
  }
  return sdf;
}

/**
 * Caracterele de control și jumătățile de pereche surogat nu sunt litere: nu au
 * ce desena, iar unele nici nu pot traversa granița către biblioteca de desen.
 */
function isRenderable(code) {
  if (code < 0x20) return false;
  if (code >= 0x7f && code <= 0x9f) return false;
  if (code >= 0xd800 && code <= 0xdfff) return false;
  return true;
}

/**
 * Desenăm doar ce are fontul. Altfel biblioteca de desen completează din
 * fonturile sistemului, iar harta ar primi litere de la altcineva — pe mașina de
 * build, nu pe a vizitatorului, deci nici măcar consecvent.
 */
async function coverageOf(fontPath) {
  const font = opentype.parse((await readFile(fontPath)).buffer);
  const covered = new Set();
  for (let code = 0; code <= LAST_CODE_POINT; code++) {
    if (isRenderable(code) && font.charToGlyphIndex(String.fromCodePoint(code)) > 0) {
      covered.add(code);
    }
  }
  return covered;
}

/**
 * Generăm fiecare interval în care fontul are măcar o literă. Un interval lipsă
 * înseamnă un 404 la prima etichetă cu un asemenea caracter — o stea într-un
 * nume de magazin a fost de ajuns.
 */
function rangesOf(covered) {
  const starts = new Set();
  for (const code of covered) starts.add(Math.floor(code / 256) * 256);
  return [...starts].sort((a, b) => a - b);
}

function drawGlyph(ctx, canvas, character, family, weight) {
  ctx.font = `${weight} ${FONT_SIZE}px "${family}"`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const metrics = ctx.measureText(character);
  const advance = Math.round(metrics.width);

  const inkWidth = Math.ceil(metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight);
  const inkHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);

  // Spațiul și rudele lui nu au cerneală: rămân doar cu avansul.
  if (!(inkWidth > 0) || !(inkHeight > 0)) {
    return { advance, width: 0, height: 0, left: 0, top: 0, bitmap: null };
  }

  const width = inkWidth + 2 * BUFFER;
  const height = inkHeight + 2 * BUFFER;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillText(
    character,
    BUFFER + metrics.actualBoundingBoxLeft,
    BUFFER + metrics.actualBoundingBoxAscent,
  );

  const image = ctx.getImageData(0, 0, width, height).data;
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = image[i * 4 + 3];

  return {
    advance,
    width: inkWidth,
    height: inkHeight,
    // Poziția cernelii față de originea glifei, așa cum o citește MapLibre.
    left: Math.round(-metrics.actualBoundingBoxLeft),
    top: Math.round(metrics.actualBoundingBoxAscent) - BASELINE,
    bitmap: toSignedDistanceField(alpha, width, height),
  };
}

function encodeRange(stackName, range, glyphs) {
  const writer = new PbfWriter();

  writer.writeMessage(
    1,
    (stack, pbf) => {
      pbf.writeStringField(1, stack.name);
      pbf.writeStringField(2, stack.range);
      for (const glyph of stack.glyphs) {
        pbf.writeMessage(
          3,
          (g, inner) => {
            inner.writeVarintField(1, g.id);
            if (g.bitmap) inner.writeBytesField(2, g.bitmap);
            inner.writeVarintField(3, g.width);
            inner.writeVarintField(4, g.height);
            inner.writeSVarintField(5, g.left);
            inner.writeSVarintField(6, g.top);
            inner.writeVarintField(7, g.advance);
          },
          glyph,
        );
      }
    },
    { name: stackName, range, glyphs },
  );

  return Buffer.from(writer.finish());
}

async function loadFont(font) {
  if (!existsSync(font.cache)) {
    console.log(`Descarc ${font.family}…`);
    const response = await fetch(font.url);
    if (!response.ok) throw new Error(`Fontul nu a putut fi descărcat: ${response.status}`);
    await mkdir(path.dirname(font.cache), { recursive: true });
    await writeFile(font.cache, Buffer.from(await response.arrayBuffer()));
  }

  const registered = GlobalFonts.register(await readFile(font.cache), font.family);
  if (!registered) throw new Error(`${font.family} nu a putut fi înregistrat`);
}

async function main() {
  const coverage = new Map();
  for (const font of Object.values(FONTS)) {
    await loadFont(font);
    coverage.set(font.family, await coverageOf(font.cache));
  }

  // Pânza trebuie să încapă cea mai lată glifă, cu marginile ei.
  const canvas = createCanvas(FONT_SIZE * 4, FONT_SIZE * 4);
  const ctx = canvas.getContext("2d");

  for (const stack of STACKS) {
    const covered = coverage.get(stack.font.family);
    const stackDir = path.join(OUT_DIR, stack.name);
    await mkdir(stackDir, { recursive: true });

    let written = 0;
    let drawn = 0;

    for (const start of rangesOf(covered)) {
      const end = start + 255;
      const glyphs = [];

      for (let code = start; code <= end; code++) {
        if (!covered.has(code)) continue;
        const character = String.fromCodePoint(code);
        const glyph = drawGlyph(ctx, canvas, character, stack.font.family, stack.weight);
        // Fără cerneală și fără avans înseamnă că fontul nu are litera.
        if (!glyph.bitmap && glyph.advance === 0) continue;
        glyphs.push({ id: code, ...glyph });
      }

      await writeFile(
        path.join(stackDir, `${start}-${end}.pbf`),
        encodeRange(stack.name, `${start}-${end}`, glyphs),
      );
      written += 1;
      drawn += glyphs.length;
    }

    console.log(`${stack.name}: ${written} intervale, ${drawn} glife`);
  }
}

await main();

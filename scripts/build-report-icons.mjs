/**
 * Construiește setul de icoane al sesizărilor: `pnpm map:icons`.
 *
 * Sursa e Fluent Emoji (Microsoft, licență MIT), varianta 3D, adusă direct din
 * depozitul lor. Rezultatul intră în `public/report-icons/<VERSION>/`, câte un PNG
 * de 128 de puncte pe categorie — destul pentru un pin de 35 de puncte pe un ecran
 * de densitate 3, fără să cărăm în pagină imaginile lor de 256.
 *
 * Icoanele se iau așa cum sunt. Singura intervenție e o insignă — o a doua
 * icoană Fluent, mică, în colț — acolo unde una singură nu spune destul: parcarea
 * cu interdicția, sau conul de lucrări cu problema de pe drum. Nimic desenat de noi.
 *
 * Rulează doar când se schimbă setul; fișierele generate se versionează în git.
 */

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

/** Ridică numărul odată cu orice schimbare de set: fișierele se servesc cu cache de un an. */
const VERSION = 2;

const SIZE = 128;
const OUT = join(process.cwd(), "public", "report-icons", String(VERSION));
const REPO = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

/**
 * O icoană Fluent. `tone` marchează personajele, care stau în depozit sub o
 * variantă de culoare a pielii în loc să stea direct în folderul lor.
 */
const fluent = (folder, tone = false) => ({ folder, tone });

/**
 * Ce primește fiecare categorie.
 *
 * `badge` pune o a doua icoană, mică, în colțul din dreapta jos.
 */
const ICONS = {
  // Drumul are un singur semn de bază, conul de lucrări, ca toate problemele de
  // carosabil să se recunoască drept una și aceeași familie. Insigna spune care.
  pothole: { base: fluent("Construction"), badge: fluent("Hole") },
  crosswalk_marking: { base: fluent("Construction"), badge: fluent("Children crossing") },
  road_marking: { base: fluent("Construction"), badge: fluent("Motorway") },

  // Interdicția ca insignă, nu peste tot semnul: pusă la mărime întreagă, fața ei
  // albă acoperea „P"-ul și parcarea ajungea să arate ca ocuparea domeniului public.
  illegal_parking: { base: fluent("P button"), badge: fluent("Prohibited") },

  sidewalk: { base: fluent("Person walking", true) },
  street_lighting: { base: fluent("Light bulb") },
  water_or_heating: { base: fluent("Droplet") },
  green_space: { base: fluent("Deciduous tree") },
  park: { base: fluent("Playground slide") },
  abandoned_vehicle: { base: fluent("Automobile") },
  traffic_light: { base: fluent("Vertical traffic light") },
  speed_bump_request: { base: fluent("Warning") },
  illegal_dumping: { base: fluent("Wastebasket") },
  waste_collection: { base: fluent("Recycling symbol") },
  unsanitary_land: { base: fluent("Nauseated face") },
  vandalism: { base: fluent("Ninja", true) },
  illegal_street_vending: { base: fluent("Shopping cart") },
  public_space_occupation: { base: fluent("Prohibited") },
  illegal_construction: { base: fluent("Building construction") },
  air_quality: { base: fluent("Factory") },
  stray_animal: { base: fluent("Dog face") },
  wildlife: { base: fluent("Bear") },
  rodents: { base: fluent("Rat") },
  insects: { base: fluent("Mosquito") },
  public_transport: { base: fluent("Bus") },
  signage: { base: fluent("Placard") },
  noise: { base: fluent("Speaker high volume") },
  accessibility: { base: fluent("Wheelchair symbol") },
  heritage: { base: fluent("Classical building") },
  other: { base: fluent("Round pushpin") },

  resolved: { base: fluent("Check mark button") },
};

function sourceUrl({ folder, tone }) {
  const file = folder.toLowerCase().replaceAll(" ", "_");
  const path = encodeURIComponent(folder);
  return tone
    ? `${REPO}/${path}/Default/3D/${file}_3d_default.png`
    : `${REPO}/${path}/3D/${file}_3d.png`;
}

const downloaded = new Map();

async function download(icon) {
  const url = sourceUrl(icon);
  if (!downloaded.has(url)) {
    downloaded.set(
      url,
      fetch(url).then(async (response) => {
        if (!response.ok) throw new Error(`${response.status} pentru ${url}`);
        return Buffer.from(await response.arrayBuffer());
      }),
    );
  }
  return downloaded.get(url);
}

const resized = async (icon, size) =>
  sharp(await download(icon))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

/** Insigna ocupă puțin peste o treime: se citește, dar nu acoperă semnul de bază. */
const BADGE_SIZE = Math.round(SIZE * 0.46);

async function build(name, { base, badge }) {
  const layers = [];
  if (badge) {
    layers.push({
      input: await resized(badge, BADGE_SIZE),
      left: SIZE - BADGE_SIZE,
      top: SIZE - BADGE_SIZE,
    });
  }

  const image = sharp(await resized(base, SIZE)).composite(layers);
  await writeFile(join(OUT, `${name}.png`), await image.png({ compressionLevel: 9 }).toBuffer());
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const [name, spec] of Object.entries(ICONS)) {
  await build(name, spec);
  process.stdout.write(`${name} `);
}

const files = await readdir(OUT);
console.log(`\n${files.length} icoane în ${OUT}`);

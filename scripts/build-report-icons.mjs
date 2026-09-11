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
  // Un semn rutier adevărat, cum îl vezi pe stradă. Semnele cu text pe ele nu
  // există în set, iar plăcuța cu insignă de avertizare nu se citea ca indicator.
  signage: { base: fluent("No entry") },
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

/** Sub transparența asta un pixel e doar umbra moale a desenului, nu desenul. */
const SOLID_ALPHA = 24;

/** Nicio icoană nu crește mai mult de-atât: unele sunt subțiri și s-ar umfla urât. */
const MAX_GROWTH = 1.25;

/**
 * Aduce desenul în centru și îl scalează ca să încapă în cercul înscris în
 * pătrat, oricare i-ar fi forma.
 *
 * Icoanele vin într-un pătrat, dar pe pin stau într-un disc, iar colțurile unui
 * pătrat ies din cerc: triunghiul de avertizare își atingea marginea cu vârfurile
 * de jos, iar insigna din colț cu marginea ei. Pe lângă asta, fiecare icoană își
 * poartă greutatea altfel — triunghiul e greu jos — deci centrul pătratului nu e
 * centrul desenului.
 *
 * Așa că fiecare icoană e măsurată: centrul e mijlocul a ceea ce chiar e desenat,
 * iar mărimea e dată de pixelul cel mai depărtat de acel centru. După asta toate
 * respectă aceeași regulă — desenul încape în cerc — iar pinul hotărăște singur
 * cât aer lasă între desen și marginea discului.
 */
async function fitToCircle(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= SOLID_ALPHA) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return buffer;

  const centerX = (left + right + 1) / 2;
  const centerY = (top + bottom + 1) / 2;

  let reach = 0;
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (data[(y * width + x) * 4 + 3] <= SOLID_ALPHA) continue;
      // Colțul cel mai îndepărtat al pixelului, nu mijlocul lui: altfel marginea
      // desenului ar ieși o jumătate de pixel din cerc.
      const dx = Math.max(Math.abs(x - centerX), Math.abs(x + 1 - centerX));
      const dy = Math.max(Math.abs(y - centerY), Math.abs(y + 1 - centerY));
      reach = Math.max(reach, Math.hypot(dx, dy));
    }
  }

  const scale = Math.min(SIZE / 2 / reach, MAX_GROWTH);
  const scaledWidth = Math.max(1, Math.round(width * scale));
  const scaledHeight = Math.max(1, Math.round(height * scale));

  // Toată imaginea se scalează, apoi se așază pe o pânză de trei ori mai mare,
  // cu centrul desenului în centrul ei, și se decupează mijlocul. Tăierea directă
  // în jurul desenului nu merge: la o insignă din colț, pătratul din jurul
  // desenului trece dincolo de marginea imaginii și ar fi fost trunchiat.
  const scaled = await sharp(buffer).resize(scaledWidth, scaledHeight).png().toBuffer();
  const pad = SIZE;
  const placeLeft = Math.round(pad + SIZE / 2 - centerX * scale);
  const placeTop = Math.round(pad + SIZE / 2 - centerY * scale);

  const wide = await sharp({
    create: {
      width: SIZE * 3,
      height: SIZE * 3,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: scaled, left: placeLeft, top: placeTop }])
    .png()
    .toBuffer();

  return sharp(wide).extract({ left: pad, top: pad, width: SIZE, height: SIZE }).png().toBuffer();
}

async function build(name, { base, badge }) {
  const layers = [];
  if (badge) {
    layers.push({
      input: await resized(badge, BADGE_SIZE),
      left: SIZE - BADGE_SIZE,
      top: SIZE - BADGE_SIZE,
    });
  }

  const composed = await sharp(await resized(base, SIZE))
    .composite(layers)
    .png()
    .toBuffer();
  const fitted = await fitToCircle(composed);
  await writeFile(
    join(OUT, `${name}.png`),
    await sharp(fitted).png({ compressionLevel: 9 }).toBuffer(),
  );
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const [name, spec] of Object.entries(ICONS)) {
  await build(name, spec);
  process.stdout.write(`${name} `);
}

const files = await readdir(OUT);
console.log(`\n${files.length} icoane în ${OUT}`);

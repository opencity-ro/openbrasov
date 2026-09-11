import { pinColor, type ReportCategory, type ReportStatus } from "@/lib/reports/categories";

import { loadReportIcon, RESOLVED_BADGE } from "./report-icons";

/**
 * Pinurile sesizărilor, desenate în browser și predate hărții ca imagini.
 *
 * Alternativa ar fi un `<div>` pe fiecare sesizare, așezat peste pânză. Merge la
 * cincizeci de sesizări și se îneacă la două mii: fiecare mișcare a hărții cere
 * repoziționarea tuturor nodurilor. Un strat de simboluri desenează pe placa
 * video și, mai important, intră în sistemul de priorități al hărții — de asta o
 * sesizare nu poate fi împinsă de pe ecran de eticheta unei farmacii.
 */

/**
 * Cutia desenului, în puncte CSS. Nu e pătrată: capul rotund stă sus, piciorul
 * coboară sub el, iar ultimul rând rămâne umbrei de la sol.
 *
 * Mărimea e fixă la orice apropiere. Un pin care crește odată cu harta pare că
 * se apropie de tine, nu că arată un loc; iar unul care se micșorează la nivel de
 * oraș dispare exact acolo unde sesizările sunt mai multe.
 */
export const PIN_WIDTH = 50;
export const PIN_HEIGHT = 54;

/** Centrul capului. Vârful piciorului cade pe aceeași verticală. */
const HEAD_X = PIN_WIDTH / 2;
const HEAD_Y = 24;

/** Raza marginii albe. Discul colorat e cu grosimea inelului mai mic. */
const HEAD_RADIUS = 19.5;

/** Inelul alb desparte pinul de hartă la orice culoare de fundal. */
const RING = 2;

/**
 * Linia care închide toată marginea, cap și picior deopotrivă. Pe o hartă
 * deschisă piciorul alb se topea în fundal, iar pinul părea că plutește.
 */
const OUTLINE = "rgba(15, 23, 42, 0.3)";
const OUTLINE_WIDTH = 1;

/** Vârful, adică punctul care arată locul sesizării. */
const TIP_Y = 50;

/**
 * Unghiul, față de verticala de jos, la care conturul părăsește cercul și pleacă
 * spre vârf. Mai mic, iar piciorul iese îngust dintr-un cap care pare lipit
 * deasupra lui; mai mare, iar cele două se topesc într-o picătură fără gât.
 */
const STEM_EXIT = (40.2 * Math.PI) / 180;

/**
 * Cele două puncte care îndoaie latura piciorului, date ca fracțiuni: `x` din
 * distanța de la ax până la ieșirea din cerc, `y` din coborârea de la ieșire
 * până la vârf.
 *
 * Primul ține lățimea imediat sub cap, ca îmbinarea să curgă în loc să facă gât;
 * al doilea trage tare spre ax, ca latura să se subțieze repede și vârful să
 * rămână ascuțit. Cu o singură îndoitură nu se pot avea amândouă: ori umerii ies
 * strangulați, ori piciorul rămâne bont.
 */
const STEM_SHOULDER = { x: 0.804, y: 0.42 };
const STEM_WAIST = { x: 0.363, y: 0.332 };

/**
 * Vârful e teșit, nu ascuțit ca un ac. Un colț de un singur punct s-ar pierde în
 * netezirea marginilor și ar lăsa piciorul să pară că se termină în ceață.
 */
const TIP_RADIUS = 1.63;

/**
 * Cât din discul colorat ocupă icoana.
 *
 * Icoanele 3D își poartă singure lumina și umbra, deci se țin pe culoare fără o
 * monedă albă sub ele — iar moneda le micșora cu o treime și făcea pinul să pară
 * o insignă în loc de un semn. Rămâne un inel subțire de culoare în jur, cât să
 * se vadă categoria.
 */
const ICON_RATIO = 0.82;

/**
 * Identitatea desenului. Culoarea și icoana vin din categorie, iar rezolvarea
 * adaugă insigna, deci starea contează doar cât să despartă rezolvatele: o
 * groapă deschisă și una în lucru arată la fel și împart același desen.
 */
export function pinImageId(category: ReportCategory, status: ReportStatus): string {
  return status === "resolved" ? `report-${category}-resolved` : `report-${category}`;
}

/**
 * Conturul întreg — cap rotund plus picior — ca o singură formă închisă.
 *
 * Trebuie să fie una singură: umbra se aruncă pe contur, iar două forme suprapuse
 * ar lăsa o dungă mai închisă exact la îmbinare.
 */
function silhouette(context: CanvasRenderingContext2D) {
  const exitX = HEAD_X + HEAD_RADIUS * Math.sin(STEM_EXIT);
  const exitY = HEAD_Y + HEAD_RADIUS * Math.cos(STEM_EXIT);
  const endY = TIP_Y - TIP_RADIUS;
  const reach = exitX - HEAD_X;
  const drop = endY - exitY;

  const shoulderX = HEAD_X + reach * STEM_SHOULDER.x;
  const shoulderY = exitY + drop * STEM_SHOULDER.y;
  const waistX = HEAD_X + reach * STEM_WAIST.x;
  const waistY = exitY + drop * STEM_WAIST.y;

  // Oglindirea se face în jurul axului: latura stângă e cea dreaptă cu `x`
  // răsturnat, deci nu poate ieși o formă asimetrică dintr-o greșeală de tastare.
  const mirror = (x: number) => 2 * HEAD_X - x;

  context.beginPath();
  // Cercul, de la ieșirea din stânga, pe deasupra, până la ieșirea din dreapta.
  context.arc(HEAD_X, HEAD_Y, HEAD_RADIUS, Math.PI / 2 + STEM_EXIT, Math.PI / 2 - STEM_EXIT);
  context.bezierCurveTo(shoulderX, shoulderY, waistX, waistY, HEAD_X + TIP_RADIUS, endY);
  context.arc(HEAD_X, endY, TIP_RADIUS, 0, Math.PI);
  context.bezierCurveTo(mirror(waistX), waistY, mirror(shoulderX), shoulderY, mirror(exitX), exitY);
  context.closePath();
}

/**
 * Umbra de la sol: o pată joasă, chiar sub vârf. Fără ea pinul plutește peste
 * hartă; cu ea, vârful chiar atinge locul pe care îl arată.
 */
function groundShadow(context: CanvasRenderingContext2D) {
  context.save();
  context.filter = "blur(1.3px)";
  context.fillStyle = "rgba(15, 23, 42, 0.4)";
  context.beginPath();
  context.ellipse(HEAD_X, TIP_Y + 0.9, 3.4, 1.2, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

/**
 * Un cap rotund colorat, așezat pe un picior alb care se subțiază până la vârf.
 *
 * Piciorul rămâne alb, nu colorat: culoarea spune despre ce e sesizarea și se
 * citește dintr-o privire dacă stă strânsă într-un disc, în timp ce un picior
 * colorat o întinde și o face să pară o pată, nu un semn.
 */
/**
 * Insigna de rezolvare: în colțul din dreapta sus al discului, peste icoană, cu un
 * inel alb subțire ca să se desprindă de desenul de sub ea.
 *
 * Sus, nu jos: colțul din dreapta jos îl ocupă deja insignele din setul de icoane
 * — interdicția de pe semnul de parcare, problema de pe conul de lucrări — iar
 * bifa pusă acolo le acoperea exact pe ele.
 */
const BADGE_RADIUS = 7;
const BADGE_OFFSET = 10;

function drawPin(
  context: CanvasRenderingContext2D,
  color: string,
  icon: HTMLImageElement | null,
  badge: HTMLImageElement | null,
) {
  context.clearRect(0, 0, PIN_WIDTH, PIN_HEIGHT);

  groundShadow(context);

  // Linia de margine, trasă de două ori mai groasă și acoperită apoi pe
  // dinăuntru de corpul alb: așa rămâne numai jumătatea din afară, iar corpul
  // păstrează exact lățimea formei. O linie centrată pe contur ar fi mușcat un
  // punct din alb pe toată marginea și ar fi subțiat piciorul.
  //
  // Umbra pleacă tot de aici, odată cu linia, și se stinge înainte de alb, ca să
  // nu apară a doua oară pe dinăuntru.
  context.save();
  context.shadowColor = "rgba(15, 23, 42, 0.45)";
  context.shadowBlur = 1.4;
  context.shadowOffsetY = 0.6;
  context.strokeStyle = OUTLINE;
  context.lineWidth = OUTLINE_WIDTH * 2;
  silhouette(context);
  context.stroke();
  context.restore();

  context.save();
  context.fillStyle = "#ffffff";
  silhouette(context);
  context.fill();
  context.restore();

  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.arc(HEAD_X, HEAD_Y, HEAD_RADIUS - RING, 0, Math.PI * 2);
  context.fill();
  context.restore();

  if (icon) {
    const size = (HEAD_RADIUS - RING) * 2 * ICON_RATIO;
    context.drawImage(icon, HEAD_X - size / 2, HEAD_Y - size / 2, size, size);
  }

  if (!badge) return;

  const badgeX = HEAD_X + BADGE_OFFSET;
  const badgeY = HEAD_Y - BADGE_OFFSET;
  context.save();
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(15, 23, 42, 0.3)";
  context.shadowBlur = 1.2;
  context.beginPath();
  context.arc(badgeX, badgeY, BADGE_RADIUS + 1.2, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.drawImage(
    badge,
    badgeX - BADGE_RADIUS,
    badgeY - BADGE_RADIUS,
    BADGE_RADIUS * 2,
    BADGE_RADIUS * 2,
  );
}

export type PinImage = { id: string; data: ImageData; pixelRatio: number };

/**
 * Desenează pinurile de care are nevoie setul curent de sesizări, sărind peste
 * cele deja înregistrate. Identitatea unui pin îi determină complet desenul, deci
 * unul existent nu are de ce să fie redesenat — iar redesenarea lui ar fi costat
 * de două ori: o dată pânza, o dată evenimentul de stil pe care îl declanșează.
 *
 * Desenele depind doar de categorie și de rezolvare, deci combinațiile chiar
 * folosite sunt puține.
 */
export async function renderPinImages(
  reports: Array<{ category: ReportCategory; status: ReportStatus }>,
  pixelRatio: number,
  alreadyRegistered: (id: string) => boolean,
): Promise<PinImage[]> {
  const wanted = new Map<string, { color: string; icon: string; resolved: boolean }>();
  for (const report of reports) {
    const id = pinImageId(report.category, report.status);
    if (wanted.has(id) || alreadyRegistered(id)) continue;
    wanted.set(id, {
      color: pinColor(report.category, report.status),
      icon: report.category,
      resolved: report.status === "resolved",
    });
  }
  if (wanted.size === 0) return [];

  // Icoanele se aduc toate deodată, nu una după alta: sunt fișiere mici de pe
  // aceeași origine, iar așteptarea lor pe rând ar fi ținut harta goală degeaba.
  const icons = new Map(
    await Promise.all(
      [...new Set([...[...wanted.values()].map((want) => want.icon), RESOLVED_BADGE])].map(
        async (name) => [name, await loadReportIcon(name)] as const,
      ),
    ),
  );

  const width = Math.round(PIN_WIDTH * pixelRatio);
  const height = Math.round(PIN_HEIGHT * pixelRatio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  // Desenul e scris o singură dată, în puncte CSS; densitatea ecranului rămâne
  // treaba transformării. Altfel fiecare rază și fiecare grosime ar fi trebuit
  // înmulțită de mână, iar una uitată ar fi trecut neobservată pe ecranul meu.
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const images: PinImage[] = [];
  for (const [id, { color, icon, resolved }] of wanted) {
    drawPin(
      context,
      color,
      icons.get(icon) ?? null,
      resolved ? (icons.get(RESOLVED_BADGE) ?? null) : null,
    );
    images.push({ id, data: context.getImageData(0, 0, width, height), pixelRatio });
  }
  return images;
}

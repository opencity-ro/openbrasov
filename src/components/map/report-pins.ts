import {
  pinEmoji,
  statusColor,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/reports/categories";

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
const HEAD_RADIUS = 20;

/** Inelul alb desparte pinul de hartă la orice culoare de fundal. */
const RING = 2;

/** Vârful, adică punctul care arată locul sesizării. */
const TIP_Y = 50.5;

/**
 * Unghiul, față de verticala de jos, la care conturul părăsește cercul și pleacă
 * spre vârf. Mai mic, iar piciorul iese îngust dintr-un cap care pare lipit
 * deasupra lui; mai mare, iar cele două se topesc într-o picătură fără gât.
 */
const STEM_EXIT = (36 * Math.PI) / 180;

/** Cât de tare e trasă înăuntru curba piciorului. 0,5 ar da laturi drepte. */
const STEM_PINCH = 0.47;

/**
 * Vârful e teșit, nu ascuțit ca un ac. Un colț de un singur punct s-ar pierde în
 * netezirea marginilor și ar lăsa piciorul să pară că se termină în ceață.
 */
const TIP_RADIUS = 1.4;

/** Cât din discul colorat ocupă semnul dinăuntru. */
const EMOJI_RATIO = 0.56;

export function pinImageId(category: ReportCategory, status: ReportStatus): string {
  return `report-${status}-${pinEmoji(category, status)}`;
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
  // Punctul de control stă pe drumul dintre ieșirea din cerc și vârf, tras spre
  // ax: de aici gâtul strâns de sub cap și laturile aproape drepte spre vârf.
  const controlX = HEAD_X + (exitX - HEAD_X) * STEM_PINCH;
  const controlY = exitY + (endY - exitY) * STEM_PINCH;

  context.beginPath();
  // Cercul, de la ieșirea din stânga, pe deasupra, până la ieșirea din dreapta.
  context.arc(HEAD_X, HEAD_Y, HEAD_RADIUS, Math.PI / 2 + STEM_EXIT, Math.PI / 2 - STEM_EXIT);
  context.quadraticCurveTo(controlX, controlY, HEAD_X + TIP_RADIUS, endY);
  context.arc(HEAD_X, endY, TIP_RADIUS, 0, Math.PI);
  context.quadraticCurveTo(2 * HEAD_X - controlX, controlY, 2 * HEAD_X - exitX, exitY);
  context.closePath();
}

/**
 * Umbra de la sol: o pată joasă, chiar sub vârf. Fără ea pinul plutește peste
 * hartă; cu ea, vârful chiar atinge locul pe care îl arată.
 */
function groundShadow(context: CanvasRenderingContext2D) {
  context.save();
  context.filter = "blur(1.5px)";
  context.fillStyle = "rgba(15, 23, 42, 0.38)";
  context.beginPath();
  context.ellipse(HEAD_X, TIP_Y + 1.1, 3.6, 1.4, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

/**
 * Un cap rotund colorat, așezat pe un picior alb care se subțiază până la vârf.
 *
 * Piciorul rămâne alb, nu colorat: culoarea spune în ce stadiu e sesizarea și se
 * citește dintr-o privire dacă stă strânsă într-un disc, în timp ce un picior
 * colorat o întinde și o face să pară o pată, nu un semn.
 */
function drawPin(context: CanvasRenderingContext2D, color: string, emoji: string) {
  context.clearRect(0, 0, PIN_WIDTH, PIN_HEIGHT);

  groundShadow(context);

  // Conturul alb, cu umbra lui difuză. Umbra se desenează odată cu el, deci
  // trebuie stinsă înainte de culoare, altfel ar mai apărea o dată sub disc.
  context.save();
  context.shadowColor = "rgba(15, 23, 42, 0.35)";
  context.shadowBlur = 2.6;
  context.shadowOffsetY = 1;
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

  context.save();
  const emojiSize = Math.round((HEAD_RADIUS - RING) * 2 * EMOJI_RATIO);
  context.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(emoji, HEAD_X, HEAD_Y);
  context.restore();
}

export type PinImage = { id: string; data: ImageData; pixelRatio: number };

/**
 * Desenează pinurile de care are nevoie setul curent de sesizări, sărind peste
 * cele deja înregistrate. Identitatea unui pin îi determină complet desenul, deci
 * unul existent nu are de ce să fie redesenat — iar redesenarea lui ar fi costat
 * de două ori: o dată pânza, o dată evenimentul de stil pe care îl declanșează.
 *
 * O sesizare rezolvată arată la fel indiferent de categorie, deci combinațiile
 * chiar folosite sunt puține.
 */
export function renderPinImages(
  reports: Array<{ category: ReportCategory; status: ReportStatus }>,
  pixelRatio: number,
  alreadyRegistered: (id: string) => boolean,
): PinImage[] {
  const wanted = new Map<string, { color: string; emoji: string }>();
  for (const report of reports) {
    const id = pinImageId(report.category, report.status);
    if (wanted.has(id) || alreadyRegistered(id)) continue;
    wanted.set(id, {
      color: statusColor[report.status],
      emoji: pinEmoji(report.category, report.status),
    });
  }
  if (wanted.size === 0) return [];

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
  for (const [id, { color, emoji }] of wanted) {
    drawPin(context, color, emoji);
    images.push({ id, data: context.getImageData(0, 0, width, height), pixelRatio });
  }
  return images;
}

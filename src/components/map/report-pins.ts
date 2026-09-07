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

/** Lățimea desenului în puncte CSS. Discul ocupă lățimea, acul coboară sub el. */
export const PIN_SIZE = 46;

/** Cât din disc ocupă semnul dinăuntru. */
const EMOJI_RATIO = 0.56;

/** Inelul alb desparte pinul de hartă la orice culoare de fundal. */
const RING = 2.5;

export function pinImageId(category: ReportCategory, status: ReportStatus): string {
  return `report-${status}-${pinEmoji(category, status)}`;
}

/**
 * Un disc cu un ac scurt sub el: acul arată exact punctul de pe hartă, discul
 * ține semnul. Forma se citește ca „ceva stă aici", spre deosebire de un cerc
 * simplu, care plutește fără să spună unde.
 */
function drawPin(context: CanvasRenderingContext2D, size: number, color: string, emoji: string) {
  const shadow = size * 0.06;
  const discRadius = (size - 2 * shadow) / 2;
  const centerX = size / 2;
  const centerY = discRadius + shadow;
  const tipY = size - shadow * 0.5;
  // Unghiul din care pleacă acul: destul de jos ca laturile lui să iasă din disc
  // fără colț vizibil, destul de sus ca vârful să rămână ascuțit.
  const spread = Math.asin(Math.min(1, (discRadius * 0.42) / discRadius));

  context.clearRect(0, 0, size, size);
  context.save();

  context.beginPath();
  context.arc(centerX, centerY, discRadius, Math.PI / 2 - spread, Math.PI / 2 + spread, true);
  context.lineTo(centerX, tipY);
  context.closePath();

  context.shadowColor = "rgba(15, 26, 20, 0.4)";
  context.shadowBlur = size * 0.1;
  context.shadowOffsetY = size * 0.04;
  context.fillStyle = "#ffffff";
  context.fill();

  // Umbra a fost desenată odată cu inelul; nu o mai vrem sub culoare.
  context.shadowColor = "transparent";
  context.lineWidth = RING * 2;
  context.strokeStyle = "#ffffff";
  context.stroke();
  context.fillStyle = color;
  context.fill();

  context.restore();

  context.save();
  context.font = `${Math.round(discRadius * 2 * EMOJI_RATIO)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(emoji, centerX, centerY);
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

  const size = Math.round(PIN_SIZE * pixelRatio);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  const images: PinImage[] = [];
  for (const [id, { color, emoji }] of wanted) {
    drawPin(context, size, color, emoji);
    images.push({ id, data: context.getImageData(0, 0, size, size), pixelRatio });
  }
  return images;
}

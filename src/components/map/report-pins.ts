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

/** Lățimea pinului în puncte CSS. Vârful stă exact pe coordonata sesizării. */
export const PIN_SIZE = 36;

/** Cât din pin ocupă semnul dinăuntru. */
const EMOJI_RATIO = 0.42;

/** Inelul alb desparte pinul de hartă la orice culoare de fundal. */
const RING = 2;

export function pinImageId(category: ReportCategory, status: ReportStatus): string {
  return `report-${status}-${pinEmoji(category, status)}`;
}

/**
 * Forma e o picătură: un pătrat cu trei colțuri rotunde și unul ascuțit, întors
 * cu 45° ca vârful să cadă în jos. Emoji-ul se desenează drept, nu întors cu
 * pătratul, altfel ar sta strâmb.
 */
function drawPin(context: CanvasRenderingContext2D, size: number, color: string, emoji: string) {
  const center = size / 2;
  // Latura pătratului care, rotit, încape exact în desen.
  const side = size / Math.SQRT2;
  const shadow = 2;

  context.clearRect(0, 0, size, size);
  context.save();

  // Centrul cercului stă mai sus decât centrul desenului: sub el rămâne vârful.
  context.translate(center, center - shadow);
  context.rotate(-Math.PI / 4);

  context.beginPath();
  context.roundRect(-side / 2, -side / 2, side, side, [side / 2, side / 2, side / 2, 3]);

  context.shadowColor = "rgba(15, 26, 20, 0.35)";
  context.shadowBlur = 4;
  context.shadowOffsetY = 2;
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
  context.translate(center, center - shadow);
  context.font = `${Math.round(size * EMOJI_RATIO)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(emoji, 0, 0);
  context.restore();
}

export type PinImage = { id: string; data: ImageData; pixelRatio: number };

/**
 * Desenează pinurile de care are nevoie setul curent de sesizări. O sesizare
 * rezolvată arată la fel indiferent de categorie, deci combinațiile chiar
 * folosite sunt puține, iar fiecare se desenează o singură dată.
 */
export function renderPinImages(
  reports: Array<{ category: ReportCategory; status: ReportStatus }>,
  pixelRatio: number,
): PinImage[] {
  const wanted = new Map<string, { color: string; emoji: string }>();
  for (const report of reports) {
    const id = pinImageId(report.category, report.status);
    if (wanted.has(id)) continue;
    wanted.set(id, {
      color: statusColor[report.status],
      emoji: pinEmoji(report.category, report.status),
    });
  }

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

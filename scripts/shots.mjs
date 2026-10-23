/**
 * Capturi de control cu Playwright: `node scripts/shots.mjs [url]`.
 *
 * Un singur browser, un singur context pe temă, pagini reutilizate. Scrie capturi
 * întregi și decupaje pe viewporturile care contează, plus erorile din consolă.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const URL = process.argv[2] ?? "http://localhost:3002/";
const OUT =
  "C:/Users/rafa/AppData/Local/Temp/claude/C--My-Folders-IT-opencity-ro/11a658bb-e680-4ebe-bfb2-abe226d789ac/scratchpad/shots";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const theme of ["dark", "light"]) {
  const context = await browser.newContext({
    colorScheme: theme,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`[${theme}] ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`[${theme}] ${error.message}`));

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(URL, { waitUntil: "networkidle" });
    // Intrările au curbe de ~0.8s; lăsăm pagina să se așeze înainte de captură.
    await page.waitForTimeout(1400);

    await page.screenshot({
      path: `${OUT}/${theme}-${viewport.name}-fold.png`,
      clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
    });

    if (viewport.name === "desktop") {
      // Scena agățată: o parcurgem în trepte și prindem fiecare capitol.
      for (const [name, ratio] of [
        ["cap1", 0.04],
        ["cap2", 0.42],
        ["cap3", 0.82],
      ]) {
        await page.evaluate((value) => {
          const stage = document.querySelector("main > div");
          if (!stage) return;
          const span = stage.scrollHeight - window.innerHeight;
          window.scrollTo(0, stage.offsetTop + span * value);
        }, ratio);
        await page.waitForTimeout(900);
        await page.screenshot({
          path: `${OUT}/${theme}-${name}.png`,
          clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
        });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      // Blocurile intră la prima trecere prin dreptul lor, deci pagina trebuie
      // parcursă o dată înainte de captura întreagă; altfel ies secțiuni goale.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.7;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}/${theme}-full.png`, fullPage: true });
    }
  }

  await context.close();
}

await browser.close();
await writeFile(`${OUT}/console.txt`, problems.join("\n") || "fără erori", "utf8");
console.log(`capturi în ${OUT}`);
console.log(problems.length ? problems.slice(0, 10).join("\n") : "consolă curată");

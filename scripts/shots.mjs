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
      const map = page.locator("svg[aria-label='Harta Brașovului']").first();
      const panel = map.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
      if (await panel.count()) {
        await panel.screenshot({ path: `${OUT}/${theme}-map.png` });
      }
      await page.screenshot({ path: `${OUT}/${theme}-full.png`, fullPage: true });
    }
  }

  await context.close();
}

await browser.close();
await writeFile(`${OUT}/console.txt`, problems.join("\n") || "fără erori", "utf8");
console.log(`capturi în ${OUT}`);
console.log(problems.length ? problems.slice(0, 10).join("\n") : "consolă curată");

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PbfReader } from "pbf";
import { describe, expect, it } from "vitest";

type Glyph = {
  id: number;
  bitmap?: Uint8Array;
  width: number;
  height: number;
  left: number;
  top: number;
  advance: number;
};

type Stack = { name: string; range: string; glyphs: Glyph[] };

/** Formatul pe care îl citește MapLibre: `glyphs.proto` din specificația stilului. */
function readStacks(buffer: Buffer): Stack[] {
  const stacks: Stack[] = [];

  new PbfReader(new Uint8Array(buffer)).readFields((tag, _result, pbf) => {
    if (tag !== 1 || !pbf) return;

    const stack: Stack = { name: "", range: "", glyphs: [] };
    pbf.readMessage((stackTag, _stackResult, stackPbf) => {
      if (!stackPbf) return;
      if (stackTag === 1) stack.name = stackPbf.readString();
      else if (stackTag === 2) stack.range = stackPbf.readString();
      else if (stackTag === 3) {
        const glyph = { id: 0, width: 0, height: 0, left: 0, top: 0, advance: 0 } as Glyph;
        stackPbf.readMessage((glyphTag, _glyphResult, glyphPbf) => {
          if (!glyphPbf) return;
          if (glyphTag === 1) glyph.id = glyphPbf.readVarint();
          else if (glyphTag === 2) glyph.bitmap = glyphPbf.readBytes();
          else if (glyphTag === 3) glyph.width = glyphPbf.readVarint();
          else if (glyphTag === 4) glyph.height = glyphPbf.readVarint();
          else if (glyphTag === 5) glyph.left = glyphPbf.readSVarint();
          else if (glyphTag === 6) glyph.top = glyphPbf.readSVarint();
          else if (glyphTag === 7) glyph.advance = glyphPbf.readVarint();
        }, null);
        stack.glyphs.push(glyph);
      }
    }, null);

    stacks.push(stack);
  }, null);

  return stacks;
}

const GLYPH_BORDER = 3;

/**
 * Linia de bază a formatului. `top` se măsoară față de ea, deci pentru o
 * majusculă care stă pe linie iese `înălțime - 26`, adică un număr negativ.
 */
const BASELINE = 26;

async function loadRange(stackName: string, range: string) {
  const file = path.join(process.cwd(), "public", "map-fonts", stackName, `${range}.pbf`);
  return readStacks(await readFile(file));
}

/**
 * Glifele sunt scrise de un script propriu, deci nimic nu garantează formatul în
 * afară de testul ăsta. Dacă se strică, harta rămâne fără etichete — o pierdere
 * greu de pus pe seama unui generator care a rulat săptămâna trecută.
 */
describe("glifele generate", () => {
  it.each(["Inter Regular", "Inter Bold"])("%s livrează latina de bază", async (stackName) => {
    const [stack] = await loadRange(stackName, "0-255");

    expect(stack.name).toBe(stackName);
    expect(stack.range).toBe("0-255");
    expect(stack.glyphs.length).toBeGreaterThan(180);
  });

  it("dă litere cu dimensiuni și margini corecte", async () => {
    const [stack] = await loadRange("Inter Regular", "0-255");
    const letterA = stack.glyphs.find((glyph) => glyph.id === "A".codePointAt(0));

    expect(letterA).toBeDefined();
    expect(letterA!.width).toBeGreaterThan(8);
    expect(letterA!.height).toBeGreaterThan(12);
    expect(letterA!.advance).toBeGreaterThan(8);
    // Convenția care a scos textul din scuturile de drum când am greșit-o:
    // `top` e poziția față de linia de bază, nu înălțimea literei.
    expect(letterA!.top).toBe(letterA!.height - BASELINE);
    expect(letterA!.top).toBeLessThan(0);
    // Bitmap-ul poartă marginea de 3px pe fiecare latură, peste litera propriu-zisă.
    expect(letterA!.bitmap!.length).toBe(
      (letterA!.width + 2 * GLYPH_BORDER) * (letterA!.height + 2 * GLYPH_BORDER),
    );
    // Interiorul literei e aproape de 255, fundalul aproape de 0.
    expect(Math.max(...letterA!.bitmap!)).toBeGreaterThan(200);
    expect(Math.min(...letterA!.bitmap!)).toBeLessThan(40);
  });

  it("include diacriticele românești", async () => {
    const [latin] = await loadRange("Inter Regular", "256-511");
    const [extended] = await loadRange("Inter Regular", "512-767");
    const ids = new Set([...latin.glyphs, ...extended.glyphs].map((glyph) => glyph.id));

    for (const character of ["ă", "Ă", "â", "Â", "î", "Î", "ș", "Ș", "ț", "Ț"]) {
      const code = character.codePointAt(0)!;
      if (code < 256) continue;
      expect(ids.has(code), `lipsește ${character}`).toBe(true);
    }
  });

  it("nu lasă spațiul fără avans", async () => {
    const [stack] = await loadRange("Inter Regular", "0-255");
    const space = stack.glyphs.find((glyph) => glyph.id === 32);

    expect(space).toBeDefined();
    expect(space!.advance).toBeGreaterThan(0);
    expect(space!.bitmap).toBeUndefined();
  });

  it("așază literele cu coadă sub linia de bază", async () => {
    const [stack] = await loadRange("Inter Regular", "0-255");
    const letterG = stack.glyphs.find((glyph) => glyph.id === "g".codePointAt(0));
    const letterO = stack.glyphs.find((glyph) => glyph.id === "o".codePointAt(0));

    // „o" stă pe linie, „g" coboară sub ea: aceeași înălțime deasupra liniei,
    // deci același `top`, deși „g" e mai înalt în total.
    expect(letterG!.height).toBeGreaterThan(letterO!.height);
    expect(letterG!.top).toBe(letterO!.top);
  });
});

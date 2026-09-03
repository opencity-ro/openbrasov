import { expect, test } from "@playwright/test";

test("landing page renders hero and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Fotografiezi");
  await expect(page.getByRole("link", { name: "Vezi harta" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sesizează o problemă/ })).toBeDisabled();
});

test("map page mounts MapLibre with attribution", async ({ page }) => {
  await page.goto("/harta");
  await expect(page.getByTestId("map-canvas")).toBeVisible();
  await expect(page.getByTestId("map-canvas").locator("canvas.maplibregl-canvas")).toBeAttached({
    timeout: 20_000,
  });
  await expect(page.getByText("OpenFreeMap")).toBeVisible();
  await expect(page.getByText("Încă nu sunt sesizări")).toBeVisible();
});

test("no horizontal overflow on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

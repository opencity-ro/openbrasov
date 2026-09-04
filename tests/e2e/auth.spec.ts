import { expect, test } from "@playwright/test";

test("sign-in page offers both passwordless routes", async ({ page }) => {
  await page.goto("/autentificare");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Intră în cont");
  await expect(page.getByLabel("Adresa de email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Trimite-mi linkul" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuă cu Google" })).toBeVisible();
});

test("an invalid address is rejected before any email is sent", async ({ page }) => {
  // Validation happens in the server action before it calls Supabase, so this
  // path stays meaningful in CI where no Supabase project is reachable.
  await page.goto("/autentificare");
  await page.getByLabel("Adresa de email").fill("nu-e-un-email");
  await page.getByRole("button", { name: "Trimite-mi linkul" }).click();
  await expect(page.locator("#email-error")).toContainText("nu pare corectă");
});

test("an expired link explains itself", async ({ page }) => {
  await page.goto("/autentificare?eroare=link");
  await expect(page.locator("#email-error")).toContainText("a expirat");
});

test("the header exposes the account entry point", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Autentificare" })).toBeVisible();
});

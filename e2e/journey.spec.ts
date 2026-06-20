import { test, expect } from '@playwright/test';

/* The site is decoupled via DOM CustomEvents: a hero chip opens the OnboardingJourney,
   the tariff CTA opens the CheckoutJourney. These flows exercise that seam end-to-end,
   plus the body scroll-lock (CLAUDE.md gotcha #2 — must release on close). */

test('hero chip opens the onboarding journey and locks scroll; Esc releases it', async ({ page }) => {
  await page.goto('/');
  const chip = page.locator('[data-chip]').first(); // first suggestion chip starts the journey
  await expect(chip).toBeVisible();
  await chip.click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden'); // scroll locked while open

  await page.keyboard.press('Escape');
  // close() animates out, then releases the body scroll-lock (the load-bearing bit)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('tariff page renders the recommended tariff', async ({ page }) => {
  await page.goto('/tariff?plz=34252&persons=2&kwh=3200');
  await expect(page.getByText('ZukunftsStrom Festpreis 24').first()).toBeVisible();
  await expect(page.getByText('54,30').first()).toBeVisible();
});

test('tariff CTA opens the checkout journey', async ({ page }) => {
  await page.goto('/tariff?plz=34252&persons=2&kwh=3200');
  await page.getByRole('button', { name: 'Tarif auswählen' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

const { test, expect } = require('@playwright/test');
const { attemptSelfHeal } = require('../healer/selfHeal');

async function goThroughSearchAndPassengerDetails(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search flights' }).click();

  await page.getByRole('button', { name: 'Select' }).first().click();

  await page.getByLabel('Full name (as on ID)').fill('Sanjana Rao');
  await page.getByLabel('Email').fill('sanjana@example.com');
  await page.getByLabel('Phone').fill('+91 90000 00000');
  await page.getByRole('button', { name: 'Continue to payment' }).click();

  await expect(page).toHaveURL(/\/payment$/);
}

test('completes a booking end to end (baseline, no application drift)', async ({ page }) => {
  await goThroughSearchAndPassengerDetails(page);

  await page.getByRole('button', { name: 'Confirm Booking' }).click();

  await expect(page).toHaveURL(/\/confirmation$/);
  await expect(page.locator('#confirmBanner')).toContainText('Booking confirmed');
});

test('self-heals when the confirm control is renamed under the test (UI drift)', async ({ page }) => {
  // Simulate an application change shipped without updating the test suite:
  // "Confirm Booking" becomes "Complete Reservation".
  await page.addInitScript(() => localStorage.setItem('BREAK_MODE', '1'));

  await goThroughSearchAndPassengerDetails(page);

  const previousSelector = page.getByRole('button', { name: 'Confirm Booking' });
  let clicked = false;

  try {
    await previousSelector.click({ timeout: 2000 });
    clicked = true;
  } catch (originalError) {
    // The old selector no longer resolves. Ask the self-healing layer
    // for a validated replacement instead of failing the whole run.
    const healedLocator = await attemptSelfHeal(page, {
      intendedAction: 'submit payment and confirm the flight booking',
      previousSelectorDescription: "role=button, accessible name='Confirm Booking'",
      originalError,
    });
    await healedLocator.click();
    clicked = true;
  }

  expect(clicked).toBe(true);
  await expect(page).toHaveURL(/\/confirmation$/);
});

test('reports UNVERIFIED instead of a fabricated status when the flight-status API is down', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('CHAOS_API_DOWN', '1'));
  await page.goto('/disruption');

  await expect(page.locator('.banner')).toContainText('UNVERIFIED');
  await expect(page.getByRole('button', { name: 'Rebook this flight' })).toHaveCount(0);
});

test('shows a real disruption and rebooking options when the status API is healthy', async ({ page }) => {
  await page.goto('/disruption');

  await expect(page.locator('.banner')).toContainText('CANCELLED');
  await expect(page.getByRole('button', { name: 'Rebook this flight' }).first()).toBeVisible();
});

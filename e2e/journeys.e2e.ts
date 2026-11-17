import { expect, test, type Page } from '@playwright/test';

// The fictional fixtures sit around 16–21 Nov 2026, so the browser clock is pinned there.
const MONDAY = new Date('2026-11-16T03:00:00Z');
const at = async (page: Page, time: Date) => page.clock.install({ time });

for (const [zone, day, time] of [
  ['Asia/Kolkata', '2026-11-20', '8:45 PM'],
  ['America/Los_Angeles', '2026-11-20', '7:15 AM'],
  ['Asia/Tokyo', '2026-11-21', '12:15 AM'],
] as const) {
  test.describe(`Radar in ${zone}`, () => {
    test.use({ timezoneId: zone });
    test('shows the 00:15 JST broadcast on the viewer’s own day and time', async ({ page }) => {
      await at(page, MONDAY);
      await page.goto('/');
      await expect(page.getByText('Days and times in your timezone')).toBeVisible(); // Chromium may report Asia/Calcutta
      await expect(page.locator(`#day-${day}`)).toContainText(time);
      await expect(page.locator(`#day-${day}`)).toContainText('TV broadcast in Japan');
    });
  });
}

test.describe('with a fixed timezone', () => {
  test.use({ timezoneId: 'Asia/Kolkata' });

  test('Radar moves a week forward and back', async ({ page }) => {
    await at(page, MONDAY);
    await page.goto('/');
    await page.getByRole('button', { name: 'Next week →' }).click();
    await expect(page.getByRole('heading', { name: 'Radar · Mon 23 – Sun 29' })).toBeVisible();
    await page.getByRole('button', { name: 'This week', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'This week’s Radar' })).toBeVisible();
  });

  test('follow from the Radar, survive a reload, see it in My Universe, unfollow', async ({ page }) => {
    await at(page, MONDAY);
    await page.goto('/');
    await page.getByRole('button', { name: 'Follow Starfall Courier' }).first().click();
    await expect(page.getByRole('button', { name: 'Follow Starfall Courier' })).toHaveCount(0); // every copy changed together

    await page.reload();
    await expect(page.getByRole('button', { name: 'Following Starfall Courier' }).first()).toBeVisible();

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'My Universe' }).click();
    await expect(page).toHaveURL(/\/my-universe$/);
    await expect(page.getByRole('main').getByRole('link', { name: 'Starfall Courier' })).toBeVisible();
    await page.getByRole('button', { name: 'Following Starfall Courier' }).click();
    await expect(page.getByText('You’re not following anything yet.')).toBeVisible();
  });

  test('a corrupt saved follow list is treated as empty without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('nextwatch:follows', '{bad'));
    await at(page, MONDAY);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Follow Starfall Courier' }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Apex counts down to an exact time, then makes no availability claim', async ({ page }) => {
    await at(page, new Date('2026-11-20T15:14:57Z'));
    await page.goto('/');
    await expect(page.getByRole('timer')).toContainText(/Starts in 00h 00m 0\ds/);
    await page.clock.runFor(5000);
    await expect(page.getByRole('timer')).toHaveCount(0);
    await expect(page.getByText('The scheduled time has passed.')).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('Horizon lists titles and the format filter works', async ({ page }) => {
    await page.goto('/horizon');
    await expect(page.getByRole('heading', { name: 'Horizon', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Untitled Kitsune Project' })).toBeVisible();
    await page.goto('/horizon?format=MOVIE');
    await expect(page.getByRole('link', { name: 'Paper Moon Brigade: The Movie' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Untitled Kitsune Project' })).toHaveCount(0);
  });

  test('header search submits and shows results', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Search titles' }).fill('orchard');
    await page.getByRole('searchbox', { name: 'Search titles' }).press('Enter');
    await expect(page).toHaveURL(/\/search\?q=orchard/);
    await expect(page.getByText('2 titles found.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Glass Orchard Season 2' })).toBeVisible();
  });

  test('title pages show releases, sources and date-change history', async ({ page }) => {
    await page.goto('/anime/lantern-tide');
    await expect(page.getByRole('heading', { name: 'Lantern Tide', level: 1 })).toBeVisible();
    await expect(page.getByText('January 2027 · Episode 1')).toBeVisible();
    await expect(page.getByText(/Previously .*Oct 4/)).toBeVisible();
  });
});

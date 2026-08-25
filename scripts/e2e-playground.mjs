/**
 * E2E smoke for Vue/Svelte playgrounds (same scenario as the React suite,
 * adapted to the playground UI). Usage: node scripts/e2e-playground.mjs <url>
 */
import { chromium } from 'playwright-core';

const BASE = process.argv[2];
if (BASE === undefined) throw new Error('usage: node e2e-playground.mjs <base-url>');

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  // Shell rendered
  const shellTitle = await page
    .getByText(/Universal Blocks/)
    .first()
    .isVisible()
    .catch(() => false);
  check('shell renders', shellTitle);

  // Create through dialog
  await page.getByRole('button', { name: '+ New task' }).click();
  await page.waitForTimeout(400);
  await page.getByPlaceholder('What needs doing?').fill('Cross-fw task');
  await page.getByRole('button', { name: 'Add task' }).click();

  const row = page.getByRole('row').filter({ hasText: 'Cross-fw task' });
  await row.first().waitFor({ state: 'visible', timeout: 5000 });
  check('create: task appears in table', true);

  // Required validation blocks empty submit
  await page.getByRole('button', { name: '+ New task' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Add task' }).click();
  const blocked = await page
    .getByText('Task is required')
    .first()
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  check('form: required validation works', blocked);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Persistence via shared localStorage bridge
  await page.reload({ waitUntil: 'domcontentloaded' });
  const persisted = await page
    .getByRole('row')
    .filter({ hasText: 'Cross-fw task' })
    .first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check('bridge: persists after reload', persisted);

  // Delete cleans up
  await page
    .getByRole('button', { name: 'Delete' })
    .first()
    .click();
  await page.waitForTimeout(500);
  check(
    'delete: row removed',
    (await page.getByRole('row').filter({ hasText: 'Cross-fw task' }).count()) === 0,
  );

  check('console: no uncaught page errors', errors.length === 0, errors.join(' | '));
} finally {
  await browser.close();
}

const failed = results.filter((ok) => !ok);
console.log(`${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);

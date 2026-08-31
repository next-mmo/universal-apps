/**
 * E2E smoke test for the pro component library demo app.
 * Drives the locally installed Microsoft Edge (no browser download needed):
 *   node scripts/e2e-smoke.mjs [base-url]
 */
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:1431';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error)));

try {
  // --- Todos page: create → appears in table → persists across reload ---
  await page.goto(`${BASE}/todos`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'New task' }).click();
  const taskInput = page.getByPlaceholder('What needs doing?');
  await taskInput.fill('E2E smoke task');
  await page.getByRole('button', { name: 'Add task' }).click();

  const row = page.getByRole('row').filter({ hasText: 'E2E smoke task' });
  await row.waitFor({ state: 'visible', timeout: 5000 });
  check('create: new todo appears in table', true);

  // Empty-state validation: required field blocks empty submit
  await page.getByRole('button', { name: 'New task' }).click();
  await page.getByRole('button', { name: 'Add task' }).click();
  const validationVisible = await page
    .getByText('Task is required')
    .isVisible()
    .catch(() => false);
  check('form: required validation blocks empty submit', validationVisible);
  await page.keyboard.press('Escape');

  // Toggle done via row action
  await row.getByRole('button', { name: 'Done' }).click();
  await row.getByText('Done', { exact: true }).first().waitFor({ timeout: 5000 });
  check('table: Done action flips status badge', true);

  // Persistence through the universal bridge
  await page.reload({ waitUntil: 'domcontentloaded' });
  const persisted = await page
    .getByRole('row')
    .filter({ hasText: 'E2E smoke task' })
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check('bridge: todo persists after reload', persisted);

  await page.getByRole('button', { name: 'Refresh data' }).click();
  await page.getByRole('row').filter({ hasText: 'E2E smoke task' }).waitFor({ state: 'visible' });
  check('table: controlled refresh keeps the current data visible', true);

  // Search filter narrows the table
  await page.getByLabel('Search table').fill('E2E smoke');
  await page.waitForTimeout(300);
  const visibleRows = await page.getByRole('row').count();
  check('table: search filters rows', visibleRows <= 3, `${visibleRows} rows visible`);

  // Column visibility toggle hides "Created" column
  await page.getByRole('button', { name: 'Columns' }).click();
  await page.getByRole('menuitemcheckbox').filter({ hasText: 'Created' }).click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const createdHeaderGone =
    (await page.getByRole('columnheader', { name: 'Created' }).count()) === 0;
  check('table: column toggle hides Created column', createdHeaderGone);

  // Rejected deletes stay open and expose the mutation error.
  await page.evaluate(() => {
    const storagePrototype = Object.getPrototypeOf(localStorage);
    globalThis.__originalStorageSetItem = storagePrototype.setItem;
    storagePrototype.setItem = () => {
      throw new Error('Forced persistence failure');
    };
  });
  await page
    .getByRole('row')
    .filter({ hasText: 'E2E smoke task' })
    .getByRole('button', { name: 'Delete' })
    .click();
  const removeDialog = page.getByRole('dialog');
  await removeDialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await removeDialog.getByRole('alert').waitFor({ state: 'visible' });
  check('mutation: rejected delete stays open with an error', await removeDialog.isVisible());

  await page.evaluate(() => {
    const storagePrototype = Object.getPrototypeOf(localStorage);
    storagePrototype.setItem = globalThis.__originalStorageSetItem;
    delete globalThis.__originalStorageSetItem;
  });
  await removeDialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.waitForTimeout(400);
  check(
    'table: delete removes the row',
    (await page.getByRole('row').filter({ hasText: 'E2E smoke task' }).count()) === 0,
  );

  // --- Forms page: schema-driven form creates a real todo ---
  await page.goto(`${BASE}/forms`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('What needs doing?').fill('Form block task');
  await page.getByRole('switch').click();
  await page.getByRole('button', { name: 'Create task' }).click();
  const saved = await page.getByText('Saved', { exact: true }).waitFor({ timeout: 5000 }).then(() => true).catch(() => false);
  check('form: submit succeeds and shows Saved banner', saved);

  // --- Router navigation via shell links ---
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Open Todos' }).click();
  await page.waitForURL('**/todos', { timeout: 5000 });
  check('router: shell link navigates to /todos', page.url().endsWith('/todos'));

  check('console: no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | '));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);

import { test as base, expect } from '@playwright/test';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { openStore } from '../src/store.js';

const test = base.extend({
  todoURL: async ({}, use) => {
    const dir = resolve('.test-data'); await mkdir(dir, { recursive: true });
    const unique = await mkdtemp(join(dir, 'browser-'));
    const store = await openStore(join(unique, 'todos.json'));
    const server = createApp({ store }).listen(0, '127.0.0.1'); await once(server, 'listening');
    try { await use(`http://127.0.0.1:${server.address().port}`); }
    finally { server.closeAllConnections(); await new Promise(done => server.close(done)); await store.drain(); }
  }
});

test('keyboard CRUD, filters, and reload persist correctly', async ({ page, todoURL }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(todoURL);
  await expect(page.getByText('Ready. Changes save locally.')).toBeVisible();
  await page.getByLabel("What's next?").fill('Ship a small win'); await page.getByLabel("What's next?").press('Enter');
  const row = page.getByRole('listitem'); await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: 'Edit task title' }).fill('Ship verified change');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await row.getByRole('checkbox').check();
  await expect(page.getByText('0 active · 1 total')).toBeVisible();
  await page.getByRole('button', { name: 'Active', exact: true }).click(); await expect(row).toHaveCount(0);
  await page.getByRole('button', { name: 'Completed', exact: true }).click(); await expect(row).toHaveCount(1);
  await page.reload(); await expect(page.getByText('Ship verified change', { exact: true })).toBeVisible(); await expect(row.getByRole('checkbox')).toBeChecked();
  await row.getByRole('button', { name: 'Delete', exact: true }).click(); await expect(row).toHaveCount(0);
  await page.reload(); await expect(page.getByText('No tasks here. Add a small win.')).toBeVisible();
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('HTML-like titles remain text, not executable DOM', async ({ page, todoURL }) => {
  await page.goto(todoURL); const payload = '<img src=x onerror="window.pwned=1">';
  await page.getByLabel("What's next?").fill(payload); await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByText(payload, { exact: true })).toBeVisible(); expect(await page.locator('#todos img').count()).toBe(0);
  expect(await page.evaluate(() => window.pwned)).toBeUndefined();
});

test('load failure has retry; failed create preserves input and avoids phantom item', async ({ page, todoURL }) => {
  let fail = true;
  await page.route('**/api/todos', async route => {
    if (fail) await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Temporary failure' }) });
    else await route.continue();
  });
  await page.goto(todoURL); await expect(page.getByRole('alert')).toHaveText('Temporary failure');
  fail = false; await page.getByRole('button', { name: 'Retry loading' }).click(); await expect(page.getByText('Ready. Changes save locally.')).toBeVisible();
  fail = true; await page.getByLabel("What's next?").fill('Keep my draft'); await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Temporary failure'); await expect(page.getByLabel("What's next?")).toHaveValue('Keep my draft'); await expect(page.getByRole('listitem')).toHaveCount(0);
  fail = false; await page.getByRole('button', { name: 'Add task', exact: true }).click(); await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('failed toggle and delete preserve displayed state; whitespace rejected', async ({ page, todoURL }) => {
  await page.goto(todoURL); await page.getByLabel("What's next?").fill('   '); await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1–200'); await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByLabel("What's next?").fill('Do not lose'); await page.getByRole('button', { name: 'Add task', exact: true }).click();
  const row = page.getByRole('listitem'); await expect(row).toHaveCount(1);
  await page.route('**/api/todos/*', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Disk unavailable"}' }));
  await row.getByRole('checkbox').click(); await expect(page.getByRole('alert')).toHaveText('Disk unavailable'); await expect(row.getByRole('checkbox')).not.toBeChecked();
  await row.getByRole('button', { name: 'Delete', exact: true }).click(); await expect(row).toHaveCount(1);
});

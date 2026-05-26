/**
 * Playwright human-style drags against core test harness or playground.
 *   HEADED=1 pnpm exec tsx scripts/manual-hand-check.mts
 *   HARNESS_URL=http://127.0.0.1:5199/ (default after vite, optional)
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../artifacts/manual-hand-check');

async function drag(
	page: import('playwright').Page,
	selector: string,
	deltaX: number,
	deltaY: number,
	steps = 10,
) {
	const box = await page.locator(selector).boundingBox();
	if (!box) throw new Error(`No box for ${selector}`);
	const sx = box.x + box.width / 2;
	const sy = box.y + box.height / 2;
	await page.mouse.move(sx, sy);
	await page.mouse.down();
	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		await page.mouse.move(sx + deltaX * t, sy + deltaY * t);
	}
	await page.mouse.up();
}

async function runHarness(page: import('playwright').Page) {
	const scenarios = [
		{
			name: 'drag-translate',
			tab: 'drag',
			run: async () => {
				await drag(page, '[data-testid="draggable"]', 100, 100);
				const translate = await page
					.locator('[data-testid="draggable"]')
					.evaluate((el) => getComputedStyle(el).translate);
				return { translate };
			},
			check: (r: { translate?: string }) =>
				!!r.translate && r.translate !== 'none' && !r.translate.startsWith('0px, 0px'),
		},
		{
			name: 'sortable-reorder',
			tab: 'sortable',
			run: async () => {
				const before = await page.locator('[data-testid="list"] li').allTextContents();
				const b1 = await page.locator('[data-testid="item-1"]').boundingBox();
				const b3 = await page.locator('[data-testid="item-3"]').boundingBox();
				if (!b1 || !b3) throw new Error('sortable items not found');
				const dy = b3.y + b3.height / 2 - (b1.y + b1.height / 2);
				await drag(page, '[data-testid="item-1"]', 0, dy, 14);
				await page.waitForTimeout(250);
				const after = await page.locator('[data-testid="list"] li').allTextContents();
				const keys = await page.locator('[data-testid="list"] li').evaluateAll((els) =>
					els.map((el) => el.getAttribute('data-sortable-key')),
				);
				return { before, after, keys };
			},
			check: (r: { keys?: (string | null)[] }) => r.keys?.join(',') === '2,3,1',
		},
		{
			name: 'drop-on-zone',
			tab: 'drop',
			run: async () => {
				const dropBox = await page.locator('[data-testid="dropzone"]').boundingBox();
				const dragBox = await page.locator('[data-testid="draggable"]').boundingBox();
				if (!dropBox || !dragBox) throw new Error('drop elements missing');
				const dx = dropBox.x + dropBox.width / 2 - (dragBox.x + dragBox.width / 2);
				const dy = dropBox.y + dropBox.height / 2 - (dragBox.y + dragBox.height / 2);
				await drag(page, '[data-testid="draggable"]', dx, dy, 12);
				await page.waitForTimeout(250);
				const dropped = await page.locator('[data-testid="drop-count"]').textContent();
				return { dropped };
			},
			check: (r: { dropped?: string | null }) => r.dropped === '1',
		},
	];

	const report: Record<string, { ok: boolean; data: unknown }> = {};

	for (const s of scenarios) {
		await page.click(`[data-tab="${s.tab}"]`);
		await page.waitForTimeout(200);
		await page.screenshot({ path: path.join(OUT, `${s.name}-before.png`) });
		const data = await s.run();
		await page.screenshot({ path: path.join(OUT, `${s.name}-after.png`) });
		const ok = s.check(data as never);
		report[s.name] = { ok, data };
		console.log(`\n=== ${s.name} ${ok ? 'PASS' : 'FAIL'} ===`);
		console.log(JSON.stringify(data, null, 2));
	}

	return report;
}

async function runPlaygroundSortable(page: import('playwright').Page, base: string) {
	await page.goto(`${base}/sortable-test`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(300);
	const before = await page.locator('.sortable-item .name').allTextContents();
	await page.screenshot({ path: path.join(OUT, 'playground-sortable-before.png') });

	const first = page.locator('.sortable-item').first();
	const last = page.locator('.sortable-item').last();
	const b1 = await first.boundingBox();
	const bL = await last.boundingBox();
	if (!b1 || !bL) throw new Error('playground items missing');
	const dy = bL.y + bL.height / 2 - (b1.y + b1.height / 2);
	await drag(page, '.sortable-item >> nth=0', 0, dy, 14);
	await page.waitForTimeout(300);

	const orderText = await page.locator('.result p').textContent();
	const after = await page.locator('.sortable-item .name').allTextContents();
	await page.screenshot({ path: path.join(OUT, 'playground-sortable-after.png') });

	const changed = before.join() !== after.join();
	console.log('\n=== playground sortable ===');
	console.log({ before, after, orderText, changed });
	return changed;
}

async function main() {
	await mkdir(OUT, { recursive: true });
	const headless = process.env.HEADED !== '1';
	const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 80 });
	const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

	const harnessUrl = process.env.HARNESS_URL;
	const playgroundBase = process.env.PLAYGROUND_URL ?? 'http://127.0.0.1:5198';

	let harnessOk = true;
	if (harnessUrl) {
		await page.goto(harnessUrl, { waitUntil: 'networkidle' });
		const report = await runHarness(page);
		harnessOk = Object.values(report).every((r) => r.ok);
	}

	let playgroundOk = false;
	try {
		playgroundOk = await runPlaygroundSortable(page, playgroundBase);
	} catch (e) {
		console.warn('Playground check skipped or failed:', (e as Error).message);
	}

	await browser.close();

	const exitOk = harnessUrl ? harnessOk : playgroundOk;
	if (!harnessUrl && !playgroundOk) {
		console.error('\nNo HARNESS_URL and playground did not pass. Start playground: pnpm dev in playground/svelte');
	}
	process.exit(exitOk ? 0 : 1);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

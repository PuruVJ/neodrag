import test, { expect } from '@playwright/test';
import { get_mouse_position, setup } from '../test-utils';

test.describe('options.axis', () => {
	test('move on both axes', async ({ page }) => {
		await setup(page, 'options/axis', { axis: 'both' });

		const div = page.getByTestId('draggable');

		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await page.mouse.up();

		// Only X should have changed
		await expect(div).toHaveCSS('translate', '100px 100px');
	});

	test('move only on x-axis', async ({ page }) => {
		await setup(page, 'options/axis', { axis: 'x' });

		const div = page.getByTestId('draggable');

		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await page.mouse.up();

		// Only X should have changed
		await expect(div).toHaveCSS('translate', '100px');
	});

	test('move only on y-axis', async ({ page }) => {
		await setup(page, 'options/axis', { axis: 'y' });

		const div = page.getByTestId('draggable');

		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await page.mouse.up();

		// Only X should have changed
		await expect(div).toHaveCSS('translate', '0px 100px');
	});

	test("none: shouldn't move", async ({ page }) => {
		await setup(page, 'options/axis', { axis: 'none' });

		const div = page.getByTestId('draggable');

		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await page.mouse.up();

		// Only X should have changed
		await expect(div).toHaveCSS('translate', '0px');
	});

	test('undefined should default to both', async ({ page }) => {
		await setup(page, 'options/axis', { axis: undefined });

		const div = page.getByTestId('draggable');

		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await page.mouse.up();

		// Only X should have changed
		await expect(div).toHaveCSS('translate', '100px 100px');
	});
});

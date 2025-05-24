import { expect, test } from '@playwright/test';
import { get_mouse_position, setup } from './test-utils';
import { SCHEMAS } from '../src/lib/schemas';

test('undefined-to-plugin', async ({ page }) => {
	await setup(page, 'compartment', SCHEMAS.COMPARTMENT, 'undefined-to-plugin');

	const div = page.getByTestId('draggable');

	await div.hover();
	const { x, y } = await get_mouse_position(page);
	await page.mouse.down();
	await page.mouse.move(x + 100, y + 100);
	await page.mouse.up();

	// Only X should have changed
	await expect(div).toHaveCSS('translate', '100px 100px');

	// Switcheroo
	const switcheroo = page.getByTestId('switcheroo');
	await switcheroo.click();

	// Should have moved to the hardcoded points
	// Only X should have changed
	await expect(div).toHaveCSS('translate', '450px 300px');
});

test('plugin-func-to-undefined', async ({ page }) => {
	await setup(page, 'compartment', SCHEMAS.COMPARTMENT, 'plugin-func-to-undefined');

	const div = page.getByTestId('draggable');

	await div.hover();
	const { x, y } = await get_mouse_position(page);
	await page.mouse.down();
	await page.mouse.move(x + 100, y + 100);
	await page.mouse.up();

	// Only X should have changed
	await expect(div).toHaveCSS('translate', '100px');

	// Switcheroo
	const switcheroo = page.getByTestId('switcheroo');
	await switcheroo.click();

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await page.mouse.up();
	}

	// Should have moved to the hardcoded points
	// Only X should have changed
	await expect(div).toHaveCSS('translate', '200px 100px');
});

test('plugin-func-to-plugin', async ({ page }) => {
	await setup(page, 'compartment', SCHEMAS.COMPARTMENT, 'plugin-func-to-plugin');

	const div = page.getByTestId('draggable');

	await div.hover();
	const { x, y } = await get_mouse_position(page);
	await page.mouse.down();
	await page.mouse.move(x + 100, y + 100);
	await page.mouse.up();

	// Only X should have changed
	await expect(div).toHaveCSS('translate', '100px');

	// Switcheroo
	const switcheroo = page.getByTestId('switcheroo');
	await switcheroo.click();

	// Should have moved to the hardcoded points
	// Only X should have changed
	await expect(div).toHaveCSS('translate', '450px 300px');
});

import test, { expect } from '@playwright/test';
import { get_mouse_position, setup } from './test-utils';
import { SCHEMAS } from '../src/lib/schemas';

test('auto', async ({ page }) => {
	await setup(page, 'mode', SCHEMAS.MODE, {
		type: 'auto',
	});

	const div = page.getByTestId('draggable');
	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await expect(div).toHaveCSS('translate', '100px');
		await page.mouse.up();
	}

	// Now change the axes
	// const x_radio = page.locator('#x');
	const y_radio = page.locator('#y');

	// Click on y_radio
	await y_radio.click();

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await expect(div).toHaveCSS('translate', '100px 100px');
		await page.mouse.up();
	}

	// Change Grid Y
	const y_grid = page.locator('#grid_y');

	await y_grid.fill('100');

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 130);
		await expect(div).toHaveCSS('translate', '100px 300px');
		await page.mouse.up();
	}
});

test('manual-false', async ({ page }) => {
	await setup(page, 'mode', SCHEMAS.MODE, {
		type: 'manual',
		works_in_manual: false,
	});

	const div = page.getByTestId('draggable');
	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await expect(div).toHaveCSS('translate', '100px');
		await page.mouse.up();
	}

	// Now change the axes
	// const x_radio = page.locator('#x');
	const y_radio = page.locator('#y');

	// Click on y_radio
	await y_radio.click();

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await expect(div).toHaveCSS('translate', '200px');
		await page.mouse.up();
	}

	// Change Grid Y
	const y_grid = page.locator('#grid_y');

	await y_grid.fill('100');

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 130);
		await expect(div).toHaveCSS('translate', '300px');
		await page.mouse.up();
	}
});

test('manual-true', async ({ page }) => {
	await setup(page, 'mode', SCHEMAS.MODE, {
		type: 'manual',
		works_in_manual: true,
	});

	const div = page.getByTestId('draggable');
	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await expect(div).toHaveCSS('translate', '100px');
		await page.mouse.up();
	}

	// Now change the axes
	// const x_radio = page.locator('#x');
	const y_radio = page.locator('#y');

	// Click on y_radio
	await y_radio.click();

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 100);
		await expect(div).toHaveCSS('translate', '100px 100px');
		await page.mouse.up();
	}

	// Change Grid Y
	const y_grid = page.locator('#grid_y');

	await y_grid.fill('100');

	{
		await div.hover();
		const { x, y } = await get_mouse_position(page);
		await page.mouse.down();
		await page.mouse.move(x + 100, y + 130);
		await expect(div).toHaveCSS('translate', '100px 300px');
		await page.mouse.up();
	}
});

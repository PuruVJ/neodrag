import { Page } from '@playwright/test';
import { stringify } from 'devalue';
import { ZodSchema, infer } from 'zod';

export function get_mouse_position(page: Page) {
	return page.evaluate(() => {
		return {
			// @ts-ignore
			x: window.mouseX,
			// @ts-ignore
			y: window.mouseY,
		};
	});
}

/**
 * Move the mouse back and forth so the event listeners in the page can track mouse position, and detect it
 */
async function shake_mouse(page: Page) {
	await page.mouse.move(1000, 1000);
	await page.mouse.click(1000, 1000);
	await page.mouse.move(1001, 1001);
	await page.mouse.click(1000, 1000);
	await page.mouse.move(1000, 1000);
}

export async function setup<T>(
	page: Page,
	path = 'defaults',
	schema: ZodSchema<T>,
	options: ZodSchema<T>['_output'] | undefined = undefined,
) {
	const validated = schema.parse(options);
	console.log('GOING TO: ', `/${path}?options=${stringify(validated)}`);
	await page.goto(`/${path}?options=${stringify(options)}`);
	await page.waitForLoadState('domcontentloaded');
	await shake_mouse(page);
}

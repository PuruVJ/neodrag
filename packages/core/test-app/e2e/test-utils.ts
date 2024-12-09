import { Page } from '@playwright/test';
import { stringify } from 'devalue';
import { DragOptions } from '../../src';

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

export async function setup(page: Page, path = 'defaults', options: DragOptions = {}) {
	await page.goto(`/${path}?options=${stringify(options)}`);
	await page.waitForLoadState('domcontentloaded');
	await shake_mouse(page);
}

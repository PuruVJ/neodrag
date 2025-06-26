/// <reference types="@vitest/browser/providers/playwright" />
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

import type { BrowserCommand } from 'vitest/node';

/**
 * Mouse down command using official Vitest Commands API
 */
const mouseDown: BrowserCommand<[number, number, string?]> = async (
	ctx,
	x: number,
	y: number,
	button: string = 'left',
) => {
	const page = ctx.page;
	await page.mouse.move(x, y);
	await page.mouse.down({ button: button as any });
};

/**
 * Mouse up command using official Vitest Commands API
 */
const mouseUp: BrowserCommand<[number, number, string?]> = async (
	ctx,
	x: number,
	y: number,
	button: string = 'left',
) => {
	const page = ctx.page;
	await page.mouse.move(x, y);
	await page.mouse.up({ button: button as any });
};

/**
 * Mouse move command using official Vitest Commands API
 */
const mouseMove: BrowserCommand<[number, number, number?]> = async (
	ctx,
	x: number,
	y: number,
	steps?: number,
) => {
	const page = ctx.page;
	await page.mouse.move(x, y, { steps });
};

/**
 * Mouse click command using official Vitest Commands API
 */
const mouseClick: BrowserCommand<[number, number, string?, number?]> = async (
	ctx,
	x: number,
	y: number,
	button: string = 'left',
	delay?: number,
) => {
	const page = ctx.page;
	await page.mouse.click(x, y, { button: button as any, delay });
};

/**
 * Mouse double click command using official Vitest Commands API
 */
const mouseDoubleClick: BrowserCommand<[number, number, string?]> = async (
	ctx,
	x: number,
	y: number,
	button: string = 'left',
) => {
	const page = ctx.page;
	await page.mouse.dblclick(x, y, { button: button as any });
};

/**
 * Mouse wheel command using official Vitest Commands API
 */
const mouseWheel: BrowserCommand<[number, number]> = async (
	ctx,
	deltaX: number,
	deltaY: number,
) => {
	const page = ctx.page;
	await page.mouse.wheel(deltaX, deltaY);
};

/**
 * Get mouse position command (returns tracked position from browser)
 */
const getMousePosition: BrowserCommand<[]> = async () => {
	// This will call the browser-side tracking function
	const result = await (globalThis as any).getTrackedMousePosition?.();
	return result || { x: 0, y: 0, message: 'Mouse position tracking not initialized' };
};

/**
 * Drag and drop command using official Vitest Commands API
 */
const mouseDragAndDrop: BrowserCommand<[number, number, number, number, number?]> = async (
	ctx,
	fromX: number,
	fromY: number,
	toX: number,
	toY: number,
	steps?: number,
) => {
	const page = ctx.page;

	// Move to start position
	await page.mouse.move(fromX, fromY);
	// Mouse down
	await page.mouse.down();
	// Move to end position with steps for smooth dragging
	await page.mouse.move(toX, toY, { steps: steps || 10 });
	// Mouse up
	await page.mouse.up();
};

export default defineConfig({
	plugins: [svelte()],
	optimizeDeps: {
		exclude: ['chromium-bidi', 'fsevents'],
	},
	test: {
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [
				{
					browser: 'chromium',
				},
				{ browser: 'firefox' },
				{ browser: 'webkit' },
			],
			commands: {
				mouseDown,
				mouseUp,
				mouseMove,
				mouseClick,
				mouseDoubleClick,
				mouseWheel,
				getMousePosition,
				mouseDragAndDrop,
			},
		},

		coverage: {
			provider: 'v8',
		},

		testTimeout: 5000,
		// retry: 2,
		include: ['./tests/*.test.ts', './tests/*.test.svelte.ts'],
	},
});

import { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	applyUserSelectHack,
	axis,
	bounds,
	BoundsFrom,
	ControlFrom,
	controls,
	transform,
} from '../src/plugins';
import Bounds from './components/Bounds.svelte';
import Box from './components/Box.svelte';
import Controls from './components/Controls.svelte';
import {
	dragAndDrop,
	mouseDown,
	mouseMove,
	mouseUp,
	startCursorTracking,
	stopCursorTracking,
} from './mouse';
import { sleepAndWaitForEffects, translate } from './utils';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('applyUserSelectHack', () => {
	let draggable: Locator;

	beforeEach(() => {
		// Force clean state before each test
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';

		// Clear any existing styles that might interfere
		document.body.removeAttribute('style');
	});

	describe('true', async () => {
		beforeEach(async () => {
			const comp = render(Box, {
				default_plugins: [transform()],
				plugins: [applyUserSelectHack(true)],
			});
			draggable = comp.getByTestId('draggable');

			await sleepAndWaitForEffects(50);
		});

		it('should not have user-select: none while not dragging', async () => {
			const is_safari = navigator.userAgent.toLowerCase().includes('safari');

			await expect
				.element(document.body)
				.not.toHaveStyle(is_safari ? '-webkit-user-select: none' : 'user-select: none');
		});

		it('should have user-select: none while dragging', async () => {
			const is_safari = navigator.userAgent.toLowerCase().includes('safari');

			await mouseDown(draggable);
			await mouseMove(100, 100);
			await expect
				.element(document.body)
				.toHaveStyle(is_safari ? '-webkit-user-select: none' : 'user-select: none');

			await mouseUp(draggable);

			await expect
				.element(document.body)
				.not.toHaveStyle(is_safari ? '-webkit-user-select: none' : 'user-select: none');
		});
	});

	describe('false', async () => {
		beforeEach(async () => {
			const comp = render(Box, {
				default_plugins: [transform()],
				plugins: [applyUserSelectHack(false)],
			});
			draggable = comp.getByTestId('draggable');

			await sleepAndWaitForEffects(50);
		});

		it('should not have user-select: none while not dragging', async () => {
			const is_safari = navigator.userAgent.toLowerCase().includes('safari');

			await expect
				.element(document.body)
				.not.toHaveStyle(is_safari ? '-webkit-user-select: none' : 'user-select: none');
		});

		it('should not have user-select: none while dragging', async () => {
			const is_safari = navigator.userAgent.toLowerCase().includes('safari');

			await mouseDown(draggable);
			await mouseMove(100, 100);

			await expect
				.element(document.body)
				.not.toHaveStyle(is_safari ? '-webkit-user-select: none' : 'user-select: none');

			await mouseUp(draggable);

			await expect
				.element(document.body)
				.not.toHaveStyle(is_safari ? '-webkit-user-select: none' : 'user-select: none');
		});
	});
});

describe('axis', () => {
	let draggable: Locator;

	describe('x', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [axis('x')],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move only on x-axis', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 0));
		});
	});

	describe('x', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [axis('y')],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move only on x-axis', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(0, 100));
		});
	});

	describe('undefined', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [axis()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move only on x-axis', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('null', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [axis(null)],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move only on x-axis', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});
});

describe('bounds', () => {
	let draggable: Locator;

	describe('element', () => {
		beforeEach(async () => {
			const comp = render(Bounds, {
				plugins: [],
				type: 'element',
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 10X10 and stay within bounds', async () => {
			await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });

			await expect.element(draggable).toHaveStyle(translate(10, 10));
		});

		it('should move 210X210 and stay within bounds', async () => {
			await dragAndDrop(draggable, { deltaX: 210, deltaY: 210 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should move back -200X-200 and stay within bounds', async () => {
			await dragAndDrop(draggable, { deltaX: -210, deltaY: -210 });

			await expect.element(draggable).toHaveStyle(translate(0, 0));
		});

		it('should error when bounds are smaller than element', async () => {
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const comp = render(Bounds, {
				plugins: [],
				type: 'element',
				is_smaller_than_element: true,
			});
			draggable = comp.getByTestId('draggable');

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('viewport', () => {
		beforeEach(async () => {
			const comp = render(Bounds, {
				plugins: [bounds(BoundsFrom.viewport())],
				type: 'viewport',
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 10X10 and stay within bounds', async () => {
			await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });

			await expect.element(draggable).toHaveStyle(translate(10, 10));
		});

		it('should stay within bounds in all directions', async () => {
			const viewport = { width: window.innerWidth, height: window.innerHeight };

			const { y } = draggable.element().getBoundingClientRect();

			await dragAndDrop(draggable, { deltaX: viewport.width, deltaY: viewport.width - y });

			await expect
				.element(draggable)
				.toHaveStyle(translate(viewport.width - 100, viewport.width - y));
		});
	});

	describe('selector', () => {
		beforeEach(async () => {
			const comp = render(Bounds, {
				plugins: [bounds(BoundsFrom.selector('.selector'))],
				type: 'selector',
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 10X10 and stay within bounds', async () => {
			await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });

			await expect.element(draggable).toHaveStyle(translate(10, 10));
		});

		it('should stay within bounds in all directions', async () => {
			await dragAndDrop(draggable, { deltaX: 200, deltaY: 800 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('parent', () => {
		beforeEach(async () => {
			const comp = render(Bounds, {
				plugins: [bounds(BoundsFrom.parent())],
				type: 'parent',
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 10X10 and stay within bounds', async () => {
			await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });

			await expect.element(draggable).toHaveStyle(translate(10, 10));
		});

		it('should stay within bounds in all directions', async () => {
			await dragAndDrop(draggable, { deltaX: 210, deltaY: 210 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should try to move outside parent and stay within bounds in all directions', async () => {
			await dragAndDrop(draggable, { deltaX: -310, deltaY: -310 });

			await expect.element(draggable).toHaveStyle(translate(0, 0));
		});
	});

	describe('undefined|null', () => {
		it.todo('should not work');
	});
});

describe('controls', () => {
	let draggable: Locator;

	describe('undefined disables the plugin', () => {
		let handle: Locator;
		let cancel: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [controls()],
			});
			draggable = comp.getByTestId('draggable');

			handle = comp.getByTestId('handle');
			cancel = comp.getByTestId('cancel');
		});

		it('should move from anywhere in the box', async () => {
			// Centre, so out of the handle cancel
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
		});

		it('should move from the handle', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should move from the cancel', async () => {
			await dragAndDrop(cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('null disables the plugin', () => {
		let handle: Locator;
		let cancel: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [controls(null)],
			});
			draggable = comp.getByTestId('draggable');

			handle = comp.getByTestId('handle');
			cancel = comp.getByTestId('cancel');
		});

		it('should move from anywhere in the box', async () => {
			// Centre, so out of the handle cancel
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
		});

		it('should move from the handle', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should move from the cancel', async () => {
			await dragAndDrop(cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('allow-only', () => {
		let handle: Locator;
		let cancel: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [controls({ allow: ControlFrom.selector('[data-testid="handle"]') })],
			});
			draggable = comp.getByTestId('draggable');

			handle = comp.getByTestId('handle');
			cancel = comp.getByTestId('cancel');
		});

		it('should not move from anywhere in the box', async () => {
			// Centre, so out of the handle cancel
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should only move from the handle', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from the cancel', async () => {
			await dragAndDrop(cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});

	describe('block-only', () => {
		let handle: Locator;
		let cancel: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [controls({ block: ControlFrom.selector('[data-testid="cancel"]') })],
			});
			draggable = comp.getByTestId('draggable');

			handle = comp.getByTestId('handle');
			cancel = comp.getByTestId('cancel');
		});

		it('should move from anywhere in the box', async () => {
			// Centre, so out of the handle cancel
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should move from the handle', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from the cancel', async () => {
			await dragAndDrop(cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});

	describe('allow-block', () => {
		let handle: Locator;
		let cancel: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						allow: ControlFrom.selector('[data-testid="handle"]'),
						block: ControlFrom.selector('[data-testid="cancel"]'),
					}),
				],
				priority_type: 'allow-block',
			});
			draggable = comp.getByTestId('draggable');

			handle = comp.getByTestId('handle');
			cancel = comp.getByTestId('cancel');
		});

		it('should not move from anywhere in the box', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should move from the handle', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from the cancel', async () => {
			await dragAndDrop(cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});

	describe('allow-block-allow', () => {
		let handle_text: Locator;
		let handle2: Locator;
		let cancel_text: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						allow: ControlFrom.selector('[data-testid="handle"], [data-testid="handle2"]'),
						block: ControlFrom.selector('[data-testid="cancel"]'),
						priority: 'allow',
					}),
				],
				priority_type: 'allow-block-allow',
			});
			draggable = comp.getByTestId('draggable');

			handle_text = comp.getByTestId('handle-text');
			cancel_text = comp.getByTestId('cancel-text');
			handle2 = comp.getByTestId('handle2');
		});

		it('should not move from anywhere in the box', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should move by handle_text', async () => {
			await dragAndDrop(handle_text, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should not move from the cancel_text', async () => {
			await dragAndDrop(cancel_text, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should move by handle2', async () => {
			await dragAndDrop(handle2, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('block-allow-block', () => {
		let outer_text: Locator;
		let inner_cancel: Locator;
		let middle_text: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						allow: ControlFrom.selector('[data-testid="middle-handle"]'),
						block: ControlFrom.selector(
							'[data-testid="outer-cancel"], [data-testid="inner-cancel"]',
						),
						priority: 'block',
					}),
				],
				priority_type: 'block-allow-block',
			});
			draggable = comp.getByTestId('draggable');

			outer_text = comp.getByTestId('outer-text');
			inner_cancel = comp.getByTestId('inner-cancel');
			middle_text = comp.getByTestId('middle-text');
		});

		it('should not move from anywhere in the box', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should not move by outer_text', async () => {
			await dragAndDrop(outer_text, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should move by middle-handle', async () => {
			await dragAndDrop(middle_text, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should not move from the inner-cancel', async () => {
			await dragAndDrop(inner_cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});
});

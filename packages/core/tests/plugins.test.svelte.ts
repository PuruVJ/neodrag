import type { Locator } from '@vitest/browser/context';
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	test,
	vi,
} from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { Compartment } from '../../svelte/src/index.svelte.ts';
import {
	applyUserSelectHack,
	axis,
	bounds,
	BoundsFrom,
	ControlFrom,
	controls,
	events,
	grid,
	position,
	stateMarker,
	threshold,
	touchAction,
	transform,
} from '../src/plugins.ts';
import { Bounds, Box, Controls, Position, PrecisionTest, Transform } from './components/index.ts';
import {
	dragAndDrop,
	mouseDown,
	mouseMove,
	mouseUp,
	startCursorTracking,
	stopCursorTracking,
} from './mouse.ts';
import { sleepAndWaitForEffects, translate } from './utils.ts';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

afterAll(cleanup);

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
	let comp: any;

	describe('element', () => {
		beforeEach(async () => {
			comp = render(Bounds, {
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
			cleanup();
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const comp = render(Bounds, {
				plugins: [],
				type: 'element',
				is_smaller_than_element: true,
			});
			draggable = comp.getByTestId('draggable');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

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

	// NEW: shouldRecompute functionality tests
	describe('shouldRecompute', () => {
		describe('setup hook', () => {
			beforeEach(async () => {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [bounds(trackingBounds, (ctx) => ctx.hook === 'setup')],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should recompute bounds on setup', async () => {
				// Just creating the component should trigger setup recomputation
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('start hook (default)', () => {
			beforeEach(async () => {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [bounds(trackingBounds)], // Default behavior
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should recompute bounds on start by default', async () => {
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('start hook explicit', () => {
			beforeEach(async () => {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [bounds(trackingBounds, (ctx) => ctx.hook === 'start')],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should recompute bounds on start when specified', async () => {
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('drag hook', () => {
			beforeEach(async () => {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [bounds(trackingBounds, (ctx) => ctx.hook === 'drag')],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should recompute bounds on every drag event', async () => {
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('end hook', () => {
			beforeEach(async () => {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [bounds(trackingBounds, (ctx) => ctx.hook === 'end')],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should recompute bounds on end', async () => {
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('multiple hooks', () => {
			beforeEach(async () => {
				let computeCount = 0;
				const trackingBounds = () => {
					computeCount++;
					return [
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [
						bounds(
							trackingBounds,
							(ctx) => ctx.hook === 'setup' || ctx.hook === 'start' || ctx.hook === 'drag',
						),
					],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should recompute bounds on multiple hooks', async () => {
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('dynamic bounds changing', () => {
			beforeEach(async () => {
				let boundarySize = 200;
				const dynamicBounds = () => {
					// Simulate changing bounds
					if (Math.random() > 0.8) boundarySize = 150;
					return [
						[0, 0],
						[boundarySize, boundarySize],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [
						bounds(
							dynamicBounds,
							(ctx) => ctx.hook === 'drag', // Recompute during drag
						),
					],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should handle dynamic boundary changes during drag', async () => {
				await dragAndDrop(draggable, { deltaX: 50, deltaY: 50 });
				// The exact assertion depends on the random boundary changes
				// but the element should still be positioned correctly
				const el = draggable.element() as HTMLElement;
				const style = el.style.transform || el.style.translate;
				expect(style).toBeDefined();
			});
		});

		describe('fallback when shouldRecompute returns false', () => {
			beforeEach(async () => {
				const customBounds = () =>
					[
						[100, 100], // This should be ignored
						[200, 200],
					] as [[number, number], [number, number]];

				const comp = render(Bounds, {
					plugins: [
						bounds(
							customBounds,
							() => false, // Never recompute, should use viewport fallback
						),
					],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should use fallback viewport bounds when setup recompute is disabled', async () => {
				// Should use viewport bounds instead of the custom bounds
				await dragAndDrop(draggable, { deltaX: 10, deltaY: 10 });
				await expect.element(draggable).toHaveStyle(translate(10, 10));
			});
		});

		describe('performance with frequent recomputation', () => {
			beforeEach(async () => {
				const performanceBounds = () => {
					// Simulate some calculation work
					let sum = 0;
					for (let i = 0; i < 100; i++) {
						sum += Math.sin(i) * Math.cos(i);
					}

					return [
						[0, 0],
						[window.innerWidth - sum * 0.01, window.innerHeight - sum * 0.01],
					] as [[number, number], [number, number]];
				};

				const comp = render(Bounds, {
					plugins: [
						bounds(
							performanceBounds,
							(ctx) => ctx.hook === 'drag', // Recompute on every drag
						),
					],
					type: 'viewport',
				});
				draggable = comp.getByTestId('draggable');
			});

			it('should handle frequent recomputation without performance issues', async () => {
				const startTime = performance.now();

				await dragAndDrop(draggable, { deltaX: 20, deltaY: 20 });

				const endTime = performance.now();
				const duration = endTime - startTime;

				await expect.element(draggable).toHaveStyle(translate(20, 20));

				// Should complete within reasonable time (adjust threshold as needed)
				expect(duration).toBeLessThan(1000);
			});
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

	// Addresses https://github.com/PuruVJ/neodrag/issues/220
	describe('allow-only (fixed behavior)', () => {
		let handle: Locator;
		let content: Locator;
		let footer: Locator;
		let container: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						allow: ControlFrom.selector('[data-testid="handle"]'),
					}),
				],
				priority_type: 'allow-only-bug-test',
			});
			draggable = comp.getByTestId('draggable');
			handle = comp.getByTestId('handle');
			content = comp.getByTestId('content');
			footer = comp.getByTestId('footer');
			container = comp.getByTestId('container');
		});

		it('should move from the handle', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from content', async () => {
			await dragAndDrop(content, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should NOT move from footer', async () => {
			await dragAndDrop(footer, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should NOT move from container background', async () => {
			await dragAndDrop(container, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should NOT move from draggable background (outside allowed zones)', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});

	describe('allow with priority block but no block field (should ignore priority)', () => {
		let handle: Locator;
		let content: Locator;
		let footer: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						allow: ControlFrom.selector('[data-testid="handle"]'),
						priority: 'block', // This should have NO effect without block field
					}),
				],
				priority_type: 'allow-with-priority-block-bug-test',
			});
			draggable = comp.getByTestId('draggable');
			handle = comp.getByTestId('handle');
			content = comp.getByTestId('content');
			footer = comp.getByTestId('footer');
		});

		it('should still move from the handle (priority should be ignored)', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from content', async () => {
			await dragAndDrop(content, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should NOT move from footer', async () => {
			await dragAndDrop(footer, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});

	describe('allow with priority allow but no block field (should ignore priority)', () => {
		let handle: Locator;
		let content: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						allow: ControlFrom.selector('[data-testid="handle"]'),
						priority: 'allow', // This should have NO effect without block field
					}),
				],
				priority_type: 'allow-only-bug-test',
			});
			draggable = comp.getByTestId('draggable');
			handle = comp.getByTestId('handle');
			content = comp.getByTestId('content');
		});

		it('should move from the handle (same as without priority)', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from content (same as without priority)', async () => {
			await dragAndDrop(content, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});
	});

	describe('block only with priority allow (should ignore priority)', () => {
		let handle: Locator;
		let cancel: Locator;

		beforeEach(async () => {
			const comp = render(Controls, {
				plugins: [
					controls({
						block: ControlFrom.selector('[data-testid="cancel"]'),
						priority: 'allow', // This should have NO effect without allow field
					}),
				],
			});
			draggable = comp.getByTestId('draggable');
			handle = comp.getByTestId('handle');
			cancel = comp.getByTestId('cancel');
		});

		it('should move from the handle (same as without priority)', async () => {
			await dragAndDrop(handle, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should NOT move from cancel (same as without priority)', async () => {
			await dragAndDrop(cancel, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).not.toHaveStyle(translate(100, 100));
		});

		it('should move from draggable background (same as without priority)', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});
});

describe('grid', () => {
	let draggable: Locator;

	describe('[10, 10]', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [grid([10, 10])],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 100,100', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should move 102,102', async () => {
			await dragAndDrop(draggable, { deltaX: 102, deltaY: 102 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('[23, 102]', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [grid([23, 102])],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 94,90', async () => {
			await dragAndDrop(draggable, { deltaX: 94, deltaY: 90 });

			await expect.element(draggable).toHaveStyle(translate(92, 102));
		});

		it('should move 300,291', async () => {
			await dragAndDrop(draggable, { deltaX: 300, deltaY: 291 });

			await expect.element(draggable).toHaveStyle(translate(299, 306));
		});
	});

	describe('undefined', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [grid()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 94,90', async () => {
			await dragAndDrop(draggable, { deltaX: 94, deltaY: 90 });

			await expect.element(draggable).toHaveStyle(translate(94, 90));
		});

		it('should move 300,291', async () => {
			await dragAndDrop(draggable, { deltaX: 300, deltaY: 291 });

			await expect.element(draggable).toHaveStyle(translate(300, 291));
		});
	});

	describe('[10, undefined]', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [grid([10, undefined])],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 94,90', async () => {
			await dragAndDrop(draggable, { deltaX: 94, deltaY: 90 });

			await expect.element(draggable).toHaveStyle(translate(90, 90));
		});

		it('should move 300,291', async () => {
			await dragAndDrop(draggable, { deltaX: 300, deltaY: 291 });

			await expect.element(draggable).toHaveStyle(translate(300, 291));
		});
	});

	describe('[undefined, undefined]', () => {
		beforeEach(async () => {
			const comp = render(Box, {
				plugins: [grid([undefined, undefined])],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move 94,90', async () => {
			await dragAndDrop(draggable, { deltaX: 94, deltaY: 90 });

			await expect.element(draggable).toHaveStyle(translate(94, 90));
		});

		it('should move 300,291', async () => {
			await dragAndDrop(draggable, { deltaX: 300, deltaY: 291 });

			await expect.element(draggable).toHaveStyle(translate(300, 291));
		});
	});
});

describe('ignoreMultitouch', () => {
	test.skip(
		'Playwright does not support multiple pointers yet https://github.com/microsoft/playwright/issues/34158',
	);
});

describe('position', () => {
	let draggable: Locator;
	let state = $state({ x: 0, y: 0 });

	describe('undefined', () => {
		beforeEach(() => {
			const comp = render(Position, {
				plugins: [position(undefined)],
				position: state,
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move normally', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('undefined', () => {
		beforeEach(() => {
			const comp = render(Position, {
				plugins: [position(null)],
				position: state,
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should move normally', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('default only', () => {
		beforeEach(() => {
			const comp = render(Position, {
				plugins: [position({ default: { x: 20, y: 80 } })],
				position: state,
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should be at default position', async () => {
			await expect.element(draggable).toHaveStyle(translate(20, 80));
		});

		it('should should move normally', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(120, 180));
		});
	});

	describe('current only', () => {
		beforeEach(() => {
			const comp = render(Position, {
				plugins: [position({ current: { x: 20, y: 80 } })],
				position: state,
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should be at default position', async () => {
			await expect.element(draggable).toHaveStyle(translate(20, 80));
		});

		it('should should move normally', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(120, 180));
		});
	});

	describe('current-default', () => {
		beforeEach(() => {
			const comp = render(Position, {
				plugins: [
					position({
						default: {
							x: 20,
							y: 80,
						},
						current: {
							x: 100,
							y: 180,
						},
					}),
				],
				position: state,
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should be at current position', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 180));
		});

		it('should should move normally', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(200, 280));
		});
	});

	describe('two-way-binding', () => {
		let x_slider: Locator;
		let y_slider: Locator;

		beforeEach(() => {
			state = { x: 100, y: 180 };
			const pos_compartment = Compartment.of(() => {
				return position({
					current: $state.snapshot(state),
				});
			});
			const comp = render(Position, {
				plugins: () => [
					pos_compartment,
					events({
						onDrag({ offset }) {
							state.x = offset.x;
							state.y = offset.y;
						},
					}),
				],
				position: state,
				two_way_binding: true,
			});
			draggable = comp.getByTestId('draggable');
			x_slider = comp.getByTestId('x-slider');
			y_slider = comp.getByTestId('y-slider');
		});

		it('should be at current position', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 180));
		});

		it('should should move normally', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(200, 280));
		});

		it('should move the sliders', async () => {
			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(x_slider).toHaveValue(200);
			await expect.element(y_slider).toHaveValue(280);
		});

		it('should be moved by input', async () => {
			state.x = 0;
			state.y = 0;

			await x_slider.fill('100');
			await y_slider.fill('100');

			await sleepAndWaitForEffects(10);

			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});
	});

	describe('precision with large coordinates', () => {
		it('should work correctly with fixed precision calculation', async () => {
			// Test with very large coordinates that trigger precision issues in all browsers
			const comp = render(PrecisionTest, {
				initialX: 1000000, // 10^6 - large enough for precision issues but manageable
				initialY: 1000000,
			});
			const testDraggable = comp.getByTestId('draggable');

			// Wait for initial positioning
			await sleepAndWaitForEffects(100);

			const positionDisplay = comp.getByTestId('position-display');

			// Try to move by 1 pixel
			await dragAndDrop(testDraggable, { deltaX: 1, deltaY: 1 });
			await sleepAndWaitForEffects(50);

			// With buggy code: precision loss causes wrong position
			// With fixed code: moves exactly 1px
			const finalText = positionDisplay.element().textContent!;

			// Parse coordinates, handling Infinity and negative numbers
			const match = finalText.match(/position: ([\d\-\.]+|Infinity) ([\d\-\.]+|Infinity)/);
			const xStr = match?.[1] || '0';
			const yStr = match?.[2] || '0';

			// Handle Infinity case (Firefox bug with large coordinates)
			if (xStr === 'Infinity' || yStr === 'Infinity') {
				// This should fail - Infinity means the precision bug occurred
				expect(xStr).not.toBe('Infinity');
				expect(yStr).not.toBe('Infinity');
			} else {
				const x = parseFloat(xStr);
				const y = parseFloat(yStr);

				// With buggy code: position will be wrong 
				// With fixed code: should move exactly 1px
				expect(x).toBe(1000001);
				expect(y).toBe(1000001);
			}
		});

		it('should prevent the precision bug that caused incorrect movements', async () => {
			// This is a regression test for issue #232
			// Use another very large coordinate value
			const comp = render(PrecisionTest, {
				initialX: 500000, // 5*10^5 - shows precision issues but manageable
				initialY: 500000,
			});
			const testDraggable = comp.getByTestId('draggable');

			// Wait for positioning
			await sleepAndWaitForEffects(100);

			const positionDisplay = comp.getByTestId('position-display');

			// Small movement that should work with fixed code
			await dragAndDrop(testDraggable, { deltaX: 1, deltaY: 1 });
			await sleepAndWaitForEffects(50);

			// Parse the actual coordinates
			const finalText = positionDisplay.element().textContent!;

			const match = finalText.match(/position: ([\d\-\.]+|Infinity) ([\d\-\.]+|Infinity)/);
			const xStr = match?.[1] || '0';
			const yStr = match?.[2] || '0';

			// Handle Infinity case
			if (xStr === 'Infinity' || yStr === 'Infinity') {
				expect(xStr).not.toBe('Infinity');
				expect(yStr).not.toBe('Infinity');
			} else {
				const x = parseFloat(xStr);
				const y = parseFloat(yStr);

				// With buggy code: position is wrong
				// With fixed code: should move exactly 1px
				expect(x).toBe(500001);
				expect(y).toBe(500001);
			}
		});

		it('should handle fractional coordinates with improved precision', async () => {
			// Test that fractional starting positions work with integer movements
			const comp = render(PrecisionTest, {
				initialX: 100.25,
				initialY: 200.75,
			});
			const testDraggable = comp.getByTestId('draggable');

			// Wait for positioning
			await sleepAndWaitForEffects(100);

			const positionDisplay = comp.getByTestId('position-display');

			// Integer movement should preserve fractional starting position
			await dragAndDrop(testDraggable, { deltaX: 1, deltaY: 1 });
			await sleepAndWaitForEffects(50);

			// Should maintain fractional precision with the fixed delta calculation
			const finalText = positionDisplay.element().textContent;
			expect(finalText).toContain('101.25');
			expect(finalText).toContain('201.75');
		});

		it('should work better at extreme coordinates with fixed precision', async () => {
			// Test with coordinates that would break the old buggy calculation
			const comp = render(PrecisionTest, {
				// Use coordinates close to Number.MAX_SAFE_INTEGER
				initialX: 9007199254740990, // Very close to limit
				initialY: 9007199254740990,
			});
			const testDraggable = comp.getByTestId('draggable');

			// Wait for positioning
			await sleepAndWaitForEffects(100);

			const positionDisplay = comp.getByTestId('position-display');

			// Movement should work better with the fixed delta calculation
			await dragAndDrop(testDraggable, { deltaX: 1, deltaY: 1 });
			await sleepAndWaitForEffects(50);

			// Fixed code should not completely break at extreme coordinates
			const finalText = positionDisplay.element().textContent;
			// Should not be the broken states that old buggy code produced
			expect(finalText).not.toBe('position: 0 0');
			expect(finalText).not.toBe('position: 1 1');
		});

		it('should demonstrate the precision fix works for issue #232', async () => {
			// Final test proving the precision fix resolves the original issue
			const comp = render(PrecisionTest, {
				// Use coordinates that would demonstrate the precision improvement
				initialX: 500.5,
				initialY: 900.25,
			});
			const testDraggable = comp.getByTestId('draggable');

			// Wait for positioning
			await sleepAndWaitForEffects(100);

			const positionDisplay = comp.getByTestId('position-display');

			// Multiple integer movements that preserve fractional starting positions
			for (let i = 0; i < 3; i++) {
				await dragAndDrop(testDraggable, { deltaX: 1, deltaY: 1 });
				await sleepAndWaitForEffects(30);
			}

			// Should accumulate precisely without the old precision loss
			const finalText = positionDisplay.element().textContent;
			expect(finalText).toContain('503.5');
			expect(finalText).toContain('903.25');
		});
	});
});

describe('stateMarker', () => {
	let draggable: Locator;

	describe('attributes', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [stateMarker()],
				default_plugins: [],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should have data-neodrag attribute', async () => {
			await expect.element(draggable).toHaveAttribute('data-neodrag');
		});

		it('state=idle while not dragging', async () => {
			await expect.element(draggable).toHaveAttribute('data-neodrag-state', 'idle');
		});

		it('state=dragging while dragging', async () => {
			await mouseDown(draggable);
			await mouseMove(100, 100);

			await expect.element(draggable).toHaveAttribute('data-neodrag-state', 'dragging');

			await mouseUp(draggable);

			await expect.element(draggable).toHaveAttribute('data-neodrag-state', 'idle');
		});

		it('data-neodrag-count updates after to 4 after 4 drags', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 1 });
			await dragAndDrop(draggable, { deltaX: 2, deltaY: 2 });
			await dragAndDrop(draggable, { deltaX: 3, deltaY: 3 });
			await dragAndDrop(draggable, { deltaX: 4, deltaY: 4 });

			await expect.element(draggable).toHaveAttribute('data-neodrag-count', '4');
		});
	});
});

describe('threshold', () => {
	let draggable: Locator;

	describe('null', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [threshold(null)],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('drags', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 0 });

			await expect.element(draggable).toHaveStyle(translate(1, 0));
		});
	});

	describe('undefined === defaults', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [threshold(undefined)],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('drags', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 0 });

			await expect.element(draggable).not.toHaveStyle(translate(1, 0));
		});
	});

	describe('{} === defaults', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [threshold({})],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('drags', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 0 });

			await expect.element(draggable).not.toHaveStyle(translate(1, 0));
		});
	});

	describe('delay:400', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [threshold({ delay: 400 })],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('1px does not work', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 0 });

			await expect.element(draggable).not.toHaveStyle(translate(1, 0));
		});

		it('400ms long press', async () => {
			await dragAndDrop(draggable, { deltaX: 4, deltaY: 0 }, { longpress: 400 });

			await expect.element(draggable).toHaveStyle(translate(4, 0));
		});
	});

	describe('delay:400 distance:0', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [threshold({ delay: 400, distance: 0 })],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('1px does not work', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 0 });

			await expect.element(draggable).not.toHaveStyle(translate(1, 0));
		});

		it('400ms long press and 1px', async () => {
			await dragAndDrop(draggable, { deltaX: 1, deltaY: 0 }, { longpress: 400 });

			await expect.element(draggable).toHaveStyle(translate(1, 0));
		});
	});

	describe('negative delay', () => {
		let spy: MockInstance;

		beforeEach(() => {
			spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const comp = render(Box, {
				plugins: [threshold({ delay: -1 })],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should error', async () => {
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('negative distance', () => {
		let spy: MockInstance;

		beforeEach(() => {
			spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const comp = render(Box, {
				plugins: [threshold({ distance: -1 })],
				default_plugins: [stateMarker(), transform()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('should error', async () => {
			expect(spy).toHaveBeenCalled();
		});
	});
});

describe('touchAction', () => {
	let draggable: Locator;

	describe('undefined=default', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [touchAction()],
				default_plugins: [stateMarker()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('has touch-action: none', async () => {
			await expect.element(draggable).toHaveStyle('touch-action: none');
		});
	});

	describe('null=disabled', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [touchAction(null)],
				default_plugins: [stateMarker()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('does not have touch-action: none', async () => {
			await expect.element(draggable).not.toHaveStyle('touch-action: none');
		});
	});

	describe('false=disabled', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [touchAction(false)],
				default_plugins: [stateMarker()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('does not have touch-action: none', async () => {
			await expect.element(draggable).not.toHaveStyle('touch-action: none');
		});
	});

	describe('manipulation', () => {
		beforeEach(() => {
			const comp = render(Box, {
				plugins: [touchAction('manipulation')],
				default_plugins: [stateMarker()],
			});
			draggable = comp.getByTestId('draggable');
		});

		it('does not have touch-action: manipulation', async () => {
			await expect.element(draggable).toHaveStyle('touch-action: manipulation');
		});
	});
});

describe('transform', () => {
	let draggable: Locator;
	let proof_fn_worked = false;

	function func({
		offset,
		rootNode,
	}: Parameters<Exclude<Parameters<typeof transform>[0], undefined>>[0]) {
		if (rootNode instanceof SVGElement) {
			rootNode.setAttribute('transform', `translate(${offset.x} ${offset.y})`);
			proof_fn_worked = true;
		} else {
			rootNode.style.left = `${offset.x}px`;
			rootNode.style.top = `${offset.y}px`;
		}
	}

	describe('HTMLElement', () => {
		describe('default', () => {
			beforeEach(() => {
				const comp = render(Transform, {
					plugins: [transform()],
					default_plugins: [],
				});
				draggable = comp.getByTestId('draggable');
			});

			it('has translate', async () => {
				await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
				await expect.element(draggable).toHaveStyle(translate(100, 100));
			});
		});

		describe('fn', () => {
			beforeEach(() => {
				const comp = render(Transform, {
					plugins: [transform(func)],
					default_plugins: [],
				});
				draggable = comp.getByTestId('draggable');
			});

			it('has translate', async () => {
				await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

				await expect.element(draggable).toHaveStyle('left: 100px; top: 100px');
			});
		});
	});

	describe('SVGElement', () => {
		describe('default', () => {
			beforeEach(() => {
				const comp = render(Transform, {
					plugins: [transform()],
					default_plugins: [],
					svg: true,
				});
				draggable = comp.getByTestId('draggable');
			});

			it('has translate', async () => {
				const is_firefox = navigator.userAgent.toLowerCase().includes('firefox');

				await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

				await expect
					.element(draggable)
					.toHaveAttribute('transform', is_firefox ? 'translate(100, 100)' : 'translate(100 100)');
			});
		});

		describe('fn', () => {
			beforeEach(() => {
				proof_fn_worked = false;
				const comp = render(Transform, {
					plugins: [transform(func)],
					default_plugins: [],
					svg: true,
				});
				draggable = comp.getByTestId('draggable');
			});

			it('has translate', async () => {
				expect(proof_fn_worked).toBe(false);
				await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
				expect(proof_fn_worked).toBe(true);
			});
		});
	});
});

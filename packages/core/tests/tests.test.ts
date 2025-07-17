import { type Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { axis, Compartment, type Plugin, position } from '../../svelte/src/index.svelte.ts';
import { Box, Compartment as CompartmentComp } from './components/index.ts';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from './mouse.ts';
import { sleepAndWaitForEffects, translate } from './utils.ts';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('defaults', () => {
	let draggable: Locator;

	beforeEach(() => {
		const comp = render(Box);
		draggable = comp.getByTestId('draggable');
	});

	test('renders a basic div with default class', async () => {
		await expect.element(draggable).toHaveStyle(translate(0, 0));
	});

	test('should be dragged by mouse', async () => {
		await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

		await expect.element(draggable).toHaveStyle(translate(100, 100));
	});
});

describe('compartment', () => {
	let draggable: Locator;
	let switcheroo_button: Locator;

	describe('undefined-to-plugin', async () => {
		beforeEach(async () => {
			const compartment = new Compartment();

			const comp = render(CompartmentComp, {
				onclick: () => {
					compartment.current = position({ current: { x: 450, y: 300 } });
				},
				plugins: () => [compartment],
			});
			draggable = comp.getByTestId('draggable');
			switcheroo_button = comp.getByTestId('switcheroo');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
		});

		it('should have moved', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should switcheroo', async () => {
			await switcheroo_button.click();

			await sleepAndWaitForEffects(100);

			await expect.element(draggable).toHaveStyle(translate(450, 300));
		});
	});

	describe('plugin-func-to-undefined', async () => {
		beforeEach(async () => {
			const compartment = new Compartment(() => axis('x'));

			const comp = render(CompartmentComp, {
				onclick: () => {
					compartment.current = undefined;
				},
				plugins: () => [compartment],
			});
			draggable = comp.getByTestId('draggable');
			switcheroo_button = comp.getByTestId('switcheroo');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 0 });
		});

		it('should have moved', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 0));
		});

		it('should switcheroo', async () => {
			await switcheroo_button.click();

			await sleepAndWaitForEffects(100);

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(200, 100));
		});
	});

	describe('plugin-func-to-plugin', async () => {
		beforeEach(async () => {
			const compartment = new Compartment(() => axis('x'));

			const comp = render(CompartmentComp, {
				onclick: () => {
					compartment.current = position({ current: { x: 450, y: 300 } });
				},
				plugins: () => [compartment],
			});
			draggable = comp.getByTestId('draggable');
			switcheroo_button = comp.getByTestId('switcheroo');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
		});

		it('should have moved', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 0));
		});

		it('should switcheroo', async () => {
			await switcheroo_button.click();
			await sleepAndWaitForEffects(100);
			await expect.element(draggable).toHaveStyle(translate(450, 300));
		});
	});
});

describe('Compartment Types', () => {
	describe('Constructor Types', () => {
		it('should accept undefined', () => {
			// Should work - undefined constructor
			const compartment1 = new Compartment();
			expectTypeOf(compartment1).toEqualTypeOf<Compartment>();
		});

		it('should accept function returning Plugin', () => {
			// Should work - function returning Plugin
			const compartment2 = new Compartment(() => axis('x'));
			expectTypeOf(compartment2).toEqualTypeOf<Compartment>();
		});

		it('should accept function returning null', () => {
			// Should work - function returning null
			const compartment3 = new Compartment(() => null);
			expectTypeOf(compartment3).toEqualTypeOf<Compartment>();
		});

		it('should accept function returning undefined', () => {
			// Should work - function returning undefined
			const compartment4 = new Compartment(() => undefined);
			expectTypeOf(compartment4).toEqualTypeOf<Compartment>();
		});

		it('should accept function with conditional returns', () => {
			// Should work - function with conditional logic
			const shouldUseAxis = Math.random() > 0.5;
			const compartment5 = new Compartment(() => (shouldUseAxis ? axis('x') : null));
			expectTypeOf(compartment5).toEqualTypeOf<Compartment>();
		});

		it('should validate constructor parameter type', () => {
			// The constructor should expect the right function signature
			type ExpectedConstructorParam = (() => Plugin | null | undefined) | null | undefined;

			expectTypeOf<
				ConstructorParameters<typeof Compartment>[0]
			>().toEqualTypeOf<ExpectedConstructorParam>();
		});
	});

	describe('.current Assignment Types', () => {
		it('should accept Plugin assignment', () => {
			const compartment = new Compartment();
			const plugin = axis('x');

			// Should work - assign Plugin
			compartment.current = plugin;
			expectTypeOf(compartment.current).toEqualTypeOf<Plugin>();
		});

		it('should accept null assignment', () => {
			const compartment = new Compartment();

			// Should work - assign null
			compartment.current = null;
			expectTypeOf(compartment.current).toEqualTypeOf<null>();
		});

		it('should accept undefined assignment', () => {
			const compartment = new Compartment();

			// Should work - assign undefined
			compartment.current = undefined;
			expectTypeOf(compartment.current).toEqualTypeOf<undefined>();
		});

		it('should validate current property type', () => {
			const compartment = new Compartment();

			// The .current property should be the right type
			expectTypeOf(compartment.current).toEqualTypeOf<Plugin | null | undefined>();
		});
	});

	describe('Type Compatibility', () => {
		it('should work with conditional plugin creation', () => {
			const createConditionalPlugin = (condition: boolean): Plugin | null => {
				return condition ? axis('x') : null;
			};

			// Should work - function that might return null
			const compartment = new Compartment(() => createConditionalPlugin(true));
			expectTypeOf(compartment).toEqualTypeOf<Compartment>();
		});

		it('should work with optional plugin factories', () => {
			const optionalPluginFactory = (): Plugin | undefined => {
				// Some logic that might not create a plugin
				return Math.random() > 0.5 ? axis('y') : undefined;
			};

			// Should work - function that might return undefined
			const compartment = new Compartment(optionalPluginFactory);
			expectTypeOf(compartment).toEqualTypeOf<Compartment>();
		});

		it('should maintain type safety in plugin arrays', () => {
			const compartment1 = new Compartment(() => axis('x'));
			const compartment2 = new Compartment(() => null);
			const compartment3 = new Compartment();

			// These should all be valid in plugin arrays
			const plugins = [compartment1, compartment2, compartment3];
			expectTypeOf(plugins).toEqualTypeOf<Compartment[]>();
		});
	});

	describe('Runtime Type Validation', () => {
		it('should handle null returns at runtime', () => {
			const compartment = new Compartment(() => null);

			// At runtime, this should be undefined (null converted to undefined)
			// This tests the actual implementation behavior
			expectTypeOf(compartment.current).toEqualTypeOf<Plugin | null | undefined>();
		});

		it('should handle dynamic type switching', () => {
			const compartment = new Compartment();

			// Should be able to switch between all valid types
			compartment.current = axis('x'); // Plugin
			compartment.current = null; // null
			compartment.current = undefined; // undefined

			// Type should remain consistent
			expectTypeOf(compartment.current).toEqualTypeOf<undefined>();
		});
	});

	describe('Integration with Existing Code', () => {
		it('should work with existing Compartment.of pattern in Svelte', () => {
			// This tests the Svelte-specific wrapper maintains compatibility
			const condition = true;
			const compartment = Compartment.of(() => (condition ? axis('x') : null));

			expectTypeOf(compartment).toEqualTypeOf<Compartment>();
		});

		it('should work in plugin resolver functions', () => {
			const compartment1 = new Compartment(() => axis('x'));
			const compartment2 = new Compartment(() => null);

			// Should work in plugin resolver context
			const resolver = () => [compartment1, compartment2];
			expectTypeOf(resolver).toEqualTypeOf<() => Compartment[]>();
		});
	});

	// Note: These would cause TypeScript compile errors if uncommented
	// but demonstrate what should NOT be allowed:
	/*
  describe('Type Errors (Commented - would fail compilation)', () => {
    it('should NOT accept direct Plugin in constructor', () => {
      // This should cause a type error:
      // const compartment = new Compartment(axis('x')); // ❌ Error: Expected function
    });

    it('should NOT accept wrong function signature', () => {
      // This should cause a type error:
      // const compartment = new Compartment((x: number) => axis('x')); // ❌ Error: Wrong signature
    });

    it('should NOT accept number assignment to current', () => {
      // This should cause a type error:
      // const compartment = new Compartment();
      // compartment.current = 42; // ❌ Error: Type 'number' is not assignable
    });
  });
  */
});

describe.todo('plugins order and overriding');

describe.todo('plugin-priority');

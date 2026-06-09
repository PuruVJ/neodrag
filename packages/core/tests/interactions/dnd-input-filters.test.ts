import { describe, expect, it } from 'vitest';
import {
	type InteractionModifiers,
	type PointerInteractionInput,
	programmaticToInput,
} from '../../src/interaction-input.ts';
import {
	allFilters,
	buttonFilter,
	modifierFilter,
} from '../../src/sensors/filters.ts';

// Build a pointer-shaped input without jsdom — these filters are pure, so we
// only need the fields they read (pointer.button + modifiers).
function pointerInput(opts: {
	button?: number;
	modifiers?: Partial<InteractionModifiers>;
}): PointerInteractionInput {
	const modifiers: InteractionModifiers = {
		shift: opts.modifiers?.shift ?? false,
		ctrl: opts.modifiers?.ctrl ?? false,
		alt: opts.modifiers?.alt ?? false,
		meta: opts.modifiers?.meta ?? false,
	};
	return {
		kind: 'pointer',
		phase: 'start',
		clientX: 0,
		clientY: 0,
		target: null,
		modifiers,
		timestamp: 0,
		delta: undefined,
		native: null as unknown as PointerEvent,
		pointer: {
			pointerId: 1,
			pointerType: 'mouse',
			button: opts.button ?? 0,
			buttons: 1,
			pressure: 0.5,
		},
	};
}

describe('buttonFilter', () => {
	it('passes pointer inputs whose button is in the allow-list', () => {
		const primaryOnly = buttonFilter([0]);
		expect(primaryOnly(pointerInput({ button: 0 }))).toBe(true);
		expect(primaryOnly(pointerInput({ button: 2 }))).toBe(false);
	});

	it('supports multiple allowed buttons', () => {
		const f = buttonFilter([0, 1]);
		expect(f(pointerInput({ button: 0 }))).toBe(true);
		expect(f(pointerInput({ button: 1 }))).toBe(true);
		expect(f(pointerInput({ button: 2 }))).toBe(false);
	});

	it('rejects every pointer input when the allow-list is empty', () => {
		const f = buttonFilter([]);
		expect(f(pointerInput({ button: 0 }))).toBe(false);
	});

	it('passes non-pointer inputs through (they carry no button)', () => {
		// Programmatic inputs have no pointer meta, so buttonFilter is a no-op.
		const f = buttonFilter([0]);
		const prog = programmaticToInput({ phase: 'start', clientX: 5, clientY: 5 });
		expect(f(prog)).toBe(true);
	});
});

describe('modifierFilter', () => {
	it('passes when a required modifier is present', () => {
		const f = modifierFilter({ shift: true });
		expect(f(pointerInput({ modifiers: { shift: true } }))).toBe(true);
		expect(f(pointerInput({ modifiers: { shift: false } }))).toBe(false);
	});

	it('requires an explicit false modifier to be released', () => {
		const f = modifierFilter({ ctrl: false });
		expect(f(pointerInput({ modifiers: { ctrl: false } }))).toBe(true);
		expect(f(pointerInput({ modifiers: { ctrl: true } }))).toBe(false);
	});

	it('leaves omitted modifiers unconstrained', () => {
		const f = modifierFilter({ meta: true });
		// shift/ctrl/alt are free to be anything.
		expect(f(pointerInput({ modifiers: { meta: true, shift: true, alt: true } }))).toBe(true);
		expect(f(pointerInput({ modifiers: { meta: false } }))).toBe(false);
	});

	it('requires all listed modifiers to match', () => {
		const f = modifierFilter({ shift: true, alt: true });
		expect(f(pointerInput({ modifiers: { shift: true, alt: true } }))).toBe(true);
		expect(f(pointerInput({ modifiers: { shift: true, alt: false } }))).toBe(false);
	});

	it('passes any input when no modifiers are required', () => {
		const f = modifierFilter({});
		expect(f(pointerInput({ modifiers: { shift: true } }))).toBe(true);
		const prog = programmaticToInput({ phase: 'start', clientX: 0, clientY: 0 });
		expect(f(prog)).toBe(true);
	});

	it('applies to non-pointer inputs via shared modifiers', () => {
		// Programmatic inputs always have all-false modifiers.
		const needsShift = modifierFilter({ shift: true });
		const prog = programmaticToInput({ phase: 'start', clientX: 0, clientY: 0 });
		expect(needsShift(prog)).toBe(false);
		const noShift = modifierFilter({ shift: false });
		expect(noShift(prog)).toBe(true);
	});
});

describe('allFilters', () => {
	it('AND-composes filters — passes only when all pass', () => {
		const f = allFilters(buttonFilter([0]), modifierFilter({ shift: true }));
		expect(f(pointerInput({ button: 0, modifiers: { shift: true } }))).toBe(true);
		expect(f(pointerInput({ button: 0, modifiers: { shift: false } }))).toBe(false);
		expect(f(pointerInput({ button: 2, modifiers: { shift: true } }))).toBe(false);
	});

	it('passes everything with zero filters (vacuous AND)', () => {
		const f = allFilters();
		expect(f(pointerInput({ button: 9 }))).toBe(true);
	});

	it('short-circuits to a single filter when given one', () => {
		const f = allFilters(buttonFilter([1]));
		expect(f(pointerInput({ button: 1 }))).toBe(true);
		expect(f(pointerInput({ button: 0 }))).toBe(false);
	});
});

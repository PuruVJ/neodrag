import { type InteractionInput, isPointerInput } from '../interaction-input.ts';

// A pure predicate over an InteractionInput. Filters are the composable seam
// sensors use to decide whether an input should drive an interaction.
export type InputFilter = (input: InteractionInput) => boolean;

// Pass pointer inputs whose pointer.button is in the allow-list. Non-pointer
// inputs (keyboard/programmatic) carry no button, so they pass through.
export function buttonFilter(buttons: number[]): InputFilter {
	return (input) => {
		if (!isPointerInput(input)) return true;
		return buttons.includes(input.pointer.button);
	};
}

// Pass when every required modifier matches the input's modifiers. Omitted keys
// are unconstrained; an explicit `false` requires that modifier be released.
export function modifierFilter(mods: {
	shift?: boolean;
	ctrl?: boolean;
	alt?: boolean;
	meta?: boolean;
}): InputFilter {
	return (input) => {
		const m = input.modifiers;
		if (mods.shift !== undefined && m.shift !== mods.shift) return false;
		if (mods.ctrl !== undefined && m.ctrl !== mods.ctrl) return false;
		if (mods.alt !== undefined && m.alt !== mods.alt) return false;
		if (mods.meta !== undefined && m.meta !== mods.meta) return false;
		return true;
	};
}

// AND-composition: the result passes only when every supplied filter passes.
export function allFilters(...filters: InputFilter[]): InputFilter {
	return (input) => filters.every((f) => f(input));
}

import type { DropInstance } from '../instance.ts';
import type { InteractionInput } from '../interaction-input.ts';

export type DropInteractionRunner = {
	runHook(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		input: InteractionInput,
	): boolean | void;
};

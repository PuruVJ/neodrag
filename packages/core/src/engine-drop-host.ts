import type { DropTargetHost } from './drop-targets.ts';
import type { ActiveSession } from './instance.ts';
import type { DragInstance, DropInstance } from './instance.ts';
import type { InteractionInput } from './interaction-input.ts';

export type EngineDropHostDeps = {
	getDropCount(): number;
	getSoleDrop(): DropInstance | null;
	getActive(): ActiveSession | null;
	getActiveSource(): DragInstance | null;
	getDropTargets(): Map<HTMLElement | SVGElement, DropInstance>;
	runDropHook(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		input: InteractionInput,
	): boolean | void;
	measure?(span: string, fn: () => void): void;
};

export function createEngineDropHost(deps: EngineDropHostDeps): DropTargetHost {
	return deps;
}

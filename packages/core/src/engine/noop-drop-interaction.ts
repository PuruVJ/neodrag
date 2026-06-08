import type { DropInteractionRunner } from './drop-runner.ts';

export const noopDropInteraction: DropInteractionRunner = {
	runHook: () => true,
};

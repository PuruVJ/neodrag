import type { InteractionInput } from '../interaction-input.ts';
import type { DropInstance } from '../instance.ts';

export class NoopDropTargetTracker {
	reset(): void {}

	flush(_input: InteractionInput): void {}

	getOverDrops(): DropInstance[] {
		return [];
	}

	dropsAtPointer(_x: number, _y: number): DropInstance[] {
		return [];
	}
}

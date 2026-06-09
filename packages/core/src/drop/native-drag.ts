import { isNativeDndInput, type InteractionInput } from '../interaction-input.ts';
import { NativeDndSensor } from '../sensors/native-dnd.ts';
import { sharedEngine } from '../shared.ts';
import type { Capability, InteractionSession, ResolvedTarget } from '../types.ts';

export const NATIVE_DRAG_KEY = Symbol('neodrag.native-drag');

/**
 * Session-host for OS drag-and-drop. It claims the `native-dnd` input stream — at the highest
 * priority, so it wins the engine's resolve race over drag/sortable/resize, which would otherwise
 * try to claim whatever element the file is dragged over — and does nothing else. `Drop` observes
 * the resulting session and handles the zones, exactly as it does for a pointer drag.
 */
export class NativeDrag implements Capability {
	readonly key = NATIVE_DRAG_KEY;
	readonly name = 'native-drag';
	readonly priority = 1_000_000;

	resolve(input: InteractionInput): ResolvedTarget | null {
		// The node is just a non-zone session anchor (Drop hit-tests the pointer, not this node).
		return isNativeDndInput(input) ? { node: document.documentElement } : null;
	}
	start(_session: InteractionSession): void {}
	move(_session: InteractionSession): void {}
	end(_session: InteractionSession): void {}
}

let wired = false;
/** Idempotently arm native file/text DnD on the shared engine (session host + sensor). Called by
 * the ergonomic `Droppable` when a zone opts in with `native: true`. */
export function enableNativeDnd(): void {
	if (wired) return;
	wired = true;
	sharedEngine().use(new NativeDrag()).registerSensor(new NativeDndSensor());
}

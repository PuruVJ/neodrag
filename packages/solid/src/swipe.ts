import { Swipeable, type SwipeOptions } from '@neodrag/core/swipe';
import { createSignal, onCleanup, type Accessor } from 'solid-js';

type RefSetter = (node: HTMLElement | null) => void;

/**
 * Swipe-to-dismiss primitive — a thin adapter over the core `Swipeable` binder. Put `ref` on the
 * element; read `offset()` / `isDismissed()`. Released past `threshold` the element flies out and
 * fires `onDismiss`, otherwise it springs back.
 */
export function createSwipe(options: SwipeOptions = {}): {
	ref: RefSetter;
	offset: Accessor<{ x: number; y: number }>;
	isDismissed: Accessor<boolean>;
	reset: () => void;
} {
	let inst: Swipeable | null = null;
	let dispose: (() => void) | null = null;
	const [offset, set_offset] = createSignal({ x: 0, y: 0 });
	const [isDismissed, set_dismissed] = createSignal(false);

	const ref: RefSetter = (node) => {
		dispose?.();
		dispose = null;
		inst = null;
		if (node) {
			inst = new Swipeable({
				...options,
				onChange: (s) => {
					set_offset(s.offset);
					set_dismissed(s.dismissed);
				},
			});
			dispose = inst.attach(node);
		}
	};
	onCleanup(() => {
		dispose?.();
		dispose = null;
		inst = null;
	});

	const reset = () => inst?.reset();

	return { ref, offset, isDismissed, reset };
}

export { resolveSwipe, type SwipeAxis, type SwipeResult, type SwipeOptions } from '@neodrag/core/swipe';

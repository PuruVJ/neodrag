import { Swipeable, type SwipeOptions } from '@neodrag/core/swipe';
import { onScopeDispose, ref, type Ref } from 'vue';

type FnRef = (el: HTMLElement | null) => void;

/**
 * Vue v3 swipe-to-dismiss composable — a thin adapter over the core `Swipeable` binder. Bind `:ref="ref"`
 * on the element; read reactive `offset` / `isDismissed`. Released past `threshold` the element flies out
 * and fires `onDismiss`, otherwise it springs back.
 */
export function useSwipe(options: SwipeOptions = {}): {
	ref: FnRef;
	offset: Ref<{ x: number; y: number }>;
	isDismissed: Ref<boolean>;
	reset: () => void;
} {
	let inst: Swipeable | null = null;
	let dispose: (() => void) | null = null;
	const offset = ref<{ x: number; y: number }>({ x: 0, y: 0 });
	const isDismissed = ref(false);

	// Create the `Swipeable` when the element binds; dispose when it unbinds.
	const ref_fn: FnRef = (node) => {
		dispose?.();
		if (node) {
			inst = new Swipeable({
				...options,
				onChange: (s) => {
					offset.value = s.offset;
					isDismissed.value = s.dismissed;
				},
			});
			dispose = inst.attach(node);
		} else {
			inst = null;
			dispose = null;
		}
	};

	const reset = () => inst?.reset();

	onScopeDispose(() => dispose?.());

	return { ref: ref_fn, offset, isDismissed, reset };
}

export { resolveSwipe, type SwipeAxis, type SwipeResult, type SwipeOptions } from '@neodrag/core/swipe';

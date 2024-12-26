import type { computed, effect, Signal, untrack } from 'alien-signals/esm';
import { signal } from 'alien-signals/esm';
import { get_node_style, set_node_dataset, set_node_key_style } from './utils';

export interface PluginContext {
	phase: Signal<'shouldDrag' | 'dragStart' | 'drag' | 'dragEnd' | 'idle'>;

	isInteracting: Signal<boolean>;
	isDragging: Signal<boolean>;

	offset: Signal<{ x: number; y: number }>;
	initial: Signal<{ x: number; y: number }>;
	delta: Signal<{ x: number; y: number }>;
	proposed: Signal<{ x: number | null; y: number | null }>;

	event: Signal<PointerEvent>;
	lastEvent: PointerEvent | null;

	currentTarget: HTMLElement | SVGElement;
	target: HTMLElement | SVGElement;
}

interface SetupArgs {
	$: {
		signal: typeof signal;
		computed: typeof computed;
		effect: typeof effect;
		untrack: typeof untrack;
	};
	ctx: PluginContext;
	requestPaint: (fn: () => void) => void;
	propose: (x: number | null, y: number | null) => void;
	cancel: () => void;
	prevent: () => void;
	requestRect: (node: HTMLElement | SVGElement, force?: boolean) => Promise<DOMRect>;
}

export interface Unstable_Plugin {
	name: string;
	priority?: number;
	cancelable?: boolean;
	setup: (args: SetupArgs) => void;
}

// function unstable_definePlugin<Args extends any[] = any[]>(val: (...args: Args) => Plugin) {
// 	return val;
// }

export function transform(
	func?: (args: {
		offset: { x: number; y: number };
		currentTarget: HTMLElement | SVGElement;
	}) => void,
): Unstable_Plugin {
	return {
		name: 'neodrag:transform',

		setup({ ctx, $, requestPaint }) {
			const should_update = $.computed(() => {
				const phase = ctx.phase.get();
				const is_dragging = ctx.isDragging.get();

				return phase === 'idle' || (phase === 'drag' && is_dragging);
			});

			$.effect(() => {
				if (!should_update.get()) return;

				const offset = ctx.offset.get();

				// Run the logic
				if (offset.x === 0 && offset.y === 0) return;

				requestPaint(() => {
					if (func) {
						return func?.({
							offset,
							currentTarget: ctx.currentTarget,
						});
					}

					if (ctx.target instanceof SVGElement) {
						const element = ctx.currentTarget as SVGGraphicsElement;
						const svg = element.ownerSVGElement;
						if (!svg) throw new Error("Root Node's ownerSVGElement is null");

						const translation = svg.createSVGTransform();
						translation.setTranslate(offset.x, offset.y);

						const transform = element.transform.baseVal;
						transform.clear();
						transform.appendItem(translation);
					} else {
						ctx.currentTarget.style.translate = `${offset.x}px ${offset.y}px`;
					}
				});
			});
		},
	};
}

export function ignoreMultitouch(value: Signal<boolean> = signal(true)): Unstable_Plugin {
	return {
		name: 'neodrag:ignoreMultitouch',
		setup({ $, ctx, cancel }) {
			const active_pointers = new Set<number>();

			$.effect(() => {
				const phase = ctx.phase.get();
				const event = ctx.event.get();

				if (phase === 'dragStart') {
					active_pointers.add(event.pointerId);

					if (value.get() && active_pointers.size > 1) {
						event.preventDefault();
					}
					return;
				}

				if (phase === 'drag') {
					if (value.get() && active_pointers.size > 1) {
						cancel();
					}

					return;
				}

				if (phase === 'dragEnd') {
					active_pointers.delete(event.pointerId);
				}
			});
		},
	};
}

export function applyUserSelectHack(value: Signal<boolean> = signal(true)): Unstable_Plugin {
	return {
		name: 'neodrag:applyUserSelectHack',
		cancelable: false,
		setup({ $, ctx, requestPaint }) {
			let body_user_select_val = '';

			$.effect(() => {
				const phase = ctx.phase.get();

				if (phase === 'dragStart') {
					if (value.get()) {
						requestPaint(() => {
							body_user_select_val = get_node_style(document.body, 'user-select');
							set_node_key_style(document.body, 'user-select', 'none');
						});
					}
					return;
				}

				if (phase === 'dragEnd') {
					if (value.get()) {
						requestPaint(() => {
							set_node_key_style(document.body, 'user-select', body_user_select_val);
						});
					}
				}
			});
		},
	};
}

export function stateMarker(): Unstable_Plugin {
	return {
		name: 'neodrag:stateMarker',
		cancelable: false,

		setup({ $, ctx }) {
			const count = $.signal(0);

			set_node_dataset(ctx.currentTarget, 'neodrag', '');

			$.effect(() => {
				if (ctx.phase.get() === 'dragEnd') {
					count.set(count.get() + 1);
				}
			});

			$.effect(() => {
				set_node_dataset(ctx.currentTarget, 'neodrag-state', ctx.phase.get());
				set_node_dataset(ctx.currentTarget, 'neodrag-count', count.get());
			});
		},
	};
}

type TouchActionMode =
	// Keyword values
	| 'auto'
	| 'none'
	| 'pan-x'
	| 'pan-left'
	| 'pan-right'
	| 'pan-y'
	| 'pan-up'
	| 'pan-down'
	| 'pinch-zoom'
	| 'manipulation'

	// Global values
	| 'inherit'
	| 'initial'
	| 'revert'
	| 'revert-layer'
	| 'unset';

export function touchAction(
	mode: Signal<TouchActionMode> = signal('manipulation'),
): Unstable_Plugin {
	return {
		name: 'neodrag:touch-action',
		cancelable: false,

		setup({ ctx, $, requestPaint }) {
			let original_touch_action = get_node_style(ctx.currentTarget, 'touch-action');

			$.effect(() => {
				const phase = ctx.phase.get();

				// Only trigger when drag is started or ended
				if (!(phase === 'dragStart' || phase === 'dragEnd')) return;

				const value = phase === 'dragStart' ? mode.get() : original_touch_action;

				requestPaint(() => {
					set_node_key_style(ctx.currentTarget, 'touch-action', value);
				});
			});
		},
	};
}

// In threshold plugin
export function threshold(
	args: Signal<{ delay: number; distance: number }> = signal({ delay: 0, distance: 3 }),
): Unstable_Plugin {
	return {
		name: 'neodrag:threshold',
		setup({ $, ctx, prevent }) {
			let start_time = 0;
			let drag_start_position = { x: 0, y: 0 };

			$.effect(() => {
				const phase = ctx.phase.get();
				const event = ctx.event.get();

				if (phase === 'shouldDrag') {
					if (start_time === 0) {
						start_time = Date.now();
						drag_start_position.x = event.clientX;
						drag_start_position.y = event.clientY;
					}

					const { delay, distance } = args.get();

					if (delay > 0) {
						const elapsed = Date.now() - start_time;
						if (elapsed < delay) {
							prevent();
							return;
						}
					}

					if (distance > 0) {
						const delta_x = event.clientX - drag_start_position.x;
						const delta_y = event.clientY - drag_start_position.y;
						const actual_distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);

						if (actual_distance < distance) {
							prevent();
							return;
						}
					}
				} else if (phase === 'idle') {
					start_time = 0;
					drag_start_position.x = 0;
					drag_start_position.y = 0;
				}
			});
		},
	};
}

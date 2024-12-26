import {
	computed,
	effect,
	endBatch,
	signal,
	startBatch,
	untrack,
	untrackScope,
} from 'alien-signals/esm';
import {
	applyUserSelectHack,
	ignoreMultitouch,
	stateMarker,
	threshold,
	touchAction,
	transform,
	type PluginContext,
	type Unstable_Plugin,
} from './plugins_signals.ts';
import {
	is_svg_element,
	is_svg_svg_element,
	listen,
	microtask,
	type DeepMutable,
} from './utils.ts';

export interface ErrorInfo {
	phase: 'setup' | 'dragStart' | 'drag' | 'dragEnd' | 'shouldDrag';
	plugin?: {
		name: string;
		hook: string;
	};
	node: HTMLElement | SVGElement;
	error: unknown;
}

export interface DraggableInstance {
	ctx: DeepMutable<PluginContext>;
	root_node: HTMLElement | SVGElement;
	plugins: Unstable_Plugin[];
	dragstart_prevented: boolean;
	current_drag_hook_cancelled: boolean;
	pointer_captured_id: number | null;
	controller: AbortController;
	paint_queue: Set<() => void>;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

export const DEFAULTS = {
	plugins: [
		ignoreMultitouch(),
		stateMarker(),
		applyUserSelectHack(),
		transform(),
		threshold(signal({ delay: 1, distance: 30 })),
		touchAction(),
	],

	onError: (error: ErrorInfo) => {
		console.error(error);
	},

	delegatetarget: () => document.body,
};

export function createDraggable({
	plugins: initial_plugins = DEFAULTS.plugins,
	delegateTarget: delegateTargetFn = DEFAULTS.delegatetarget,
	onError = DEFAULTS.onError,
}: {
	plugins?: Unstable_Plugin[];
	delegateTarget?: () => HTMLElement;
	onError?: (error: ErrorInfo) => void;
} = {}) {
	const instances = new WeakMap<HTMLElement | SVGElement, DraggableInstance>();
	let listeners_initialized = false;

	/** track multiple active nodes by pointerId */
	const active_nodes = new Map<number, HTMLElement | SVGElement>();

	function resultify<T>(fn: () => T, errorInfo: Omit<ErrorInfo, 'error'>): Result<T> {
		try {
			return { ok: true, value: fn() };
		} catch (error) {
			report_error(errorInfo, error);
			return { ok: false, error };
		}
	}

	function report_error(info: Omit<ErrorInfo, 'error'>, error: unknown) {
		if (onError) {
			onError({ ...info, error });
		}
	}

	function initialize_listeners() {
		if (listeners_initialized) return;

		const delegateTarget = delegateTargetFn();

		listen(delegateTarget, 'pointerdown', handle_pointer_down, {
			passive: true,
			capture: false,
		});
		listen(delegateTarget, 'pointermove', handle_pointer_move, {
			passive: false,
			capture: false,
		});
		listen(delegateTarget, 'pointerup', handle_pointer_up, {
			passive: true,
			capture: false,
		});
		listen(delegateTarget, 'pointercancel', handle_pointer_up, {
			passive: true,
			capture: false,
		});

		listeners_initialized = true;
	}

	function cleanup_active_node(pointer_id: number) {
		// If no node is currently being dragged, nothing to clean up
		const node = active_nodes.get(pointer_id);
		if (!node) return;

		// Get the instance associated with the active node
		const instance = instances.get(node);
		if (!instance) return;

		// If we have captured pointer events, release them
		if (
			instance.pointer_captured_id &&
			instance.ctx.target.hasPointerCapture(instance.pointer_captured_id)
		) {
			resultify(
				() => {
					// Release the pointer capture we set earlier
					instance.ctx.currentTarget.releasePointerCapture(instance.pointer_captured_id!);
				},
				{
					phase: 'dragEnd',
					node,
				},
			);
		}

		// Reset all the drag state
		untrack(() => {
			instance.ctx.isInteracting.set(false); // No longer interacting with element
			instance.ctx.isDragging.set(false); // No longer dragging
			instance.dragstart_prevented = false; // Reset prevention flag
			instance.pointer_captured_id = null; // Clear pointer ID
			active_nodes.delete(pointer_id); // Clear active node reference
		});
	}

	async function handle_pointer_down(e: PointerEvent) {
		if (e.button === 2) return;

		// Find the draggable node that contains the target
		const draggable_node = find_draggable_node(e);

		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		const target_rect = await get_element_rect_in_raf(draggable_node);

		instance.ctx.isInteracting.set(true);
		active_nodes.set(e.pointerId, draggable_node);

		const capture_result = resultify(
			() => {
				instance.pointer_captured_id = e.pointerId;
				instance.ctx.target.setPointerCapture(instance.pointer_captured_id);
			},
			{
				phase: 'dragStart',
				node: instance.ctx.target,
			},
		);

		if (!capture_result.ok) {
			cleanup_active_node(e.pointerId);
			return;
		}

		// Modify this if draggable_node is SVG
		// Calculate scale differently for SVG vs HTML
		let inverse_scale = 1;
		if (target_rect.width && target_rect.height) {
			inverse_scale = target_rect.width / target_rect.height;
		}

		startBatch();
		// Get current offset
		const current_offset = instance.ctx.offset.get();

		// Set initial position based on current mouse position and offset
		instance.ctx.initial.set({
			x: e.clientX - current_offset.x / inverse_scale,
			y: e.clientY - current_offset.y / inverse_scale,
		});
		endBatch();
	}

	async function handle_pointer_move(e: PointerEvent) {
		const draggable_node = active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		if (!instance.ctx.isInteracting.get()) return;

		instance.ctx.lastEvent = e;

		if (!instance.ctx.isDragging.get()) {
			startBatch();
			instance.dragstart_prevented = false;
			instance.ctx.phase.set('shouldDrag');
			instance.ctx.event.set(e);
			endBatch();

			if (!instance.dragstart_prevented) {
				instance.ctx.phase.set('dragStart');
				instance.ctx.isDragging.set(true);
			}

			if (!instance.ctx.isDragging.get()) {
				return;
			}
		}

		e.preventDefault();

		instance.ctx.phase.set('drag');

		startBatch();
		const initial = instance.ctx.initial.get();
		const offset = instance.ctx.offset.get();
		const proposal = {
			x: e.clientX - initial.x - offset.x,
			y: e.clientY - initial.y - offset.y,
		};
		instance.ctx.delta.set(proposal);

		// Core proposes delta
		instance.ctx.proposed.set(proposal);
		endBatch();

		// Whatever offset we have had till now since the draggable() was mounted, add proposals to it, as long as they're not null
		untrackScope(() => {
			const offset = instance.ctx.offset.get();
			const proposed = instance.ctx.proposed.get();
			const proposed_offset = {
				x: offset.x + (proposed.x ?? 0),
				y: offset.y + (proposed.y ?? 0),
			};
			instance.ctx.offset.set(proposed_offset);
		});
	}

	async function handle_pointer_up(e: PointerEvent) {
		const draggable_node = active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		if (!instance.ctx.isInteracting.get()) return;

		if (instance.ctx.isDragging.get()) {
			listen(draggable_node as HTMLElement, 'click', (e) => e.stopPropagation(), {
				once: true,
				signal: instance.controller.signal,
				capture: true,
			});
		}

		if (
			instance.pointer_captured_id &&
			instance.ctx.target.hasPointerCapture(instance.pointer_captured_id)
		) {
			instance.ctx.target.releasePointerCapture(instance.pointer_captured_id);
		}

		startBatch();
		instance.ctx.phase.set('dragEnd');

		const proposed = instance.ctx.proposed.get();
		const offset = instance.ctx.offset.get();
		const initial = instance.ctx.initial.get();
		if (proposed.x) instance.ctx.initial.set({ ...initial, x: offset.x });
		if (proposed.y) instance.ctx.initial.set({ ...initial, y: offset.y });

		instance.ctx.proposed.set({ x: 0, y: 0 });
		instance.ctx.isInteracting.set(false);
		instance.ctx.isDragging.set(false);
		instance.ctx.event.set(e);
		instance.dragstart_prevented = false;
		instance.pointer_captured_id = null;
		endBatch();

		instance.ctx.phase.set('idle');
	}

	function find_draggable_node(e: PointerEvent): HTMLElement | SVGElement | null {
		// composedPath() gives us the event path in the DOM from target up to window
		const path = e.composedPath();
		// Find first element in path that's a draggable
		for (const el of path) {
			if (
				(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
				instances.has(el)
			) {
				return el;
			}
		}
		return null;
	}

	function initialize_plugins(plugins: Unstable_Plugin[]) {
		// Create new array if combining
		const combined = initial_plugins.concat(plugins);

		return combined.sort((a, b) => {
			const priority_a = a.priority ?? 0;
			const priority_b = b.priority ?? 0;
			if (priority_a !== priority_b) {
				return priority_b - priority_a;
			}
			return combined.indexOf(a) - combined.indexOf(b);
		});
	}
	function flush_paint_queue(instance: DraggableInstance) {
		if (instance.paint_queue.size === 0) return;

		const effects = Array.from(instance.paint_queue);
		instance.paint_queue.clear();

		requestAnimationFrame(() => {
			for (const effect of effects) {
				effect();
			}
		});
	}

	return {
		instances,
		draggable: (node: HTMLElement | SVGElement, plugins: Unstable_Plugin[] = []) => {
			initialize_listeners();

			const instance: DraggableInstance = {
				ctx: {} as DeepMutable<PluginContext>,
				root_node: node,
				plugins: [],
				controller: new AbortController(),
				dragstart_prevented: false,
				current_drag_hook_cancelled: false,
				pointer_captured_id: null,
				paint_queue: new Set<() => void>(),
			};

			let currently_dragged_element = node;

			const phase = signal<'dragStart' | 'drag' | 'dragEnd' | 'idle'>('idle');
			const proposal = signal<{
				x: number | null;
				y: number | null;
			}>({ x: 0, y: 0 });
			const delta = signal({ x: 0, y: 0 });
			const offset = signal({ x: 0, y: 0 });
			const initial = signal({ x: 0, y: 0 });
			const isDragging = signal(false);
			const isInteracting = signal(false);

			instance.ctx = {
				phase,
				proposed: proposal,
				delta,
				offset,
				initial,
				isDragging,
				isInteracting,
				target: node,
				event: signal(null!),
				lastEvent: null,
				get currentTarget() {
					return currently_dragged_element;
				},
				set currentTarget(val) {
					//  In case a plugin switches currentDraggedElement through the pointermove
					if (
						instance.pointer_captured_id &&
						currently_dragged_element.hasPointerCapture(instance.pointer_captured_id)
					) {
						currently_dragged_element.releasePointerCapture(instance.pointer_captured_id);
						val.setPointerCapture(instance.pointer_captured_id);
					}

					currently_dragged_element = val;
				},
			};

			function propose(x: number | null, y: number | null) {
				proposal.set({ x, y });
			}

			function cancel() {
				instance.current_drag_hook_cancelled = true;
			}

			function prevent() {
				instance.dragstart_prevented = true;
			}

			function requestPaint(fn: () => void) {
				instance.paint_queue.add(fn);

				queueMicrotask(() => {
					flush_paint_queue(instance);
				});
			}

			// Initial setup
			instance.plugins = initialize_plugins(plugins);
			// Call the plugins's setup with what they need
			for (const plugin of instance.plugins) {
				plugin.setup({
					cancel,
					ctx: instance.ctx,
					prevent,
					propose,
					requestRect: get_element_rect_in_raf,
					requestPaint,
					$: {
						computed,
						effect,
						signal,
						untrack,
					},
				});
			}

			// Register instance
			instances.set(node, instance);

			return {
				destroy() {
					for (const [pointer_id, active_node] of active_nodes) {
						if (active_node === node) {
							cleanup_active_node(pointer_id);
						}
					}

					// for (const plugin of instance.plugins) {
					// 	plugin.cleanup?.(instance.ctx, instance.states.get(plugin.name));
					// }

					instances.delete(node);
				},
			};
		},
	};
}

const rect_cache = new WeakMap<
	HTMLElement | SVGElement,
	{
		rect: DOMRect;
		timestamp: number;
	}
>();

let last_frame_time = 0;

function get_element_rect_in_raf(element: HTMLElement | SVGElement, force = false) {
	return new Promise<DOMRect>((resolve) => {
		requestAnimationFrame((timestamp) => {
			const frame_time = last_frame_time ? timestamp - last_frame_time : 16.7;
			const cache_time = frame_time * 0.9;

			const cached = rect_cache.get(element);
			if (!force && cached && timestamp - cached.timestamp < cache_time) {
				return resolve(cached.rect);
			}

			last_frame_time = timestamp;
			const rect =
				element instanceof SVGGraphicsElement ? element.getBBox() : element.getBoundingClientRect();

			rect_cache.set(element, { rect, timestamp });
			resolve(rect);
		});
	});
}

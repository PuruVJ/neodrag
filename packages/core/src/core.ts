import type { Plugin, PluginContext } from './plugins.ts';

type DeepMutable<T> = T extends object
	? {
			-readonly [P in keyof T]: T[P] extends readonly any[]
				? DeepMutable<T[P]>
				: T[P] extends object
					? keyof T[P] extends never
						? T[P]
						: DeepMutable<T[P]>
					: T[P];
		}
	: T;

interface DraggableInstance {
	ctx: DeepMutable<PluginContext>;
	plugins: Plugin[];
	states: Map<string, any>;
	dragstart_prevented: boolean;
	current_drag_hook_cancelled: boolean;
	pointer_captured_id: number | null;
	effects: Set<() => void>;
	controller: AbortController;
}

export function createDraggable({
	plugins: initial_plugins = [],
	delegateTarget = document.body,
}: { plugins?: Plugin[]; delegateTarget?: HTMLElement } = {}) {
	const instances = new WeakMap<HTMLElement, DraggableInstance>();
	let listeners_initialized = false;
	let active_node: HTMLElement | null = null;

	function initialize_listeners() {
		if (listeners_initialized) return;

		delegateTarget.addEventListener('pointerdown', handle_pointer_down, {
			passive: true,
			capture: false,
		});
		delegateTarget.addEventListener('pointermove', handle_pointer_move, {
			passive: false,
			capture: false,
		});
		delegateTarget.addEventListener('pointerup', handle_pointer_up, {
			passive: false,
			capture: false,
		});

		listeners_initialized = true;
	}

	function handle_pointer_down(e: PointerEvent) {
		if (e.button === 2) return;

		// Find the draggable node that contains the target
		const draggable_node = find_draggable_node(e);

		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		instance.ctx.cachedRootNodeRect = draggable_node.getBoundingClientRect();

		const should_drag = run_plugins(instance, 'shouldDrag', e);
		if (!should_drag) return;

		instance.ctx.isInteracting = true;
		active_node = draggable_node;

		instance.pointer_captured_id = e.pointerId;
		instance.ctx.currentlyDraggedNode.setPointerCapture(instance.pointer_captured_id);

		const inverse_scale = draggable_node.offsetWidth / instance.ctx.cachedRootNodeRect.width;

		if (instance.ctx.proposed.x != null) {
			instance.ctx.initial.x = e.clientX - instance.ctx.offset.x / inverse_scale;
		}
		if (instance.ctx.proposed.y != null) {
			instance.ctx.initial.y = e.clientY - instance.ctx.offset.y / inverse_scale;
		}
	}

	function handle_pointer_move(e: PointerEvent) {
		if (!active_node) return;

		const instance = instances.get(active_node)!;
		if (!instance.ctx.isInteracting) return;

		if (!instance.ctx.isDragging) {
			instance.dragstart_prevented = false;
			run_plugins(instance, 'drag', e);

			if (!instance.dragstart_prevented && !instance.current_drag_hook_cancelled) {
				const start_drag = run_plugins(instance, 'dragStart', e);
				if (!start_drag) return clear_effects(instance);
				else flush_effects(instance);

				instance.ctx.isDragging = true;
			}

			if (!instance.ctx.isDragging) return;
		}

		e.preventDefault();

		instance.ctx.delta.x = e.clientX - instance.ctx.initial.x - instance.ctx.offset.x;
		instance.ctx.delta.y = e.clientY - instance.ctx.initial.y - instance.ctx.offset.y;

		// Core proposes delta
		instance.ctx.proposed.x = instance.ctx.delta.x;
		instance.ctx.proposed.y = instance.ctx.delta.y;

		// Run the plugins
		const run_result = run_plugins(instance, 'drag', e);

		if (run_result) flush_effects(instance);
		else return clear_effects(instance);

		// Whatever offset we have had till now since the draggable() was mounted, add proposals to it, as long as they're not null
		instance.ctx.offset.x += instance.ctx.proposed.x ?? 0;
		instance.ctx.offset.y += instance.ctx.proposed.y ?? 0;
	}

	function handle_pointer_up(e: PointerEvent) {
		if (!active_node) return;

		const instance = instances.get(active_node)!;
		if (!instance.ctx.isInteracting) return;

		if (instance.ctx.isDragging) {
			// Listen for click handler and cancel it
			active_node.addEventListener('click', (e) => e.stopPropagation(), {
				once: true,
				signal: instance.controller.signal,
				capture: true,
			});
		}

		if (
			instance.pointer_captured_id &&
			instance.ctx.currentlyDraggedNode.hasPointerCapture(instance.pointer_captured_id)
		) {
			instance.ctx.currentlyDraggedNode.releasePointerCapture(instance.pointer_captured_id);
		}

		// Call the dragEnd hooks
		run_plugins(instance, 'dragEnd', e);
		flush_effects(instance);

		if (instance.ctx.proposed.x) instance.ctx.initial.x = instance.ctx.offset.x;
		if (instance.ctx.proposed.y) instance.ctx.initial.y = instance.ctx.offset.y;

		instance.ctx.proposed.x = 0;
		instance.ctx.proposed.y = 0;
		instance.ctx.isInteracting = false;
		instance.ctx.isDragging = false;
		instance.dragstart_prevented = false;
		instance.pointer_captured_id = null;
		clear_effects(instance);
	}

	function run_plugins(
		instance: any,
		hook: 'dragStart' | 'drag' | 'dragEnd' | 'shouldDrag',
		event: PointerEvent,
	) {
		let should_run = true;
		instance.dragstart_prevented = false;

		for (const plugin of instance.plugins) {
			const handler = plugin[hook];
			if (!handler) continue;

			if (instance.current_drag_hook_cancelled && plugin.cancelable !== false) continue;

			const result = handler(instance.ctx, instance.states.get(plugin.name), event);

			if (result === false) {
				should_run = false;
				break;
			}
		}

		return should_run;
	}

	function flush_effects(instance: DraggableInstance) {
		for (const effect of instance.effects) {
			effect();
		}
		clear_effects(instance);
	}

	function clear_effects(instance: DraggableInstance) {
		instance.effects.clear();
	}

	function find_draggable_node(e: PointerEvent): HTMLElement | null {
		// composedPath() gives us the event path in the DOM from target up to window
		const path = e.composedPath();
		// Find first element in path that's a draggable
		for (const el of path) {
			if (el instanceof HTMLElement && instances.has(el)) {
				return el;
			}
		}
		return null;
	}

	return function mount(node: HTMLElement, plugins: Plugin[] = []) {
		initialize_listeners();

		const instance: DraggableInstance = {
			ctx: {} as DeepMutable<PluginContext>,
			plugins: [],
			states: new Map<string, any>(),
			controller: new AbortController(),
			dragstart_prevented: false,
			current_drag_hook_cancelled: false,
			pointer_captured_id: null,
			effects: new Set<() => void>(),
		};

		let currently_dragged_element = node;

		instance.ctx = {
			proposed: { x: 0, y: 0 },
			delta: { x: 0, y: 0 },
			offset: { x: 0, y: 0 },
			initial: { x: 0, y: 0 },
			isDragging: false,
			isInteracting: false,
			rootNode: node,
			cachedRootNodeRect: node.getBoundingClientRect(),
			get currentlyDraggedNode() {
				return currently_dragged_element;
			},
			set currentlyDraggedNode(val) {
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

			effect: (func) => {
				instance.effects.add(func);
			},

			propose: (proposed) => {
				instance.ctx.proposed.x = proposed.x;
				instance.ctx.proposed.y = proposed.y;
			},

			cancel() {
				instance.current_drag_hook_cancelled = true;
			},

			preventStart() {
				instance.dragstart_prevented = true;
			},
		};

		// Initialize plugins
		const plugin_map = new Map<string, Plugin<any>>();
		for (const plugin of [...plugins, ...initial_plugins]) {
			const existing_plugin = plugin_map.get(plugin.name);
			if (!existing_plugin || (plugin.priority ?? 0) >= (existing_plugin.priority ?? 0)) {
				plugin_map.set(plugin.name, plugin);
			}
		}

		instance.plugins = [...plugin_map.values()].sort(
			(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
		);

		for (const plugin of instance.plugins) {
			const state = plugin.setup?.(instance.ctx);
			flush_effects(instance);
			if (state) instance.states.set(plugin.name, state);
		}

		// Register instance
		instances.set(node, instance);

		// Set touch-action
		node.style.touchAction = 'none';

		return {
			destroy() {
				if (active_node === node) {
					active_node = null;
				}

				for (const plugin of instance.plugins) {
					plugin.cleanup?.();
				}

				instances.delete(node);
			},
		};
	};
}

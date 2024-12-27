import {
	applyUserSelectHack,
	ignoreMultitouch,
	stateMarker,
	threshold,
	touchAction,
	transform,
	type Plugin,
	type PluginContext,
} from './plugins.ts';
import { is_svg_element, is_svg_svg_element, listen, type DeepMutable } from './utils.ts';

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
	plugins: Plugin[];
	states: Map<string, any>;
	dragstart_prevented: boolean;
	current_drag_hook_cancelled: boolean;
	pointer_captured_id: number | null;
	effects: Set<() => void>;
	controller: AbortController;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

export const DEFAULTS = {
	plugins: [
		ignoreMultitouch(),
		stateMarker(),
		applyUserSelectHack(),
		transform(),
		threshold(),
		touchAction(),
	],

	onError: (error: ErrorInfo) => {
		console.error(error);
	},

	delegate: () => document.body,
};

export function createDraggable({
	plugins: initial_plugins = DEFAULTS.plugins,
	delegate: delegateTargetFn = DEFAULTS.delegate,
	onError = DEFAULTS.onError,
}: {
	plugins?: Plugin[];
	delegate?: () => HTMLElement;
	onError?: (error: ErrorInfo) => void;
} = {}) {
	const instances = new Map<HTMLElement | SVGElement, DraggableInstance>();
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

	function run_plugins(instance: DraggableInstance, hook: ErrorInfo['phase'], event: PointerEvent) {
		let should_run = true;
		instance.dragstart_prevented = false;

		for (const plugin of instance.plugins) {
			const handler = plugin[hook];
			if (!handler) continue;

			if (instance.current_drag_hook_cancelled && plugin.cancelable !== false) continue;

			const result = resultify(
				() => handler.call(plugin, instance.ctx, instance.states.get(plugin.name), event),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.ctx.rootNode,
				},
			);

			if (!result.ok || result.value === false) {
				should_run = false;
				break;
			}
		}

		return should_run;
	}

	function flush_effects(instance: DraggableInstance) {
		if (instance.effects.size === 0) return;

		// Store effects locally and clear the instance effects immediately
		// This prevents new effects added during execution from being lost
		const effects = Array.from(instance.effects);
		clear_effects(instance);

		// Schedule effects to run before next paint
		requestAnimationFrame(() => {
			for (const effect of effects) {
				effect();
			}
		});
	}

	function clear_effects(instance: DraggableInstance) {
		instance.effects.clear();
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
			instance.ctx.currentlyDraggedNode.hasPointerCapture(instance.pointer_captured_id)
		) {
			resultify(
				() => {
					// Release the pointer capture we set earlier
					instance.ctx.currentlyDraggedNode.releasePointerCapture(instance.pointer_captured_id!);
				},
				{
					phase: 'dragEnd',
					node,
				},
			);
		}

		// Reset all the drag state
		instance.ctx.isInteracting = false; // No longer interacting with element
		instance.ctx.isDragging = false; // No longer dragging
		instance.dragstart_prevented = false; // Reset prevention flag
		instance.pointer_captured_id = null; // Clear pointer ID
		active_nodes.delete(pointer_id); // Clear active node reference
		clear_effects(instance); // Clear any pending effects
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
		active_nodes.set(e.pointerId, draggable_node);

		const capture_result = resultify(
			() => {
				instance.pointer_captured_id = e.pointerId;
				instance.ctx.currentlyDraggedNode.setPointerCapture(instance.pointer_captured_id);
			},
			{
				phase: 'dragStart',
				node: instance.ctx.currentlyDraggedNode,
			},
		);

		if (!capture_result.ok) {
			cleanup_active_node(e.pointerId);
			return;
		}

		// Modify this if draggable_node is SVG
		// Calculate scale differently for SVG vs HTML
		let inverse_scale = 1;
		if (draggable_node instanceof SVGElement) {
			// For SVG elements, use the bounding box for scale
			const bbox = (draggable_node as SVGGraphicsElement).getBBox();
			const rect = instance.ctx.cachedRootNodeRect;
			// Only calculate scale if we have valid dimensions
			if (bbox.width && rect.width) {
				inverse_scale = bbox.width / rect.width;
			}
		} else {
			// For HTML elements, use the original calculation
			inverse_scale = draggable_node.offsetWidth / instance.ctx.cachedRootNodeRect.width;
		}

		if (instance.ctx.proposed.x != null) {
			instance.ctx.initial.x = e.clientX - instance.ctx.offset.x / inverse_scale;
		}
		if (instance.ctx.proposed.y != null) {
			instance.ctx.initial.y = e.clientY - instance.ctx.offset.y / inverse_scale;
		}
	}

	function handle_pointer_move(e: PointerEvent) {
		const draggable_node = active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		if (!instance.ctx.isInteracting) return;

		instance.ctx.lastEvent = e;

		if (!instance.ctx.isDragging) {
			instance.dragstart_prevented = false;
			run_plugins(instance, 'drag', e);

			// Bottom: Even if its cancelled, it should still run the plugins that have cancellable: false
			if (!instance.dragstart_prevented) {
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
		const draggable_node = active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		if (!instance.ctx.isInteracting) return;

		if (instance.ctx.isDragging) {
			listen(draggable_node as HTMLElement, 'click', (e) => e.stopPropagation(), {
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

	function initialize_plugins(new_plugins: Plugin[]) {
		// Avoid creating new array unnecessarily
		if (initial_plugins.length === 0) {
			return new_plugins.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
		}

		// Only create new array if we actually need to combine
		const combined = new Array(new_plugins.length + initial_plugins.length);
		for (let i = 0; i < new_plugins.length; i++) {
			combined[i] = new_plugins[i];
		}
		for (let i = 0; i < initial_plugins.length; i++) {
			combined[new_plugins.length + i] = initial_plugins[i];
		}
		return combined.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
	}

	function update(instance: DraggableInstance, new_plugins: Plugin[] = []): void {
		// Early return if no plugins and instance has no plugins
		if (!new_plugins.length && !instance.plugins.length) {
			return;
		}

		// Check if instance is currently dragging or interacting
		const is_active = instance.ctx.isDragging || instance.ctx.isInteracting;

		// Initialize plugins only if needed
		const new_plugin_list = is_active
			? new_plugins.filter((p) => p.liveUpdate)
			: initialize_plugins(new_plugins);

		if (is_active) {
			// Fast path for active instances
			let has_changes = false;
			const len = new_plugin_list.length;

			// Use for loop for better performance
			for (let i = 0; i < len; i++) {
				const plugin = new_plugin_list[i];
				const old_plugin = find_plugin_by_name(instance.plugins, plugin.name);

				if (update_plugin_if_needed(instance, old_plugin, plugin)) {
					has_changes = true;
				}
			}

			// Only rerun drag if changes occurred and we have a last event
			if (has_changes && instance.ctx.lastEvent && is_node_active(instance.root_node)) {
				handle_pointer_move(instance.ctx.lastEvent);
			}

			return;
		}

		// Inactive instance path
		let has_changes = false;

		// Process removals first
		if (instance.plugins.length > 0) {
			const removed = find_removed_plugins(instance.plugins, new_plugin_list);
			if (removed.length > 0) {
				cleanup_plugins(instance, removed);
				has_changes = true;
			}
		}

		// Process updates and additions
		const len = new_plugin_list.length;
		for (let i = 0; i < len; i++) {
			const plugin = new_plugin_list[i];
			const old_plugin = find_plugin_by_name(instance.plugins, plugin.name);

			if (update_plugin_if_needed(instance, old_plugin, plugin)) {
				has_changes = true;
			}
		}

		// Update instance plugins only if needed
		if (has_changes) {
			instance.plugins = new_plugin_list;
		}
	}

	// Helper functions to improve readability and reusability
	function find_plugin_by_name(plugins: Plugin[], name: string): Plugin | undefined {
		const len = plugins.length;
		for (let i = 0; i < len; i++) {
			if (plugins[i].name === name) {
				return plugins[i];
			}
		}
		return undefined;
	}

	function update_plugin_if_needed(
		instance: DraggableInstance,
		old_plugin: Plugin | undefined,
		new_plugin: Plugin,
	): boolean {
		// Skip if same instance and not live-updateable
		if (old_plugin === new_plugin && !new_plugin.liveUpdate) {
			return false;
		}

		// Clean up old instance if different
		if (old_plugin && old_plugin !== new_plugin) {
			old_plugin.cleanup?.(instance.ctx, instance.states.get(old_plugin.name));
			instance.states.delete(old_plugin.name);
		}

		// Setup new plugin
		const state = new_plugin.setup?.(instance.ctx);
		if (state) {
			instance.states.set(new_plugin.name, state);
		}

		return true;
	}

	function find_removed_plugins(old_plugins: Plugin[], new_plugins: Plugin[]): Plugin[] {
		return old_plugins.filter((p) => !new_plugins.some((np) => np.name === p.name));
	}

	function cleanup_plugins(instance: DraggableInstance, plugins: Plugin[]): void {
		const len = plugins.length;
		for (let i = 0; i < len; i++) {
			const plugin = plugins[i];
			plugin.cleanup?.(instance.ctx, instance.states.get(plugin.name));
			instance.states.delete(plugin.name);
		}
	}

	function is_node_active(node: HTMLElement | SVGElement): boolean {
		for (const activeNode of active_nodes.values()) {
			if (activeNode === node) return true;
		}
		return false;
	}

	function destroy(instance: DraggableInstance) {
		for (const [pointer_id, active_node] of active_nodes) {
			if (active_node === instance.root_node) {
				cleanup_active_node(pointer_id);
			}
		}

		for (const plugin of instance.plugins) {
			plugin.cleanup?.(instance.ctx, instance.states.get(plugin.name));
		}

		instances.delete(instance.root_node);
	}

	// Dispose all draggable instances. Can't be recreated again
	function dispose() {
		for (const instance of instances.values()) {
			destroy(instance);
		}
	}

	return {
		instances,
		draggable: (node: HTMLElement | SVGElement, plugins: Plugin[] = []) => {
			initialize_listeners();

			const instance: DraggableInstance = {
				ctx: {} as DeepMutable<PluginContext>,
				root_node: node,
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
				lastEvent: null,
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

				propose: (x: number | null, y: number | null) => {
					instance.ctx.proposed.x = x;
					instance.ctx.proposed.y = y;
				},

				cancel() {
					instance.current_drag_hook_cancelled = true;
				},

				preventStart() {
					instance.dragstart_prevented = true;
				},
			};

			// Initial setup
			instance.plugins = initialize_plugins(plugins);
			for (const plugin of instance.plugins) {
				resultify(
					() => {
						const value = plugin.setup?.(instance.ctx);
						if (value) instance.states.set(plugin.name, value);
						flush_effects(instance);
					},
					{
						phase: 'setup',
						plugin: { name: plugin.name, hook: 'setup' },
						node: instance.root_node,
					},
				);
			}

			// Register instance
			instances.set(node, instance);

			return {
				update: (newOptions: Plugin[]) => update(instance, newOptions),

				destroy() {
					destroy(instance);
				},
			};
		},

		dispose,

		[Symbol.dispose]: dispose,
	};
}

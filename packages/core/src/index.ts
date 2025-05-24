import {
	applyUserSelectHack,
	Compartment,
	ignoreMultitouch,
	PluginInput,
	PluginResolver,
	resolve_plugins,
	stateMarker,
	threshold,
	touchAction,
	transform,
	type Plugin,
	type PluginContext,
} from './plugins.ts';
import { is_svg_element, is_svg_svg_element, listen, type DeepMutable } from './utils.ts';

export interface ErrorInfo {
	phase: 'setup' | 'start' | 'drag' | 'end' | 'shouldStart';
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
	failed_plugins: Set<string>;
	pointer_captured_id: number | null;
	effects: {
		paint: Set<() => void>;
		immediate: Set<() => void>;
	};
	controller: AbortController;
	compartments: {
		map: Map<Compartment, Plugin>;
		pending: Set<Compartment>;
		is_flushing: boolean;
	};
	resolver?: PluginResolver;

	// ✅ PID SYSTEM - Add these properties
	is_processing_external_update: boolean;
	update_cycle_id: symbol | null;
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
	plugins?: PluginInput;
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
			// Skip failed plugins
			if (instance.failed_plugins.has(plugin.name)) {
				continue;
			}

			const handler = plugin[hook];
			if (!handler) continue;

			if (instance.current_drag_hook_cancelled && plugin.cancelable) continue;

			const result = resultify(
				() => handler.call(plugin, instance.ctx, instance.states.get(plugin.name), event),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.ctx.rootNode,
				},
			);

			if (!result.ok) {
				// If a plugin fails during any hook execution, mark it as failed
				instance.failed_plugins.add(plugin.name);
				should_run = false;
				break;
			}

			if (result.value === false) {
				should_run = false;
				break;
			}
		}

		return should_run;
	}

	function flush_effects(instance: DraggableInstance) {
		const paint_effects = new Set(instance.effects.paint);
		const immediate_effects = new Set(instance.effects.immediate);

		// Store effects locally and clear the instance effects immediately
		// This prevents new effects added during execution from being lost
		clear_effects(instance);

		queueMicrotask(() => {
			for (const effect of immediate_effects) {
				effect();
			}
		});

		requestAnimationFrame(() => {
			for (const effect of paint_effects) {
				effect();
			}
		});
	}

	function clear_effects(instance: DraggableInstance) {
		instance.effects.immediate.clear();
		instance.effects.paint.clear();
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
					phase: 'end',
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

		const instance = instances.get(draggable_node);
		if (!instance) return;

		// Cache it right here
		// TODO: It could be misleading, since the x and y wont be updated in drag. Maybe only expose the dimensions
		instance.ctx.cachedRootNodeRect = draggable_node.getBoundingClientRect();

		const inverse_scale = calculate_inverse_scale(instance);

		instance.ctx.initial.x = e.clientX - instance.ctx.offset.x / inverse_scale;
		instance.ctx.initial.y = e.clientY - instance.ctx.offset.y / inverse_scale;

		const should_drag = run_plugins(instance, 'shouldStart', e);
		if (!should_drag) return;

		instance.ctx.isInteracting = true;
		active_nodes.set(e.pointerId, draggable_node);

		const capture_result = resultify(
			() => {
				instance.pointer_captured_id = e.pointerId;
				instance.ctx.currentlyDraggedNode.setPointerCapture(instance.pointer_captured_id);
			},
			{
				phase: 'start',
				node: instance.ctx.currentlyDraggedNode,
			},
		);

		if (!capture_result.ok) {
			cleanup_active_node(e.pointerId);
			return;
		}
	}

	function handle_pointer_move(e: PointerEvent, sync_only = false) {
		const draggable_node = active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = instances.get(draggable_node)!;
		if (!instance.ctx.isInteracting) return;

		// ✅ Prevent re-entry during external update processing
		if (instance.is_processing_external_update && instance.ctx.lastEvent === e) {
			console.warn('Preventing recursive handle_pointer_move during external update');
			return;
		}

		instance.ctx.lastEvent = e;

		if (!instance.ctx.isDragging) {
			instance.dragstart_prevented = false;
			run_plugins(instance, 'drag', e);

			// Bottom: Even if its cancelled, it should still run the plugins that have cancellable: false
			if (!instance.dragstart_prevented) {
				const start_drag = run_plugins(instance, 'start', e);
				if (!start_drag) return clear_effects(instance);
				else flush_effects(instance);

				instance.ctx.isDragging = true;
			}

			if (!instance.ctx.isDragging) return;
		}

		e.preventDefault();

		if (!sync_only) {
			instance.ctx.delta.x = e.clientX - instance.ctx.initial.x - instance.ctx.offset.x;
			instance.ctx.delta.y = e.clientY - instance.ctx.initial.y - instance.ctx.offset.y;

			// Core proposes delta
			instance.ctx.proposed.x = instance.ctx.delta.x;
			instance.ctx.proposed.y = instance.ctx.delta.y;
		}

		// Run the plugins
		const run_result = run_plugins(instance, 'drag', e);

		if (run_result) flush_effects(instance);
		else return clear_effects(instance);

		if (!sync_only) {
			// Whatever offset we have had till now since the draggable() was mounted, add proposals to it, as long as they're not null
			instance.ctx.offset.x += instance.ctx.proposed.x ?? 0;
			instance.ctx.offset.y += instance.ctx.proposed.y ?? 0;
		}
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
		run_plugins(instance, 'end', e);
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
		// Create combined array
		const combined = new_plugins.concat(initial_plugins);

		// Sort by priority and deduplicate in one pass
		return Array.from(
			combined
				.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
				.reduce((map, plugin) => {
					if (!map.has(plugin.name)) {
						map.set(plugin.name, plugin);
					}
					return map;
				}, new Map<string, Plugin>())
				.values(),
		) as Plugin[];
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

	// Add a new function to process pending compartment updates
	function process_pending_compartment_updates(instance: DraggableInstance, is_external = false) {
		if (instance.compartments.is_flushing || instance.compartments.pending.size === 0) {
			return;
		}

		// ✅ CRITICAL FIX: Block recursive internal updates
		if (!is_external && instance.is_processing_external_update) {
			console.warn('Blocking recursive compartment update to prevent infinite loop');
			return;
		}

		instance.compartments.is_flushing = true;

		// ✅ Mark external updates and assign unique cycle ID
		if (is_external) {
			instance.is_processing_external_update = true;
			instance.update_cycle_id = Symbol('external_update');
		}

		queueMicrotask(() => {
			// Store reference to pending items and clear for next batch
			const pending = new Set(instance.compartments.pending);
			instance.compartments.pending.clear();
			instance.compartments.is_flushing = false;

			let has_changes = false;

			// Process all pending compartment updates
			for (const compartment of pending) {
				const new_plugin = compartment.current;
				const old_plugin = instance.plugins.find(
					(p) => p === instance.compartments.map.get(compartment),
				);

				if (old_plugin) {
					// Skip if same instance and not live-updateable
					if (old_plugin === new_plugin && !new_plugin.liveUpdate) {
						continue;
					}

					// Update plugin reference
					instance.plugins[instance.plugins.indexOf(old_plugin)] = new_plugin;
					instance.compartments.map.set(compartment, new_plugin);

					// Update all plugins that have liveUpdate enabled
					for (const plugin of instance.plugins) {
						if (plugin.liveUpdate) {
							const old = instance.plugins.find((p) => p.name === plugin.name);
							if (update_plugin_if_needed(instance, old, plugin)) {
								has_changes = true;
							}
						}
					}
				}
			}

			// If changes occurred and we have a last event, rerun drag
			if (is_external && !instance.ctx.isDragging && has_changes && instance.ctx.lastEvent) {
				handle_pointer_move(instance.ctx.lastEvent, true);
			}

			// ✅ Reset flags AFTER processing
			instance.compartments.is_flushing = false;
			if (is_external) {
				instance.is_processing_external_update = false;
				instance.update_cycle_id = null;
			}

			flush_effects(instance);

			// Check if new updates came in while we were processing
			if (instance.compartments.pending.size > 0) {
				setTimeout(() => {
					process_pending_compartment_updates(instance, false);
				}, 0);
			}
		});
	}

	function calculate_inverse_scale(instance: DraggableInstance) {
		const draggable_node = instance.ctx.rootNode;

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
			// @ts-ignore
			inverse_scale = draggable_node.offsetWidth / instance.ctx.cachedRootNodeRect.width;
		}

		// Fallback to 1 if calculation results in NaN or invalid value
		if (isNaN(inverse_scale) || inverse_scale <= 0) {
			inverse_scale = 1;
		}

		return inverse_scale;
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
		draggable: (node: HTMLElement | SVGElement, plugins: PluginInput = []) => {
			if (is_svg_svg_element(node)) {
				throw new Error(
					'Dragging the root SVG element directly is not recommended. ' +
						'Instead, either:\n' +
						'1. Wrap your SVG in a div and make the div draggable\n' +
						'2. Use viewBox manipulation if you want to pan the SVG canvas\n' +
						'3. Or if you really need to transform the SVG element, use CSS transforms',
				);
			}

			initialize_listeners();

			const instance: DraggableInstance = {
				ctx: {} as DeepMutable<PluginContext>,
				root_node: node,
				plugins: [],
				states: new Map<string, any>(),
				controller: new AbortController(),
				failed_plugins: new Set<string>(),
				dragstart_prevented: false,
				current_drag_hook_cancelled: false,
				pointer_captured_id: null,
				effects: {
					immediate: new Set<() => void>(),
					paint: new Set<() => void>(),
				},
				compartments: {
					map: new Map(),
					pending: new Set(),
					is_flushing: false,
				},
				resolver: typeof plugins === 'function' ? plugins : undefined,

				// ✅ Initialize PID system
				is_processing_external_update: false,
				update_cycle_id: null,
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

				effect: {
					immediate: (func) => {
						instance.effects.immediate.add(func);
					},

					paint: (func) => {
						instance.effects.paint.add(func);
					},
				},

				propose(x: number | null, y: number | null) {
					this.proposed.x = x;
					this.proposed.y = y;
				},

				cancel() {
					instance.current_drag_hook_cancelled = true;
				},

				preventStart() {
					instance.dragstart_prevented = true;
				},

				setForcedPosition(x, y) {
					this.offset.x = x;
					this.offset.y = y;
				},
			};

			const subscriptions = new Set<() => void>();

			if (typeof plugins === 'function') {
				// Manual mode
				const resolved = plugins();
				const resolved_plugins = resolve_plugins(resolved, instance.compartments.map);
				instance.plugins = initialize_plugins(resolved_plugins);

				// Set up compartment subscriptions
				resolved.forEach((item) => {
					if (item instanceof Compartment) {
						subscriptions.add(
							item.subscribe(() => {
								// Add to pending updates and trigger processing
								instance.compartments.pending.add(item);
								process_pending_compartment_updates(instance, true);
							}),
						);
					}
				});
			} else {
				// Automatic mode (existing behavior)
				instance.plugins = initialize_plugins(plugins);
			}

			for (const plugin of instance.plugins) {
				const result = resultify(
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

				if (!result.ok) {
					instance.failed_plugins.add(plugin.name);
				}
			}

			// Register instance
			instances.set(node, instance);

			return {
				destroy: () => {
					subscriptions.forEach((unsubscribe) => unsubscribe());
					subscriptions.clear();
					destroy(instance);
				},
			};
		},

		dispose,
	};
}

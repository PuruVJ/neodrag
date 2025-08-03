import {
	applyUserSelectHack,
	Compartment,
	ignoreMultitouch,
	stateMarker,
	threshold,
	touchAction,
	transform,
	type Plugin,
	type PluginContext,
	type PluginInput,
	type PluginResolver,
} from './plugins.ts';
import { is_svg_element, is_svg_svg_element, listen, type DeepMutable } from './utils.ts';
import * as $ from './symbols.ts';

export interface ErrorInfo {
	phase: 'setup' | 'start' | 'drag' | 'end' | 'shouldStart';
	plugin?: {
		name: string;
		hook: string;
	};
	node: HTMLElement | SVGElement;
	error: unknown;
}

type PublicInstance = DeepMutable<PluginContext>;

export interface DraggableInstance extends PublicInstance {
	[$.root_node]: HTMLElement | SVGElement;
	[$.plugins]: Plugin[];
	[$.controller]: AbortController;
	[$.resolver]: PluginResolver | undefined;
	[$.plugin_states]: Map<string, any>;
	[$.dragstart_prevented]: boolean;
	[$.current_drag_hook_cancelled]: boolean;
	[$.failed_plugins]: Set<string>;
	[$.pointer_captured_id]: number | null;
	[$.inverse_scale]: number;
	[$.paint_effects]: Set<() => void>;
	[$.immediate_effects]: Set<() => void>;
	[$.compartment_map]: Map<Compartment, Plugin | null | undefined>;
	[$.pending_compartments]: Set<Compartment>;
	[$.is_flushing_compartments]: boolean;
	[$.is_processing_external_update]: boolean;
	[$.proposed_x]: number | null;
	[$.proposed_y]: number | null;
	[$.delta_x]: number;
	[$.delta_y]: number;
	[$.offset_x]: number;
	[$.offset_y]: number;
	[$.initial_x]: number;
	[$.initial_y]: number;
	[$.is_dragging]: boolean;
	[$.is_interacting]: boolean;
	[$.last_event]: PointerEvent | null;
	[$.cached_root_node_rect]: DOMRect;
	[$.currently_dragged_node]: HTMLElement | SVGElement;
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

	delegate: () => document.documentElement,
};

export class DraggableFactory {
	#instances = new Map<HTMLElement | SVGElement, DraggableInstance>();
	#listeners_initialized = false;
	#active_nodes = new Map<number, HTMLElement | SVGElement>();
	#last_target: Element | null = null;
	#last_result: HTMLElement | SVGElement | null = null;

	#initial_plugins: Plugin[];
	#delegateTargetFn: () => HTMLElement;
	#onError?: (error: ErrorInfo) => void;

	constructor({ plugins, delegate, onError }: typeof DEFAULTS) {
		this.#initial_plugins = plugins;
		this.#delegateTargetFn = delegate;
		this.#onError = onError;
	}

	get instances() {
		return this.#instances;
	}

	draggable(node: HTMLElement | SVGElement, plugins: PluginInput = []) {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. ' +
					'Instead, either:\n' +
					'1. Wrap your SVG in a div and make the div draggable\n' +
					'2. Use viewBox manipulation if you want to pan the SVG canvas\n' +
					'3. Or if you really need to transform the SVG element, use CSS transforms',
			);
		}

		this.#initialize_listeners();

		const instance = this.#create_instance(node, plugins);
		this.#instances.set(node, instance);

		const cleanup_subscriptions = this.#setup_plugins(instance, plugins);

		return () => {
			cleanup_subscriptions();
			this.#destroy_instance(instance);
		};
	}

	dispose() {
		for (const instance of this.#instances.values()) {
			this.#destroy_instance(instance);
		}
	}

	#resultify<T>(fn: () => T, errorInfo: Omit<ErrorInfo, 'error'>): Result<T> {
		try {
			return { ok: true, value: fn() };
		} catch (error) {
			this.#report_error(errorInfo, error);
			return { ok: false, error };
		}
	}

	#report_error(info: Omit<ErrorInfo, 'error'>, error: unknown) {
		if (this.#onError) {
			this.#onError({ ...info, error });
		}
	}

	#initialize_listeners() {
		if (this.#listeners_initialized) return;

		const delegateTarget = this.#delegateTargetFn();

		listen(delegateTarget, 'pointerdown', this.#handle_pointer_down.bind(this), {
			passive: true,
			capture: false,
		});
		listen(delegateTarget, 'pointermove', this.#handle_pointer_move.bind(this), {
			passive: false,
			capture: false,
		});
		listen(delegateTarget, 'pointerup', this.#handle_pointer_up.bind(this), {
			passive: true,
			capture: false,
		});
		listen(delegateTarget, 'pointercancel', this.#handle_pointer_up.bind(this), {
			passive: true,
			capture: false,
		});

		this.#listeners_initialized = true;
	}

	#create_instance(node: HTMLElement | SVGElement, plugins: PluginInput) {
		const instance: DraggableInstance = {
			[$.root_node]: node,
			[$.plugins]: [],
			[$.controller]: new AbortController(),
			[$.resolver]: typeof plugins === 'function' ? plugins : undefined,
			[$.plugin_states]: new Map<string, any>(),
			[$.failed_plugins]: new Set<string>(),
			[$.dragstart_prevented]: false,
			[$.current_drag_hook_cancelled]: false,
			[$.pointer_captured_id]: null,
			[$.inverse_scale]: 1,
			[$.paint_effects]: new Set<() => void>(),
			[$.immediate_effects]: new Set<() => void>(),
			[$.compartment_map]: new Map(),
			[$.pending_compartments]: new Set(),
			[$.is_flushing_compartments]: false,
			[$.is_processing_external_update]: false,
			[$.proposed_x]: 0,
			[$.proposed_y]: 0,
			[$.delta_x]: 0,
			[$.delta_y]: 0,
			[$.offset_x]: 0,
			[$.offset_y]: 0,
			[$.initial_x]: 0,
			[$.initial_y]: 0,
			[$.is_dragging]: false,
			[$.is_interacting]: false,
			[$.last_event]: null,
			[$.cached_root_node_rect]: node.getBoundingClientRect(),
			[$.currently_dragged_node]: node,

			// PluginContext properties
			get proposed() {
				return { x: instance[$.proposed_x], y: instance[$.proposed_y] };
			},
			get delta() {
				return { x: instance[$.delta_x], y: instance[$.delta_y] };
			},
			get offset() {
				return { x: instance[$.offset_x], y: instance[$.offset_y] };
			},
			get initial() {
				return { x: instance[$.initial_x], y: instance[$.initial_y] };
			},
			get isDragging() {
				return instance[$.is_dragging];
			},
			set isDragging(val) {
				instance[$.is_dragging] = val;
			},
			get isInteracting() {
				return instance[$.is_interacting];
			},
			set isInteracting(val) {
				instance[$.is_interacting] = val;
			},
			rootNode: node,
			get cachedRootNodeRect() {
				return instance[$.cached_root_node_rect];
			},
			set cachedRootNodeRect(val) {
				instance[$.cached_root_node_rect] = val;
			},
			get lastEvent() {
				return instance[$.last_event];
			},
			set lastEvent(val) {
				instance[$.last_event] = val;
			},
			get currentlyDraggedNode() {
				return instance[$.currently_dragged_node];
			},
			set currentlyDraggedNode(val) {
				if (
					instance[$.pointer_captured_id] &&
					instance[$.currently_dragged_node].hasPointerCapture(instance[$.pointer_captured_id])
				) {
					instance[$.currently_dragged_node].releasePointerCapture(instance[$.pointer_captured_id]);
					val.setPointerCapture(instance[$.pointer_captured_id]);
				}
				instance[$.currently_dragged_node] = val;
			},
			effect: {
				immediate: (func) => {
					instance[$.immediate_effects].add(func);
				},
				paint: (func) => {
					instance[$.paint_effects].add(func);
				},
			},
			propose(x: number | null, y: number | null) {
				instance[$.proposed_x] = x;
				instance[$.proposed_y] = y;
			},
			cancel() {
				instance[$.current_drag_hook_cancelled] = true;
			},
			preventStart() {
				instance[$.dragstart_prevented] = true;
			},
			setForcedPosition(x, y) {
				instance[$.offset_x] = x;
				instance[$.offset_y] = y;
			},
		};

		return instance;
	}

	#setup_plugins(instance: DraggableInstance, plugins: PluginInput) {
		const subscriptions = new Set<() => void>();

		if (typeof plugins === 'function') {
			// Manual mode
			const resolved = plugins();
			const resolved_plugins = this.#resolve_plugins(resolved, instance[$.compartment_map]);
			instance[$.plugins] = this.#initialize_plugins(resolved_plugins);

			// Set up compartment subscriptions
			for (const item of resolved)
				if (item instanceof Compartment) {
					subscriptions.add(
						item.subscribe(() => {
							instance[$.pending_compartments].add(item);
							this.#process_pending_compartment_updates(instance, true);
						}),
					);
				}
		} else {
			// Automatic mode
			instance[$.plugins] = this.#initialize_plugins(plugins);
		}

		// Initialize plugin states
		for (const plugin of instance[$.plugins]) {
			const result = this.#resultify(
				() => {
					const value = plugin.setup?.(instance as PublicInstance);
					if (value) instance[$.plugin_states].set(plugin.name, value);
					this.#flush_effects(instance);
				},
				{
					phase: 'setup',
					plugin: { name: plugin.name, hook: 'setup' },
					node: instance[$.root_node],
				},
			);

			if (!result.ok) {
				instance[$.failed_plugins].add(plugin.name);
			}
		}

		// Return cleanup function for subscriptions
		return () => {
			subscriptions.forEach((unsubscribe) => unsubscribe());
			subscriptions.clear();
		};
	}

	#initialize_plugins(new_plugins: Plugin[]) {
		const combined = this.#initial_plugins.concat(new_plugins);

		return Array.from(
			combined
				.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
				.reduce((map, plugin) => {
					map.set(plugin.name, plugin);
					return map;
				}, new Map<string, Plugin>())
				.values(),
		) as Plugin[];
	}

	#resolve_plugins(
		items: (Plugin | Compartment)[],
		compartments: Map<Compartment, Plugin | null | undefined>,
	): Plugin[] {
		return items
			.map((item) => {
				if (item instanceof Compartment) {
					const current = item.current;
					compartments.set(item, current);
					return current;
				}
				return item;
			})
			.filter((plugin): plugin is Plugin => plugin != undefined); // Filter out undefined
	}

	#run_plugins(instance: DraggableInstance, hook: ErrorInfo['phase'], event: PointerEvent) {
		let should_run = true;
		instance[$.dragstart_prevented] = false;

		for (const plugin of instance[$.plugins]) {
			if (instance[$.failed_plugins].has(plugin.name)) {
				continue;
			}

			const handler = plugin[hook];
			if (!handler) continue;

			if (instance[$.current_drag_hook_cancelled] && plugin.cancelable) continue;

			const result = this.#resultify(
				() =>
					handler.call(
						plugin,
						instance as PublicInstance,
						instance[$.plugin_states].get(plugin.name),
						event,
					),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.rootNode,
				},
			);

			if (!result.ok) {
				instance[$.failed_plugins].add(plugin.name);
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

	#flush_effects(instance: DraggableInstance) {
		const paint_effects = new Set(instance[$.paint_effects]);
		const immediate_effects = new Set(instance[$.immediate_effects]);

		this.#clear_effects(instance);

		queueMicrotask(() => {
			// Add all effects to the batcher
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

	#clear_effects(instance: DraggableInstance) {
		instance[$.immediate_effects].clear();
		instance[$.paint_effects].clear();
	}

	#handle_pointer_down(e: PointerEvent) {
		if (e.button === 2) return;

		const draggable_node = this.#find_draggable_node(e);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node);
		if (!instance) return;

		instance.cachedRootNodeRect = draggable_node.getBoundingClientRect();

		instance[$.inverse_scale] = this.#calculate_inverse_scale(instance);
		instance[$.initial_x] = e.clientX - instance.offset.x / instance[$.inverse_scale];
		instance[$.initial_y] = e.clientY - instance.offset.y / instance[$.inverse_scale];

		const should_drag = this.#run_plugins(instance, 'shouldStart', e);
		if (!should_drag) return;

		instance[$.is_interacting] = true;
		this.#active_nodes.set(e.pointerId, draggable_node);
	}

	#handle_pointer_move(e: PointerEvent, sync_only = false) {
		const draggable_node = this.#active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node)!;
		if (!instance.isInteracting) return;

		if (instance[$.is_processing_external_update] && instance.lastEvent === e) {
			// console.warn('Preventing recursive handle_pointer_move during external update');
			return;
		}

		instance.lastEvent = e;

		if (!instance.isDragging) {
			instance[$.dragstart_prevented] = false;
			this.#run_plugins(instance, 'drag', e);

			if (!instance[$.dragstart_prevented]) {
				const start_drag = this.#run_plugins(instance, 'start', e);
				if (!start_drag) return this.#clear_effects(instance);
				else this.#flush_effects(instance);

				const capture_result = this.#resultify(
					() => {
						instance[$.pointer_captured_id] = e.pointerId;
						instance.currentlyDraggedNode.setPointerCapture(instance[$.pointer_captured_id]);
					},
					{
						phase: 'start',
						node: instance.currentlyDraggedNode,
					},
				);

				if (!capture_result.ok) {
					this.#cleanup_active_node(e.pointerId);
				}

				instance.isDragging = true;
			}

			if (!instance.isDragging) return;
		}

		e.preventDefault();

		if (!sync_only) {
			const target_offset_x = (e.clientX - instance.initial.x) * instance[$.inverse_scale];
			const target_offset_y = (e.clientY - instance.initial.y) * instance[$.inverse_scale];

			instance[$.delta_x] = target_offset_x - instance[$.offset_x];
			instance[$.delta_y] = target_offset_y - instance[$.offset_y];

			instance[$.proposed_x] = instance[$.delta_x];
			instance[$.proposed_y] = instance[$.delta_y];
		}

		const run_result = this.#run_plugins(instance, 'drag', e);

		if (run_result) this.#flush_effects(instance);
		else return this.#clear_effects(instance);

		if (!sync_only) {
			instance[$.offset_x] += instance[$.proposed_x] ?? 0;
			instance[$.offset_y] += instance[$.proposed_y] ?? 0;
		}
	}

	#handle_pointer_up(e: PointerEvent) {
		const draggable_node = this.#active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node)!;
		if (!instance.isInteracting) return;

		if (instance.isDragging) {
			listen(draggable_node as HTMLElement, 'click', (e) => e.stopPropagation(), {
				once: true,
				signal: instance[$.controller].signal,
				capture: true,
			});
		}

		if (
			instance[$.pointer_captured_id] &&
			instance.currentlyDraggedNode.hasPointerCapture(instance[$.pointer_captured_id])
		) {
			instance.currentlyDraggedNode.releasePointerCapture(instance[$.pointer_captured_id]);
		}

		this.#run_plugins(instance, 'end', e);
		this.#flush_effects(instance);

		if (instance[$.proposed_x] !== null)
			instance[$.initial_x] = e.clientX - instance[$.offset_x] / instance[$.inverse_scale];
		if (instance[$.proposed_y] !== null)
			instance[$.initial_y] = e.clientY - instance[$.offset_y] / instance[$.inverse_scale];

		instance[$.proposed_x] = 0;
		instance[$.proposed_y] = 0;
		instance[$.is_interacting] = false;
		instance[$.is_dragging] = false;
		instance[$.dragstart_prevented] = false;
		instance[$.pointer_captured_id] = null;
		this.#clear_effects(instance);
	}

	#find_draggable_node(e: PointerEvent): HTMLElement | SVGElement | null {
		const target = e.target as Element;

		if (target === this.#last_target) {
			return this.#last_result;
		}

		const path = e.composedPath();
		const max_depth = Math.min(path.length, 20);

		for (let i = 0; i < max_depth; i++) {
			const el = path[i];

			if (
				(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
				this.#instances.has(el as HTMLElement | SVGElement)
			) {
				this.#last_target = target;
				this.#last_result = el as HTMLElement | SVGElement;
				return this.#last_result;
			}

			if (el === document || el === document.body) break;
		}

		// Cache negative result
		this.#last_target = target;
		this.#last_result = null;
		return null;
	}

	#cleanup_active_node(pointer_id: number) {
		const node = this.#active_nodes.get(pointer_id);
		if (!node) return;

		const instance = this.#instances.get(node);
		if (!instance) return;

		if (
			instance[$.pointer_captured_id] &&
			instance.currentlyDraggedNode.hasPointerCapture(instance[$.pointer_captured_id])
		) {
			this.#resultify(
				() => {
					instance.currentlyDraggedNode.releasePointerCapture(instance[$.pointer_captured_id]!);
				},
				{
					phase: 'end',
					node,
				},
			);
		}

		instance[$.is_interacting] = false;
		instance[$.is_dragging] = false;
		instance[$.dragstart_prevented] = false;
		instance[$.pointer_captured_id] = null;
		this.#active_nodes.delete(pointer_id);
		this.#clear_effects(instance);
	}

	#calculate_inverse_scale(instance: DraggableInstance) {
		const draggable_node = instance.rootNode;
		let inverse_scale = 1;

		if (draggable_node instanceof SVGElement) {
			const bbox = (draggable_node as SVGGraphicsElement).getBBox();
			const rect = instance.cachedRootNodeRect;
			if (bbox.width && rect.width) {
				inverse_scale = bbox.width / rect.width;
			}
		} else {
			// @ts-ignore
			inverse_scale = draggable_node.offsetWidth / instance.cachedRootNodeRect.width;
		}

		if (isNaN(inverse_scale) || inverse_scale <= 0) {
			inverse_scale = 1;
		}

		return inverse_scale;
	}

	#destroy_instance(instance: DraggableInstance) {
		for (const [pointer_id, active_node] of this.#active_nodes) {
			if (active_node === instance[$.root_node]) {
				this.#cleanup_active_node(pointer_id);
			}
		}

		for (const plugin of instance[$.plugins]) {
			plugin.cleanup?.(instance as PublicInstance, instance[$.plugin_states].get(plugin.name));
		}

		instance[$.controller].abort();

		this.instances.delete(instance[$.root_node]);
	}

	#process_pending_compartment_updates(instance: DraggableInstance, is_external = false) {
		if (instance[$.is_flushing_compartments] || instance[$.pending_compartments].size === 0) {
			return;
		}

		// ✅ CRITICAL FIX: Block recursive internal updates
		if (!is_external && instance[$.is_processing_external_update]) {
			// console.warn('Blocking recursive compartment update to prevent infinite loop');
			return;
		}

		instance[$.is_flushing_compartments] = true;

		// ✅ Mark external updates and assign unique cycle ID
		if (is_external) {
			instance[$.is_processing_external_update] = true;
		}

		queueMicrotask(() => {
			// Store reference to pending items and clear for next batch
			const pending = new Set(instance[$.pending_compartments]);
			instance[$.pending_compartments].clear();
			instance[$.is_flushing_compartments] = false;

			let has_changes = false;

			// Process all pending compartment updates
			for (const compartment of pending) {
				const new_plugin = compartment.current;
				const old_plugin = instance[$.plugins].find(
					(p: Plugin) => p === instance[$.compartment_map].get(compartment),
				);

				if (old_plugin) {
					if (new_plugin == undefined) {
						// Remove the plugin
						const plugin_index = instance[$.plugins].indexOf(old_plugin);
						old_plugin.cleanup?.(
							instance as PublicInstance,
							instance[$.plugin_states].get(old_plugin.name),
						);
						instance[$.plugin_states].delete(old_plugin.name);
						instance[$.plugins].splice(plugin_index, 1);
						instance[$.compartment_map].set(compartment, undefined);
						has_changes = true;
					} else {
						// Skip if same instance and not live-updateable
						if (old_plugin === new_plugin && !new_plugin.liveUpdate) {
							continue;
						}

						// Update plugin reference
						instance[$.plugins][instance[$.plugins].indexOf(old_plugin)] = new_plugin;
						instance[$.compartment_map].set(compartment, new_plugin);

						// Update all plugins that have liveUpdate enabled
						for (const plugin of instance[$.plugins]) {
							if (plugin.liveUpdate) {
								const old = instance[$.plugins].find((p: Plugin) => p.name === plugin.name);
								if (this.#update_plugin_if_needed(instance, old, plugin)) {
									has_changes = true;
								}
							}
						}
					}
				} else if (new_plugin != undefined) {
					// Add new plugin when compartment was empty
					instance[$.plugins].push(new_plugin);
					instance[$.compartment_map].set(compartment, new_plugin);

					const setup_result = this.#resultify(
						() => {
							const state = new_plugin.setup?.(instance as PublicInstance);
							if (state) {
								instance[$.plugin_states].set(new_plugin.name, state);
							}
							return state;
						},
						{
							phase: 'setup',
							plugin: { name: new_plugin.name, hook: 'setup' },
							node: instance[$.root_node],
						},
					);

					if (!setup_result.ok) {
						instance[$.failed_plugins].add(new_plugin.name);
					}

					// Use the same update logic as replacement case
					for (const plugin of instance[$.plugins]) {
						if (plugin.liveUpdate && plugin !== new_plugin) {
							const old = instance[$.plugins].find((p: Plugin) => p.name === plugin.name);
							if (this.#update_plugin_if_needed(instance, old, plugin)) {
								has_changes = true;
							}
						}
					}

					has_changes = true;
				}
			}

			// If changes occurred and we have a last event, rerun drag
			if (is_external && !instance.isDragging && has_changes && instance.lastEvent) {
				this.#handle_pointer_move(instance.lastEvent, true);
			}

			// ✅ Reset flags AFTER processing
			instance[$.is_flushing_compartments] = false;
			if (is_external) {
				instance[$.is_processing_external_update] = false;
			}

			this.#flush_effects(instance);

			// Check if new updates came in while we were processing
			if (instance[$.pending_compartments].size > 0) {
				setTimeout(() => {
					this.#process_pending_compartment_updates(instance, false);
				}, 0);
			}
		});
	}

	#update_plugin_if_needed(
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
			old_plugin.cleanup?.(
				instance as PublicInstance,
				instance[$.plugin_states].get(old_plugin.name),
			);
			instance[$.plugin_states].delete(old_plugin.name);
		}

		// Setup new plugin
		const state = new_plugin.setup?.(instance as PublicInstance);
		if (state) {
			instance[$.plugin_states].set(new_plugin.name, state);
		}

		return true;
	}
}

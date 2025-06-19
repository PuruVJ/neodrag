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
		map: Map<Compartment, Plugin | undefined>;
		pending: Set<Compartment>;
		is_flushing: boolean;
	};
	resolver?: PluginResolver;
	is_processing_external_update: boolean;
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

			is_processing_external_update: false,
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

		return instance;
	}

	#setup_plugins(instance: DraggableInstance, plugins: PluginInput) {
		const subscriptions = new Set<() => void>();

		if (typeof plugins === 'function') {
			// Manual mode
			const resolved = plugins();
			const resolved_plugins = this.#resolve_plugins(resolved, instance.compartments.map);
			instance.plugins = this.#initialize_plugins(resolved_plugins);

			// Set up compartment subscriptions
			for (const item of resolved)
				if (item instanceof Compartment) {
					subscriptions.add(
						item.subscribe(() => {
							instance.compartments.pending.add(item);
							this.#process_pending_compartment_updates(instance, true);
						}),
					);
				}
		} else {
			// Automatic mode
			instance.plugins = this.#initialize_plugins(plugins);
		}

		// Initialize plugin states
		for (const plugin of instance.plugins) {
			const result = this.#resultify(
				() => {
					const value = plugin.setup?.(instance.ctx);
					if (value) instance.states.set(plugin.name, value);
					this.#flush_effects(instance);
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

		// Return cleanup function for subscriptions
		return () => {
			subscriptions.forEach((unsubscribe) => unsubscribe());
			subscriptions.clear();
		};
	}

	#initialize_plugins(new_plugins: Plugin[]) {
		const combined = new_plugins.concat(this.#initial_plugins);

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

	#resolve_plugins(
		items: (Plugin | Compartment)[],
		compartments: Map<Compartment, Plugin | undefined>,
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
			.filter((plugin): plugin is Plugin => plugin !== undefined); // Filter out undefined
	}

	#run_plugins(instance: DraggableInstance, hook: ErrorInfo['phase'], event: PointerEvent) {
		let should_run = true;
		instance.dragstart_prevented = false;

		for (const plugin of instance.plugins) {
			if (instance.failed_plugins.has(plugin.name)) {
				continue;
			}

			const handler = plugin[hook];
			if (!handler) continue;

			if (instance.current_drag_hook_cancelled && plugin.cancelable) continue;

			const result = this.#resultify(
				() => handler.call(plugin, instance.ctx, instance.states.get(plugin.name), event),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.ctx.rootNode,
				},
			);

			if (!result.ok) {
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

	#flush_effects(instance: DraggableInstance) {
		const paint_effects = new Set(instance.effects.paint);
		const immediate_effects = new Set(instance.effects.immediate);

		this.#clear_effects(instance);

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

	#clear_effects(instance: DraggableInstance) {
		instance.effects.immediate.clear();
		instance.effects.paint.clear();
	}

	#handle_pointer_down(e: PointerEvent) {
		if (e.button === 2) return;

		const draggable_node = this.#find_draggable_node(e);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node);
		if (!instance) return;

		instance.ctx.cachedRootNodeRect = draggable_node.getBoundingClientRect();

		const inverse_scale = this.#calculate_inverse_scale(instance);
		instance.ctx.initial.x = e.clientX - instance.ctx.offset.x / inverse_scale;
		instance.ctx.initial.y = e.clientY - instance.ctx.offset.y / inverse_scale;

		const should_drag = this.#run_plugins(instance, 'shouldStart', e);
		if (!should_drag) return;

		instance.ctx.isInteracting = true;
		this.#active_nodes.set(e.pointerId, draggable_node);
	}

	#handle_pointer_move(e: PointerEvent, sync_only = false) {
		const draggable_node = this.#active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node)!;
		if (!instance.ctx.isInteracting) return;

		if (instance.is_processing_external_update && instance.ctx.lastEvent === e) {
			// console.warn('Preventing recursive handle_pointer_move during external update');
			return;
		}

		instance.ctx.lastEvent = e;

		if (!instance.ctx.isDragging) {
			instance.dragstart_prevented = false;
			this.#run_plugins(instance, 'drag', e);

			if (!instance.dragstart_prevented) {
				const start_drag = this.#run_plugins(instance, 'start', e);
				if (!start_drag) return this.#clear_effects(instance);
				else this.#flush_effects(instance);

				const capture_result = this.#resultify(
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
					this.#cleanup_active_node(e.pointerId);
				}

				instance.ctx.isDragging = true;
			}

			if (!instance.ctx.isDragging) return;
		}

		e.preventDefault();

		if (!sync_only) {
			instance.ctx.delta.x = e.clientX - instance.ctx.initial.x - instance.ctx.offset.x;
			instance.ctx.delta.y = e.clientY - instance.ctx.initial.y - instance.ctx.offset.y;

			instance.ctx.proposed.x = instance.ctx.delta.x;
			instance.ctx.proposed.y = instance.ctx.delta.y;
		}

		const run_result = this.#run_plugins(instance, 'drag', e);

		if (run_result) this.#flush_effects(instance);
		else return this.#clear_effects(instance);

		if (!sync_only) {
			instance.ctx.offset.x += instance.ctx.proposed.x ?? 0;
			instance.ctx.offset.y += instance.ctx.proposed.y ?? 0;
		}
	}

	#handle_pointer_up(e: PointerEvent) {
		const draggable_node = this.#active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node)!;
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

		this.#run_plugins(instance, 'end', e);
		this.#flush_effects(instance);

		if (instance.ctx.proposed.x) instance.ctx.initial.x = instance.ctx.offset.x;
		if (instance.ctx.proposed.y) instance.ctx.initial.y = instance.ctx.offset.y;

		instance.ctx.proposed.x = 0;
		instance.ctx.proposed.y = 0;
		instance.ctx.isInteracting = false;
		instance.ctx.isDragging = false;
		instance.dragstart_prevented = false;
		instance.pointer_captured_id = null;
		this.#clear_effects(instance);
	}

	#find_draggable_node(e: PointerEvent): HTMLElement | SVGElement | null {
		const path = e.composedPath();
		for (const el of path) {
			if (
				(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
				this.#instances.has(el)
			) {
				return el;
			}
		}
		return null;
	}

	#cleanup_active_node(pointer_id: number) {
		const node = this.#active_nodes.get(pointer_id);
		if (!node) return;

		const instance = this.#instances.get(node);
		if (!instance) return;

		if (
			instance.pointer_captured_id &&
			instance.ctx.currentlyDraggedNode.hasPointerCapture(instance.pointer_captured_id)
		) {
			this.#resultify(
				() => {
					instance.ctx.currentlyDraggedNode.releasePointerCapture(instance.pointer_captured_id!);
				},
				{
					phase: 'end',
					node,
				},
			);
		}

		instance.ctx.isInteracting = false;
		instance.ctx.isDragging = false;
		instance.dragstart_prevented = false;
		instance.pointer_captured_id = null;
		this.#active_nodes.delete(pointer_id);
		this.#clear_effects(instance);
	}

	#calculate_inverse_scale(instance: DraggableInstance) {
		const draggable_node = instance.ctx.rootNode;
		let inverse_scale = 1;

		if (draggable_node instanceof SVGElement) {
			const bbox = (draggable_node as SVGGraphicsElement).getBBox();
			const rect = instance.ctx.cachedRootNodeRect;
			if (bbox.width && rect.width) {
				inverse_scale = bbox.width / rect.width;
			}
		} else {
			// @ts-ignore
			inverse_scale = draggable_node.offsetWidth / instance.ctx.cachedRootNodeRect.width;
		}

		if (isNaN(inverse_scale) || inverse_scale <= 0) {
			inverse_scale = 1;
		}

		return inverse_scale;
	}

	#destroy_instance(instance: DraggableInstance) {
		for (const [pointer_id, active_node] of this.#active_nodes) {
			if (active_node === instance.root_node) {
				this.#cleanup_active_node(pointer_id);
			}
		}

		for (const plugin of instance.plugins) {
			plugin.cleanup?.(instance.ctx, instance.states.get(plugin.name));
		}

		instance.controller.abort();

		this.instances.delete(instance.root_node);
	}

	#process_pending_compartment_updates(instance: DraggableInstance, is_external = false) {
		if (instance.compartments.is_flushing || instance.compartments.pending.size === 0) {
			return;
		}

		// ✅ CRITICAL FIX: Block recursive internal updates
		if (!is_external && instance.is_processing_external_update) {
			// console.warn('Blocking recursive compartment update to prevent infinite loop');
			return;
		}

		instance.compartments.is_flushing = true;

		// ✅ Mark external updates and assign unique cycle ID
		if (is_external) {
			instance.is_processing_external_update = true;
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
					if (new_plugin === undefined) {
						// Remove the plugin
						const plugin_index = instance.plugins.indexOf(old_plugin);
						old_plugin.cleanup?.(instance.ctx, instance.states.get(old_plugin.name));
						instance.states.delete(old_plugin.name);
						instance.plugins.splice(plugin_index, 1);
						instance.compartments.map.set(compartment, undefined);
						has_changes = true;
					} else {
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
								if (this.#update_plugin_if_needed(instance, old, plugin)) {
									has_changes = true;
								}
							}
						}
					}
				} else if (new_plugin !== undefined) {
					// Add new plugin when compartment was empty
					instance.plugins.push(new_plugin);
					instance.compartments.map.set(compartment, new_plugin);

					const setup_result = this.#resultify(
						() => {
							const state = new_plugin.setup?.(instance.ctx);
							if (state) {
								instance.states.set(new_plugin.name, state);
							}
							return state;
						},
						{
							phase: 'setup',
							plugin: { name: new_plugin.name, hook: 'setup' },
							node: instance.root_node,
						},
					);

					if (!setup_result.ok) {
						instance.failed_plugins.add(new_plugin.name);
					}

					// Use the same update logic as replacement case
					for (const plugin of instance.plugins) {
						if (plugin.liveUpdate && plugin !== new_plugin) {
							const old = instance.plugins.find((p) => p.name === plugin.name);
							if (this.#update_plugin_if_needed(instance, old, plugin)) {
								has_changes = true;
							}
						}
					}

					has_changes = true;
				}
			}

			// If changes occurred and we have a last event, rerun drag
			if (is_external && !instance.ctx.isDragging && has_changes && instance.ctx.lastEvent) {
				this.#handle_pointer_move(instance.ctx.lastEvent, true);
			}

			// ✅ Reset flags AFTER processing
			instance.compartments.is_flushing = false;
			if (is_external) {
				instance.is_processing_external_update = false;
			}

			this.#flush_effects(instance);

			// Check if new updates came in while we were processing
			if (instance.compartments.pending.size > 0) {
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
}

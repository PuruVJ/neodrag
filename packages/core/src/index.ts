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
import { DragInstance } from './drag-instance.ts';
import { NEODRAG_EVENT } from './symbols.ts';
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

type PublicInstance = DeepMutable<PluginContext>;

export type DraggableInstance = DragInstance;
export { DragInstance } from './drag-instance.ts';

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
	#instances = new Map<HTMLElement | SVGElement, DragInstance>();
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
		return new DragInstance(node, typeof plugins === 'function' ? plugins : undefined);
	}

	#setup_plugins(instance: DragInstance, plugins: PluginInput) {
		const subscriptions = new Set<() => void>();

		if (typeof plugins === 'function') {
			const resolved = plugins();
			const resolved_plugins = this.#resolve_plugins(resolved, instance.compartmentMap);
			instance.plugins = this.#initialize_plugins(resolved_plugins);

			for (const item of resolved)
				if (item instanceof Compartment) {
					subscriptions.add(
						item.subscribe(() => {
							instance.pendingCompartments.add(item);
							this.#process_pending_compartment_updates(instance, true);
						}),
					);
				}
		} else {
			instance.plugins = this.#initialize_plugins(plugins);
		}

		for (const plugin of instance.plugins) {
			const result = this.#resultify(
				() => {
					const value = plugin.setup?.(instance as PublicInstance);
					if (value) instance.pluginStates.set(plugin.name, value);
					this.#flush_effects(instance);
				},
				{
					phase: 'setup',
					plugin: { name: plugin.name, hook: 'setup' },
					node: instance.rootNode,
				},
			);

			if (!result.ok) {
				instance.failedPlugins.add(plugin.name);
			}
		}

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

	#run_plugins(instance: DragInstance, hook: ErrorInfo['phase'], event: PointerEvent) {
		let should_run = true;
		instance.currentDragHookCancelled = false;
		instance.dragstartPrevented = false;
		instance.syncCoords();

		for (const plugin of instance.plugins) {
			if (instance.failedPlugins.has(plugin.name)) {
				continue;
			}

			const handler = plugin[hook];
			if (!handler) continue;

			if (instance.currentDragHookCancelled && plugin.cancelable) continue;

			const result = this.#resultify(
				() =>
					handler.call(
						plugin,
						instance as PublicInstance,
						instance.pluginStates.get(plugin.name),
						event,
					),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.rootNode,
				},
			);

			if (!result.ok) {
				instance.failedPlugins.add(plugin.name);
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

	#flush_effects(instance: DragInstance) {
		const paint_effects = new Set(instance.paintEffects);
		const immediate_effects = new Set(instance.immediateEffects);

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

	#clear_effects(instance: DragInstance) {
		instance.immediateEffects.clear();
		instance.paintEffects.clear();
	}

	#handle_pointer_down(e: PointerEvent) {
		if (e.button === 2) return;

		const draggable_node = this.#find_draggable_node(e);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node);
		if (!instance) return;

		instance.cachedRootNodeRect = draggable_node.getBoundingClientRect();

		instance.inverseScale = this.#calculate_inverse_scale(instance);
		instance.initialX = e.clientX - instance.offsetX / instance.inverseScale;
		instance.initialY = e.clientY - instance.offsetY / instance.inverseScale;
		instance.syncCoords();

		const should_drag = this.#run_plugins(instance, 'shouldStart', e);
		if (!should_drag) return;

		instance.isInteracting = true;
		this.#active_nodes.set(e.pointerId, draggable_node);
	}

	#handle_pointer_move(e: PointerEvent, sync_only = false) {
		const draggable_node = this.#active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node)!;
		if (!instance.isInteracting) return;

		if (instance.isProcessingExternalUpdate && instance.lastEvent === e) {
			return;
		}

		instance.lastEvent = e;

		if (!instance.isDragging) {
			instance.dragstartPrevented = false;
			this.#run_plugins(instance, 'drag', e);

			if (!instance.dragstartPrevented) {
				const start_drag = this.#run_plugins(instance, 'start', e);
				if (!start_drag) return this.#clear_effects(instance);
				else this.#flush_effects(instance);

				const capture_result = this.#resultify(
					() => {
						instance.pointerCapturedId = e.pointerId;
						instance.currentlyDraggedNode.setPointerCapture(instance.pointerCapturedId);
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

		// Mark event as neodrag event for drop zone detection
		if (instance.isDragging) {
			(e as PointerEvent & { [NEODRAG_EVENT]?: HTMLElement | SVGElement })[NEODRAG_EVENT] = instance.currentlyDraggedNode;
		}

		e.preventDefault();

		if (!sync_only) {
			const target_offset_x = (e.clientX - instance.initialX) * instance.inverseScale;
			const target_offset_y = (e.clientY - instance.initialY) * instance.inverseScale;

			instance.deltaX = target_offset_x - instance.offsetX;
			instance.deltaY = target_offset_y - instance.offsetY;

			instance.proposedX = instance.deltaX;
			instance.proposedY = instance.deltaY;
			instance.syncCoords();
		}

		const run_result = this.#run_plugins(instance, 'drag', e);

		if (run_result) this.#flush_effects(instance);
		else return this.#clear_effects(instance);

		if (!sync_only) {
			instance.offsetX += instance.proposedX ?? 0;
			instance.offsetY += instance.proposedY ?? 0;
			instance.syncCoords();
		}
	}

	#handle_pointer_up(e: PointerEvent) {
		const draggable_node = this.#active_nodes.get(e.pointerId);
		if (!draggable_node) return;

		const instance = this.#instances.get(draggable_node)!;
		if (!instance.isInteracting) return;

		// Mark event for drop zone detection if dragging
		if (instance.isDragging) {
			(e as PointerEvent & { [NEODRAG_EVENT]?: HTMLElement | SVGElement })[NEODRAG_EVENT] = instance.currentlyDraggedNode;
		}

		if (instance.isDragging) {
			listen(draggable_node as HTMLElement, 'click', (e) => e.stopPropagation(), {
				once: true,
				signal: instance.controller.signal,
				capture: true,
			});
		}

		if (
			instance.pointerCapturedId &&
			instance.currentlyDraggedNode.hasPointerCapture(instance.pointerCapturedId)
		) {
			instance.currentlyDraggedNode.releasePointerCapture(instance.pointerCapturedId);
		}

		this.#run_plugins(instance, 'end', e);
		this.#flush_effects(instance);

		if (instance.proposedX !== null)
			instance.initialX = e.clientX - instance.offsetX / instance.inverseScale;
		if (instance.proposedY !== null)
			instance.initialY = e.clientY - instance.offsetY / instance.inverseScale;

		instance.proposedX = 0;
		instance.proposedY = 0;
		instance.isInteracting = false;
		instance.isDragging = false;
		instance.dragstartPrevented = false;
		instance.pointerCapturedId = null;
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
			instance.pointerCapturedId &&
			instance.currentlyDraggedNode.hasPointerCapture(instance.pointerCapturedId)
		) {
			this.#resultify(
				() => {
					instance.currentlyDraggedNode.releasePointerCapture(instance.pointerCapturedId!);
				},
				{
					phase: 'end',
					node,
				},
			);
		}

		instance.isInteracting = false;
		instance.isDragging = false;
		instance.dragstartPrevented = false;
		instance.pointerCapturedId = null;
		this.#active_nodes.delete(pointer_id);
		this.#clear_effects(instance);
	}

	#calculate_inverse_scale(instance: DragInstance) {
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

	#destroy_instance(instance: DragInstance) {
		for (const [pointer_id, active_node] of this.#active_nodes) {
			if (active_node === instance.rootNode) {
				this.#cleanup_active_node(pointer_id);
			}
		}

		for (const plugin of instance.plugins) {
			plugin.cleanup?.(instance as PublicInstance, instance.pluginStates.get(plugin.name));
		}

		instance.controller.abort();

		this.instances.delete(instance.rootNode);
	}

	#process_pending_compartment_updates(instance: DragInstance, is_external = false) {
		if (instance.isFlushingCompartments || instance.pendingCompartments.size === 0) {
			return;
		}

		// ✅ CRITICAL FIX: Block recursive internal updates
		if (!is_external && instance.isProcessingExternalUpdate) {
			return;
		}

		instance.isFlushingCompartments = true;

		// ✅ Mark external updates and assign unique cycle ID
		if (is_external) {
			instance.isProcessingExternalUpdate = true;
		}

		queueMicrotask(() => {
			// Store reference to pending items and clear for next batch
			const pending = new Set(instance.pendingCompartments);
			instance.pendingCompartments.clear();
			instance.isFlushingCompartments = false;

			let has_changes = false;

			// Process all pending compartment updates
			for (const compartment of pending) {
				const new_plugin = compartment.current;
				const old_plugin = instance.plugins.find(
					(p: Plugin) => p === instance.compartmentMap.get(compartment),
				);

				if (old_plugin) {
					if (new_plugin == undefined) {
						// Remove the plugin
						const plugin_index = instance.plugins.indexOf(old_plugin);
						old_plugin.cleanup?.(
							instance as PublicInstance,
							instance.pluginStates.get(old_plugin.name),
						);
						instance.pluginStates.delete(old_plugin.name);
						instance.plugins.splice(plugin_index, 1);
						instance.compartmentMap.set(compartment, undefined);
						has_changes = true;
					} else {
						// Skip if same instance and not live-updateable
						if (old_plugin === new_plugin && !new_plugin.liveUpdate) {
							continue;
						}

						// Update plugin reference
						instance.plugins[instance.plugins.indexOf(old_plugin)] = new_plugin;
						instance.compartmentMap.set(compartment, new_plugin);

						// Update all plugins that have liveUpdate enabled
						for (const plugin of instance.plugins) {
							if (plugin.liveUpdate) {
								const old = instance.plugins.find((p: Plugin) => p.name === plugin.name);
								if (this.#update_plugin_if_needed(instance, old, plugin)) {
									has_changes = true;
								}
							}
						}
					}
				} else if (new_plugin != undefined) {
					// Add new plugin when compartment was empty
					instance.plugins.push(new_plugin);
					instance.compartmentMap.set(compartment, new_plugin);

					const setup_result = this.#resultify(
						() => {
							const state = new_plugin.setup?.(instance as PublicInstance);
							if (state) {
								instance.pluginStates.set(new_plugin.name, state);
							}
							return state;
						},
						{
							phase: 'setup',
							plugin: { name: new_plugin.name, hook: 'setup' },
							node: instance.rootNode,
						},
					);

					if (!setup_result.ok) {
						instance.failedPlugins.add(new_plugin.name);
					}

					// Use the same update logic as replacement case
					for (const plugin of instance.plugins) {
						if (plugin.liveUpdate && plugin !== new_plugin) {
							const old = instance.plugins.find((p: Plugin) => p.name === plugin.name);
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
			instance.isFlushingCompartments = false;
			if (is_external) {
				instance.isProcessingExternalUpdate = false;
			}

			this.#flush_effects(instance);

			// Check if new updates came in while we were processing
			if (instance.pendingCompartments.size > 0) {
				setTimeout(() => {
					this.#process_pending_compartment_updates(instance, false);
				}, 0);
			}
		});
	}

	#update_plugin_if_needed(
		instance: DragInstance,
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
				instance.pluginStates.get(old_plugin.name),
			);
			instance.pluginStates.delete(old_plugin.name);
		}

		// Setup new plugin
		const state = new_plugin.setup?.(instance as PublicInstance);
		if (state) {
			instance.pluginStates.set(new_plugin.name, state);
		}

		return true;
	}
}

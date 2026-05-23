import { type DeepMutable, listen } from '../utils.ts';
import { NEODRAG_EVENT } from '../symbols.ts';
import { DropInstance } from './drop-instance.ts';
import type { DropContext, DropErrorInfo, DropPlugin } from './types.ts';

export type { DropContext, DropErrorInfo, DropPlugin } from './types.ts';

type PublicDropInstance = DeepMutable<DropContext>;

type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

export const DROP_DEFAULTS = {
	plugins: [],
	onError: (error: DropErrorInfo) => {
		console.error(error);
	},
	delegate: () => document.documentElement,
};

export class DropFactory {
	#instances = new Map<HTMLElement | SVGElement, DropInstance>();
	#listeners_initialized = false;
	#over_element: HTMLElement | SVGElement | null = null;

	#initial_plugins: DropPlugin[];
	#delegateTargetFn: () => HTMLElement;
	#onError?: (error: DropErrorInfo) => void;

	#globally_dragged: HTMLElement | SVGElement | null = null;

	constructor({ plugins, delegate, onError }: typeof DROP_DEFAULTS) {
		this.#initial_plugins = plugins;
		this.#delegateTargetFn = delegate;
		this.#onError = onError;
	}

	get instances() {
		return this.#instances;
	}

	droppable(node: HTMLElement | SVGElement, plugins: DropPlugin[] = []) {
		this.#initialize_listeners();

		const instance = new DropInstance(node);
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

	#cleanup_drag_state() {
		this.#globally_dragged = null;

		for (const instance of this.#instances.values()) {
			instance.isActive = false;
			instance.isOver = false;
			instance.draggedElement = null;
			instance.data = null;
		}

		this.#over_element = null;
	}

	#resultify<T>(fn: () => T, errorInfo: Omit<DropErrorInfo, 'error'>): Result<T> {
		try {
			return { ok: true, value: fn() };
		} catch (error) {
			this.#report_error(errorInfo, error);
			return { ok: false, error };
		}
	}

	#report_error(info: Omit<DropErrorInfo, 'error'>, error: unknown) {
		if (this.#onError) {
			this.#onError({ ...info, error });
		}
	}

	#initialize_listeners() {
		if (this.#listeners_initialized) return;

		const delegateTarget = this.#delegateTargetFn();

		listen(delegateTarget, 'pointermove', this.#handle_pointer_move.bind(this), {
			passive: false,
			capture: false,
		});
		listen(delegateTarget, 'pointerup', this.#handle_pointer_up.bind(this), {
			passive: true,
			capture: false,
		});

		this.#listeners_initialized = true;
	}

	#setup_plugins(instance: DropInstance, plugins: DropPlugin[]) {
		const subscriptions = new Set<() => void>();

		instance.plugins = this.#initialize_plugins(plugins);

		for (const plugin of instance.plugins) {
			const result = this.#resultify(
				() => {
					const value = plugin.setup?.(instance as PublicDropInstance);
					if (value) instance.pluginStates.set(plugin.name, value);
					this.#flush_effects(instance);
				},
				{
					phase: 'setup',
					plugin: { name: plugin.name, hook: 'setup' },
					node: instance.dropNode,
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

	#initialize_plugins(new_plugins: DropPlugin[]) {
		const combined = this.#initial_plugins.concat(new_plugins);

		return Array.from(
			combined
				.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
				.reduce((map, plugin) => {
					map.set(plugin.name, plugin);
					return map;
				}, new Map<string, DropPlugin>())
				.values(),
		) as DropPlugin[];
	}

	#run_plugins(instance: DropInstance, hook: DropErrorInfo['phase'], event: PointerEvent) {
		let should_continue = true;
		instance.accepted = false;
		instance.rejected = false;

		for (const plugin of instance.plugins) {
			if (instance.failedPlugins.has(plugin.name)) {
				continue;
			}

			const handler = plugin[hook];
			if (!handler) continue;

			if (instance.rejected && plugin.cancelable) continue;

			const result = this.#resultify(
				() =>
					handler.call(
						plugin,
						instance as PublicDropInstance,
						instance.pluginStates.get(plugin.name),
						event,
					),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.dropNode,
				},
			);

			if (!result.ok) {
				instance.failedPlugins.add(plugin.name);
				should_continue = false;
				break;
			}

			if (result.value === false) {
				should_continue = false;
				break;
			}
		}

		return should_continue;
	}

	#flush_effects(instance: DropInstance) {
		const paint_effects = new Set(instance.paintEffects);
		const immediate_effects = new Set(instance.immediateEffects);

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

	#clear_effects(instance: DropInstance) {
		instance.immediateEffects.clear();
		instance.paintEffects.clear();
	}

	#handle_pointer_move(e: PointerEvent) {
		const draggedElement = (e as PointerEvent & { [NEODRAG_EVENT]?: HTMLElement | SVGElement })[
			NEODRAG_EVENT
		];
		if (!draggedElement) return;

		if (!this.#globally_dragged) {
			for (const instance of this.#instances.values()) {
				instance.isActive = true;
				instance.draggedElement = draggedElement;
			}
		}

		this.#globally_dragged = draggedElement;

		const drop_node = this.#find_drop_node(e);
		if (this.#over_element && this.#over_element !== drop_node) {
			const prev_instance = this.#instances.get(this.#over_element);
			if (prev_instance) {
				prev_instance.lastEvent = e;
				prev_instance.isOver = false;

				this.#run_plugins(prev_instance, 'onLeave', e);
				this.#flush_effects(prev_instance);
			}
		}
		if (drop_node && drop_node !== this.#over_element) {
			const instance = this.#instances.get(drop_node);
			if (instance) {
				instance.lastEvent = e;
				instance.isOver = true;

				this.#run_plugins(instance, 'onEnter', e);
				this.#flush_effects(instance);
			}
		}
		if (drop_node) {
			const instance = this.#instances.get(drop_node);
			if (instance && instance.isOver) {
				instance.lastEvent = e;

				const should_continue = this.#run_plugins(instance, 'onOver', e);
				if (should_continue && !instance.rejected) {
					this.#flush_effects(instance);
				}
			}
		}

		this.#over_element = drop_node;
	}

	#handle_pointer_up(e: PointerEvent) {
		const draggedElement = (e as PointerEvent & { [NEODRAG_EVENT]?: HTMLElement | SVGElement })[
			NEODRAG_EVENT
		];
		if (!draggedElement) return;

		this.#globally_dragged = draggedElement;

		const drop_node = this.#find_drop_node(e);
		if (!drop_node) {
			this.#cleanup_drag_state();
			return;
		}

		const instance = this.#instances.get(drop_node);
		if (!instance) {
			this.#cleanup_drag_state();
			return;
		}

		instance.lastEvent = e;

		this.#run_plugins(instance, 'onDrop', e);
		this.#flush_effects(instance);

		this.#cleanup_drag_state();
	}

	#find_drop_node(e: PointerEvent): HTMLElement | SVGElement | null {
		if (this.#globally_dragged) {
			const originalPointerEvents = this.#globally_dragged.style.pointerEvents;
			this.#globally_dragged.style.pointerEvents = 'none';

			const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);

			this.#globally_dragged.style.pointerEvents = originalPointerEvents;

			if (elementAtPoint) {
				let current: Element | null = elementAtPoint;
				while (current && current !== document.body) {
					if (
						(current instanceof HTMLElement || current instanceof SVGElement) &&
						this.#instances.has(current)
					) {
						return current;
					}
					current = current.parentElement;
				}
			}
		}

		return null;
	}

	#destroy_instance(instance: DropInstance) {
		for (const plugin of instance.plugins) {
			plugin.cleanup?.(
				instance as PublicDropInstance,
				instance.pluginStates.get(plugin.name),
			);
		}

		instance.controller.abort();

		if (this.#over_element === instance.dropNode) {
			this.#over_element = null;
		}

		this.#instances.delete(instance.dropNode);
	}
}

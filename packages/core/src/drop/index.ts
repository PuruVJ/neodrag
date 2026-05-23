import { type DeepMutable, listen } from '../utils.ts';
import { NEODRAG_EVENT } from '../symbols.ts';
import * as $ from './symbols.ts';

export interface DropPlugin {
	name: string;
	priority?: number;
	liveUpdate?: boolean;
	cancelable?: boolean;
	setup?: (ctx: DropContext) => any;
	onEnter?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	onOver?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	onLeave?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	onDrop?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	cleanup?: (ctx: DropContext, state: any) => void;
}

export interface DropContext {
	readonly isOver: boolean;
	readonly isActive: boolean;
	readonly draggedElement: HTMLElement | SVGElement | null;
	readonly dropNode: HTMLElement | SVGElement;
	readonly lastEvent: PointerEvent | null;
	readonly data: any;
	
	effect: {
		immediate: (func: () => void) => void;
		paint: (func: () => void) => void;
	};
	
	accept(): void;
	reject(): void;
	setData(data: any): void;
}

export interface DropErrorInfo {
	phase: 'setup' | 'onEnter' | 'onOver' | 'onLeave' | 'onDrop';
	plugin?: {
		name: string;
		hook: string;
	};
	node: HTMLElement | SVGElement;
	error: unknown;
}

type PublicDropInstance = DeepMutable<DropContext>;

export interface DropInstance extends PublicDropInstance {
	[$.node]: HTMLElement | SVGElement;
	[$.plugins]: DropPlugin[];
	[$.controller]: AbortController;
	[$.plugin_states]: Map<string, any>;
	[$.failed_plugins]: Set<string>;
	[$.accepted]: boolean;
	[$.rejected]: boolean;
	[$.paint_effects]: Set<() => void>;
	[$.immediate_effects]: Set<() => void>;
	[$.is_over]: boolean;
	[$.is_active]: boolean;
	[$.dragged_element]: HTMLElement | SVGElement | null;
	[$.last_event]: PointerEvent | null;
	[$.data]: any;
}

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
	
	// Track globally dragged element from drag system
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
		
		const instance = this.#create_instance(node);
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
			instance[$.is_active] = false;
			instance[$.is_over] = false;
			instance[$.dragged_element] = null;
			instance[$.data] = null;
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
		
		// Listen to pointer events to track when dragged element enters/leaves drop zones
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
	
	#create_instance(node: HTMLElement | SVGElement): DropInstance {
		const instance: DropInstance = {
			[$.node]: node,
			[$.plugins]: [],
			[$.controller]: new AbortController(),
			[$.plugin_states]: new Map<string, any>(),
			[$.failed_plugins]: new Set<string>(),
			[$.accepted]: false,
			[$.rejected]: false,
			[$.paint_effects]: new Set<() => void>(),
			[$.immediate_effects]: new Set<() => void>(),
			[$.is_over]: false,
			[$.is_active]: false,
			[$.dragged_element]: null,
			[$.last_event]: null,
			[$.data]: null,
			
			// DropContext properties
			get isOver() {
				return instance[$.is_over];
			},
			get isActive() {
				return instance[$.is_active];
			},
			get draggedElement() {
				return instance[$.dragged_element];
			},
			dropNode: node,
			get lastEvent() {
				return instance[$.last_event];
			},
			get data() {
				return instance[$.data];
			},
			effect: {
				immediate: (func) => {
					instance[$.immediate_effects].add(func);
				},
				paint: (func) => {
					instance[$.paint_effects].add(func);
				},
			},
			accept() {
				instance[$.accepted] = true;
				instance[$.rejected] = false;
			},
			reject() {
				instance[$.rejected] = true;
				instance[$.accepted] = false;
			},
			setData(data: any) {
				instance[$.data] = data;
			},
		};
		
		return instance;
	}
	
	#setup_plugins(instance: DropInstance, plugins: DropPlugin[]) {
		const subscriptions = new Set<() => void>();
		
		instance[$.plugins] = this.#initialize_plugins(plugins);
		
		// Initialize plugin states
		for (const plugin of instance[$.plugins]) {
			const result = this.#resultify(
				() => {
					const value = plugin.setup?.(instance as PublicDropInstance);
					if (value) instance[$.plugin_states].set(plugin.name, value);
					this.#flush_effects(instance);
				},
				{
					phase: 'setup',
					plugin: { name: plugin.name, hook: 'setup' },
					node: instance[$.node],
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
		instance[$.accepted] = false;
		instance[$.rejected] = false;
		
		for (const plugin of instance[$.plugins]) {
			if (instance[$.failed_plugins].has(plugin.name)) {
				continue;
			}
			
			const handler = plugin[hook];
			if (!handler) continue;
			
			if (instance[$.rejected] && plugin.cancelable) continue;
			
			const result = this.#resultify(
				() =>
					handler.call(
						plugin,
						instance as PublicDropInstance,
						instance[$.plugin_states].get(plugin.name),
						event,
					),
				{
					phase: hook,
					plugin: { name: plugin.name, hook },
					node: instance.dropNode,
				},
			);
			
			if (!result.ok) {
				instance[$.failed_plugins].add(plugin.name);
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
		const paint_effects = new Set(instance[$.paint_effects]);
		const immediate_effects = new Set(instance[$.immediate_effects]);
		
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
		instance[$.immediate_effects].clear();
		instance[$.paint_effects].clear();
	}
	
	#handle_pointer_move(e: PointerEvent) {
		const draggedElement = (e as any)[NEODRAG_EVENT];
		if (!draggedElement) return;
		
		if (!this.#globally_dragged) {
			// First time detecting drag, activate all drop zones
			for (const instance of this.#instances.values()) {
				instance[$.is_active] = true;
				instance[$.dragged_element] = draggedElement;
			}
		}
		
		this.#globally_dragged = draggedElement;
		
		const drop_node = this.#find_drop_node(e);
		if (this.#over_element && this.#over_element !== drop_node) {
			const prev_instance = this.#instances.get(this.#over_element);
			if (prev_instance) {
				prev_instance[$.last_event] = e;
				prev_instance[$.is_over] = false;
				
				this.#run_plugins(prev_instance, 'onLeave', e);
				this.#flush_effects(prev_instance);
			}
		}
		if (drop_node && drop_node !== this.#over_element) {
			const instance = this.#instances.get(drop_node);
			if (instance) {
				instance[$.last_event] = e;
				instance[$.is_over] = true;
				
				this.#run_plugins(instance, 'onEnter', e);
				this.#flush_effects(instance);
			}
		}
		if (drop_node) {
			const instance = this.#instances.get(drop_node);
			if (instance && instance[$.is_over]) {
				instance[$.last_event] = e;
				
				const should_continue = this.#run_plugins(instance, 'onOver', e);
				if (should_continue && !instance[$.rejected]) {
					this.#flush_effects(instance);
				}
			}
		}
		
		this.#over_element = drop_node;
	}
	
	#handle_pointer_up(e: PointerEvent) {
		const draggedElement = (e as any)[NEODRAG_EVENT];
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
		
		instance[$.last_event] = e;
		
		// Run drop plugins
		this.#run_plugins(instance, 'onDrop', e);
		this.#flush_effects(instance);
		
		// Clean up
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
					if ((current instanceof HTMLElement || current instanceof SVGElement) && 
						this.#instances.has(current)) {
						return current;
					}
					current = current.parentElement;
				}
			}
		}
		
		return null;
	}
	
	#destroy_instance(instance: DropInstance) {
		for (const plugin of instance[$.plugins]) {
			plugin.cleanup?.(instance as PublicDropInstance, instance[$.plugin_states].get(plugin.name));
		}
		
		instance[$.controller].abort();
		
		if (this.#over_element === instance[$.node]) {
			this.#over_element = null;
		}
		
		this.#instances.delete(instance[$.node]);
	}
}
import { is_svg_element, is_svg_svg_element, listen } from '../utils.ts';
import { EffectScheduler } from './effects.ts';
import {
	ActiveSession,
	DragInstance,
	DropInstance,
	type DropCtxHost,
	SessionPrivate,
} from './instance.ts';
import { DragHandle, DropHandle } from './handles.ts';
import { collectCompartments, resolveDragPlugins } from './resolve-plugins.ts';
import { DEFAULT_DRAG_PLUGINS } from './plugins/index.ts';
import { createDragSession, resolveEndReason } from './session.ts';
import { isTerminal, transitionSession } from './state-machine.ts';
import type {
	DragCtx,
	DragPlugin,
	DragPluginInput,
	DropCtx,
	DropPlugin,
	DropPluginInput,
	DropTargetInfo,
	EndReason,
	ErrorInfo,
	SessionListener,
} from './types.ts';

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

const PLUGIN_FAILED = Symbol('neodrag.pluginFailed');

type PluginHost = {
	failed: Set<symbol>;
	rootNode: HTMLElement | SVGElement;
};

export interface EngineOptions {
	plugins?: DragPlugin[];
	dropPlugins?: DropPlugin[];
	delegate?: () => HTMLElement;
	onError?: (error: ErrorInfo) => void;
	dev?: boolean;
}

export class Neodrag {
	static readonly shared = new Neodrag({ dev: false });
	#dragSources = new Map<HTMLElement | SVGElement, DragInstance>();
	#dropTargets = new Map<HTMLElement | SVGElement, DropInstance>();
	#dropCount = 0;

	#active: ActiveSession | null = null;
	#activeSource: DragInstance | null = null;
	#activePointerId: number | null = null;

	#listenersInitialized = false;
	#listenerDelegate: HTMLElement | null = null;
	#boundOnMove: ((e: PointerEvent) => void) | null = null;
	#boundOnUp: ((e: PointerEvent) => void) | null = null;
	#pointerSessionAbort: AbortController | null = null;
	#sessionListeners = new Set<SessionListener>();
	#sessionCleanups = new Set<() => void>();

	#lastTarget: Element | null = null;
	#lastResult: HTMLElement | SVGElement | null = null;

	#defaultDragPlugins: DragPlugin[];
	#defaultDropPlugins: DropPlugin[];
	#delegate: () => HTMLElement;
	#onError?: (error: ErrorInfo) => void;
	#dev: boolean;

	#overStack: DropInstance[] = [];
	#overStackScratch: DropInstance[] = [];

	#idleSession: import('./types.ts').DragSession;
	#activeSessionView: import('./types.ts').DragSession | null = null;

	readonly #dropHost: DropCtxHost = {
		pointerX: 0,
		pointerY: 0,
		lastEvent: null,
		session: null!,
	};

	constructor(options: EngineOptions = {}) {
		this.#defaultDragPlugins = options.plugins ?? DEFAULT_DRAG_PLUGINS;
		this.#defaultDropPlugins = options.dropPlugins ?? [];
		this.#delegate = options.delegate ?? (() => document.documentElement);
		this.#onError = options.onError;
		this.#dev = options.dev ?? DEV;

		const idleActive: ActiveSession = {
			state: 'idle',
			sourceNode: document.documentElement,
			visualNode: document.documentElement,
			sourceRect: new DOMRect(),
			visualRect: new DOMRect(),
			pointerX: 0,
			pointerY: 0,
			deltaX: 0,
			deltaY: 0,
			data: undefined,
			overTargets: [],
			private: new SessionPrivate(),
			propagationStopped: false,
			pointerId: -1,
			startedAt: 0,
			cancel() {},
		};
		this.#idleSession = createDragSession(idleActive, () => {});
		this.#dropHost.session = this.#idleSession;
	}

	get dev() {
		return this.#dev;
	}

	set dev(value: boolean) {
		this.#dev = value;
	}

	onSession(listener: SessionListener) {
		this.#sessionListeners.add(listener);
		return () => this.#sessionListeners.delete(listener);
	}

	draggable(node: HTMLElement | SVGElement, plugins: DragPluginInput = []): DragHandle {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. Wrap it in a div or use a child element.',
			);
		}

		this.#initListeners();

		const inst = new DragInstance(node, this.#idleSession);
		inst.pluginInput = plugins;
		this.#installDragPlugins(inst, resolveDragPlugins(plugins));
		this.#wireCompartments(inst);
		this.#dragSources.set(node, inst);

		return new DragHandle(this, node, () => {
			this.#destroyDrag(inst);
			this.#dragSources.delete(node);
		});
	}

	droppable(node: HTMLElement | SVGElement, plugins: DropPluginInput = []): DropHandle {
		this.#initListeners();

		const inst = new DropInstance(node, this.#dropHost);
		const resolved = typeof plugins === 'function' ? plugins() : plugins;
		const combined = [...this.#defaultDropPlugins, ...resolved];
		const byKey = new Map<symbol, DropPlugin>();
		for (const p of combined) byKey.set(p.key, p);
		inst.flat = [...byKey.values()];
		inst.byKey = byKey;
		inst.rebuildBuckets();
		this.#initDropPlugins(inst);
		this.#dropTargets.set(node, inst);
		this.#dropCount++;

		return new DropHandle(node, () => {
			this.#destroyDrop(inst);
			this.#dropTargets.delete(node);
			this.#dropCount--;
		});
	}

	update(node: HTMLElement | SVGElement, plugins: DragPluginInput) {
		const inst = this.#dragSources.get(node);
		if (!inst) return;

		inst.pluginInput = plugins;
		const resolved = resolveDragPlugins(plugins);

		if (inst.lastList === resolved) return;
		inst.lastList = resolved;

		const prev = inst.flat;
		if (prev.length === resolved.length) {
			let same = true;
			for (let i = 0; i < resolved.length; i++) {
				if (resolved[i] !== prev[i]) {
					same = false;
					break;
				}
			}
			if (same) return;
		}

		if (inst.isUpdating) {
			inst.pendingUpdate = resolved;
			return;
		}

		inst.isUpdating = true;
		if (inst.isProcessingExternalUpdate) {
			inst.pendingUpdate = resolved;
			inst.isUpdating = false;
			return;
		}

		this.#diffDragPlugins(inst, resolved);
		inst.isUpdating = false;

		const pending = inst.pendingUpdate;
		inst.pendingUpdate = null;
		if (pending) this.update(node, pending);
	}

	dispose() {
		this.#disarmPointerSession();
		for (const inst of this.#dragSources.values()) this.#destroyDrag(inst);
		for (const inst of this.#dropTargets.values()) this.#destroyDrop(inst);
		this.#dragSources.clear();
		this.#dropTargets.clear();
		this.#cancelSession('cancel');
	}

	#getSession(): import('./types.ts').DragSession {
		return this.#activeSessionView ?? this.#idleSession;
	}

	#beginSession(source: DragInstance, e: PointerEvent) {
		const rect = source.rootNode.getBoundingClientRect();
		this.#active = {
			state: 'pending',
			sourceNode: source.rootNode,
			visualNode: source.visualNode,
			sourceRect: rect,
			visualRect: rect,
			pointerX: e.clientX,
			pointerY: e.clientY,
			deltaX: 0,
			deltaY: 0,
			data: undefined,
			overTargets: [],
			private: new SessionPrivate(),
			propagationStopped: false,
			pointerId: e.pointerId,
			startedAt: Date.now(),
			cancel: () => {
				if (this.#active) this.#active.state = 'cancelled';
			},
		};
		this.#activeSource = source;
		this.#activePointerId = e.pointerId;

		this.#activeSessionView = createDragSession(this.#active, (node) => this.#activeSource?.setVisual(node));
		source.bindSession(this.#activeSessionView, () => {
			if (this.#active) this.#active.state = 'cancelled';
		});
		this.#dropHost.session = this.#activeSessionView;

		this.#notifySessionListeners();
	}

	#notifySessionListeners() {
		if (!this.#active) return;
		const session = this.#getSession();
		for (const listener of this.#sessionListeners) {
			const cleanup = listener(session);
			if (typeof cleanup === 'function') this.#sessionCleanups.add(cleanup);
		}
	}

	#endSessionListeners() {
		for (const cleanup of this.#sessionCleanups) cleanup();
		this.#sessionCleanups.clear();
	}

	#cancelSession(reason: EndReason) {
		if (!this.#active || !this.#activeSource) return;
		const e = this.#activeSource.lastEvent;
		if (e) this.#finishInteraction(reason, e);
	}

	#initListeners() {
		if (this.#listenersInitialized) return;
		const target = this.#delegate();
		this.#listenerDelegate = target;
		this.#boundOnMove = this.#onPointerMove.bind(this);
		this.#boundOnUp = this.#onPointerUp.bind(this);

		listen(target, 'pointerdown', this.#onPointerDown.bind(this), { passive: true, capture: true });
		listen(target, 'keydown', this.#onKeyDown.bind(this), { passive: true });

		this.#listenersInitialized = true;
	}

	#armPointerSession() {
		if (this.#pointerSessionAbort) return;
		const target = this.#listenerDelegate ?? this.#delegate();
		const signal = (this.#pointerSessionAbort = new AbortController()).signal;
		listen(target, 'pointermove', this.#boundOnMove!, { passive: false, capture: true, signal });
		listen(target, 'pointerup', this.#boundOnUp!, { passive: true, capture: true, signal });
		listen(target, 'pointercancel', this.#boundOnUp!, { passive: true, capture: true, signal });
	}

	#disarmPointerSession() {
		this.#pointerSessionAbort?.abort();
		this.#pointerSessionAbort = null;
	}

	#onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && this.#active) {
			this.#cancelSession('cancel');
		}
	}

	#onPointerDown(e: PointerEvent) {
		if (e.button === 2) return;

		const node = this.#findDragSource(e);
		if (!node) return;

		const inst = this.#dragSources.get(node)!;
		if (inst.isInteracting) return;

		inst.cachedRootNodeRect = node.getBoundingClientRect();
		inst.inverseScale = this.#inverseScale(inst);
		inst.initialX = e.clientX - inst.offsetX / inst.inverseScale;
		inst.initialY = e.clientY - inst.offsetY / inst.inverseScale;
		inst.isInteracting = true;
		inst.cancelled = false;
		inst.lastEvent = e;
		this.#dropHost.lastEvent = e;
		this.#beginSession(inst, e);
		this.#armPointerSession();
	}

	#onPointerMove(e: PointerEvent) {
		const inst = this.#activeSource;
		if (!inst?.isInteracting) return;

		inst.lastEvent = e;
		this.#dropHost.lastEvent = e;
		if (this.#active) {
			this.#active.pointerX = e.clientX;
			this.#active.pointerY = e.clientY;
			this.#dropHost.pointerX = e.clientX;
			this.#dropHost.pointerY = e.clientY;
		}

		if (!inst.isDragging) {
			const startOk = this.#runStart(inst, inst.dragCtx, e);
			inst.effects.flush();
			if (!startOk || inst.cancelled) return;

			inst.isDragging = true;
			if (this.#active) {
				this.#active.state = transitionSession(this.#active.state, { type: 'threshold-passed' });
			}

			inst.pointerCapturedId = e.pointerId;
			try {
				inst.visualNode.setPointerCapture(e.pointerId);
			} catch {
				this.#cleanupPointer(e.pointerId);
				return;
			}
		}

		e.preventDefault();

		const target_offset_x = (e.clientX - inst.initialX) * inst.inverseScale;
		const target_offset_y = (e.clientY - inst.initialY) * inst.inverseScale;
		inst.deltaX = target_offset_x - inst.offsetX;
		inst.deltaY = target_offset_y - inst.offsetY;
		inst.proposedX = inst.deltaX;
		inst.proposedY = inst.deltaY;

		if (this.#active) {
			this.#active.deltaX = inst.deltaX;
			this.#active.deltaY = inst.deltaY;
		}

		this.#runDrag(inst, inst.dragCtx, e);
		inst.offsetX += inst.proposedX;
		inst.offsetY += inst.proposedY;
		inst.proposedX = 0;
		inst.proposedY = 0;
		inst.effects.flush();

		if (this.#dropCount > 0) this.#updateDropTargets(e);
	}

	#onPointerUp(e: PointerEvent) {
		const inst = this.#activeSource;
		if (!inst?.isInteracting) return;

		if (inst.isDragging && this.#dropCount > 0) {
			this.#updateDropTargets(e);
		}

		const reason = resolveEndReason(this.#active, inst.cancelled);
		this.#finishInteraction(reason, e);
	}

	#finishInteraction(reason: EndReason, e: PointerEvent) {
		const inst = this.#activeSource;
		if (!inst) return;

		if (inst.isDragging) {
			listen(inst.rootNode as HTMLElement, 'click', (ev) => ev.stopPropagation(), {
				once: true,
				signal: inst.controller.signal,
				capture: true,
			});
		}

		if (inst.pointerCapturedId !== null && inst.visualNode.hasPointerCapture(inst.pointerCapturedId)) {
			inst.visualNode.releasePointerCapture(inst.pointerCapturedId);
		}

		this.#runEnd(inst, inst.dragCtx, e, reason);
		inst.effects.flush();

		if (reason === 'drop' && this.#overStack.length > 0) {
			const top = this.#overStack[this.#overStack.length - 1]!;
			this.#runDropHook(top, 'drop', e);
			top.effects.flush();
		}

		for (const drop of this.#overStack) {
			if (drop.isOver) this.#runDropHook(drop, 'leave', e);
			drop.isOver = false;
		}
		this.#overStack = [];

		inst.isInteracting = false;
		inst.isDragging = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;

		if (this.#active) {
			this.#active.state = transitionSession(this.#active.state, {
				type: 'pointerup',
				reason,
			});
		}

		this.#endSessionListeners();
		this.#active = null;
		this.#activeSource = null;
		this.#activePointerId = null;
		this.#activeSessionView = null;
		this.#dropHost.session = this.#idleSession;
		inst.bindSession(this.#idleSession);
		this.#disarmPointerSession();
	}

	#cleanupPointer(_pointerId: number) {
		const inst = this.#activeSource;
		if (!inst) return;
		inst.isInteracting = false;
		inst.isDragging = false;
		this.#active = null;
		this.#activeSource = null;
		this.#activePointerId = null;
		this.#activeSessionView = null;
		this.#dropHost.session = this.#idleSession;
		inst.bindSession(this.#idleSession);
		this.#disarmPointerSession();
	}

	#runStart(inst: DragInstance, ctx: DragCtx, e: PointerEvent): boolean {
		const chain = inst.startChain;
		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.start) continue;
			const state = inst.states.get(plugin.key);
			const out = this.#pluginCall(
				inst,
				plugin.key,
				{ phase: 'start', plugin: { name: plugin.name, hook: 'start' }, node: inst.rootNode },
				() => plugin.start!(ctx, state, e),
			);
			if (out === PLUGIN_FAILED) return false;
			if (out === false) return false;
			if (inst.cancelled) return false;
		}
		return true;
	}

	#runDrag(inst: DragInstance, ctx: DragCtx, e: PointerEvent) {
		const chain = inst.dragChain;
		const info = { phase: 'drag' as const, node: inst.rootNode };

		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.drag) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;

			const state = inst.states.get(plugin.key);
			const patch = this.#pluginCall(
				inst,
				plugin.key,
				{ ...info, plugin: { name: plugin.name, hook: 'drag' } },
				() => plugin.drag!(ctx, state, e),
			);
			if (patch === PLUGIN_FAILED) continue;

			if (patch) {
				if (patch.x !== undefined) inst.proposedX = patch.x;
				if (patch.y !== undefined) inst.proposedY = patch.y;
			}

			if (inst.cancelled) break;
		}
	}

	#runEnd(inst: DragInstance, ctx: DragCtx, e: PointerEvent, reason: EndReason) {
		const chain = inst.endChain;
		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.end) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;
			const state = inst.states.get(plugin.key);
			this.#pluginVoid(
				inst,
				plugin.key,
				{ phase: 'end', plugin: { name: plugin.name, hook: 'end' }, node: inst.rootNode },
				() => plugin.end!(ctx, state, e, reason),
			);
		}
	}

	#updateDropTargets(e: PointerEvent) {
		const targets = this.#hitTest(e.clientX, e.clientY);
		const next = this.#overStackScratch;
		next.length = 0;

		for (let i = 0; i < targets.length; i++) {
			const drop = this.#dropTargets.get(targets[i]!.node);
			if (!drop) continue;
			next.push(drop);
		}

		for (let i = 0; i < this.#overStack.length; i++) {
			const drop = this.#overStack[i]!;
			let still = false;
			for (let j = 0; j < next.length; j++) {
				if (next[j] === drop) {
					still = true;
					break;
				}
			}
			if (!still && drop.isOver) {
				this.#runDropHook(drop, 'leave', e);
				drop.isOver = false;
			}
		}

		const stack = this.#overStack;
		stack.length = 0;
		for (let i = 0; i < next.length; i++) {
			const drop = next[i]!;
			stack.push(drop);
			if (!drop.isOver) {
				const accepted = this.#runDropHook(drop, 'enter', e);
				drop.isOver = accepted !== false;
			} else {
				this.#runDropHook(drop, 'over', e);
			}
			drop.effects.flush();
			if (this.#active?.propagationStopped) break;
		}
	}

	#hitTest(x: number, y: number): DropTargetInfo[] {
		const stack = this.#active?.overTargets ?? [];
		stack.length = 0;

		const el = document.elementFromPoint(x, y);
		if (!el) return stack;

		let current: Element | null = el;
		while (current && current !== document.documentElement) {
			if (
				(current instanceof HTMLElement || is_svg_element(current)) &&
				this.#dropTargets.has(current as HTMLElement | SVGElement)
			) {
				stack.push({
					node: current as HTMLElement | SVGElement,
					rect: current.getBoundingClientRect(),
				});
			}
			current = current.parentElement;
		}
		return stack;
	}

	#dropChain(inst: DropInstance, hook: 'enter' | 'over' | 'leave' | 'drop') {
		switch (hook) {
			case 'enter':
				return inst.enterChain;
			case 'over':
				return inst.overChain;
			case 'leave':
				return inst.leaveChain;
			default:
				return inst.dropChain;
		}
	}

	#runDropHook(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		e: PointerEvent,
	): boolean | void {
		const ctx = inst.dropCtx;
		const chain = this.#dropChain(inst, hook);
		const info = { phase: hook, node: inst.rootNode };

		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key)) continue;
			const handler = plugin[hook];
			if (!handler) continue;
			const state = inst.states.get(plugin.key);

			const out = this.#pluginCall(
				inst,
				plugin.key,
				{ ...info, plugin: { name: plugin.name, hook } },
				() => handler(ctx, state, e),
			);
			if (out === PLUGIN_FAILED) continue;
			if (hook === 'enter' && out === false) return false;
		}
		return true;
	}

	#findDragSource(e: PointerEvent): HTMLElement | SVGElement | null {
		const target = e.target as Element;
		if (target === this.#lastTarget) return this.#lastResult;

		const path = e.composedPath();
		for (let i = 0; i < Math.min(path.length, 20); i++) {
			const el = path[i];
			if (
				(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
				this.#dragSources.has(el as HTMLElement | SVGElement)
			) {
				this.#lastTarget = target;
				this.#lastResult = el as HTMLElement | SVGElement;
				return this.#lastResult;
			}
			if (el === document || el === document.body) break;
		}

		this.#lastTarget = target;
		this.#lastResult = null;
		return null;
	}

	#inverseScale(inst: DragInstance) {
		const node = inst.rootNode;
		let scale = 1;

		if (node instanceof SVGElement) {
			const bbox = (node as SVGGraphicsElement).getBBox();
			const rect = inst.cachedRootNodeRect;
			if (bbox.width && rect.width) scale = bbox.width / rect.width;
		} else {
			const el = node as HTMLElement;
			scale = el.offsetWidth / inst.cachedRootNodeRect.width;
		}

		return Number.isFinite(scale) && scale > 0 ? scale : 1;
	}

	#installDragPlugins(inst: DragInstance, userPlugins: DragPlugin[]) {
		const combined = [...this.#defaultDragPlugins, ...userPlugins];
		const byKey = new Map<symbol, DragPlugin>();
		for (const p of combined) byKey.set(p.key, p);
		inst.flat = [...byKey.values()];
		inst.byKey = byKey;
		inst.rebuildBuckets();
		this.#initDragPlugins(inst);
	}

	#diffDragPlugins(inst: DragInstance, next: DragPlugin[]) {
		inst.isProcessingExternalUpdate = true;

		const prevByKey = new Map(inst.flat.map((p) => [p.key, p]));

		for (const plugin of next) {
			const prev = prevByKey.get(plugin.key);
			if (!prev) {
				inst.byKey.set(plugin.key, plugin);
				this.#initOneDragPlugin(inst, plugin);
			} else if (prev !== plugin) {
				plugin.update?.(inst.dragCtx, inst.states.get(plugin.key));
				inst.byKey.set(plugin.key, plugin);
			}
			prevByKey.delete(plugin.key);
		}

		for (const orphan of prevByKey.values()) {
			this.#destroyOneDragPlugin(inst, orphan);
			inst.byKey.delete(orphan.key);
		}

		inst.flat = next;
		inst.rebuildBuckets();
		inst.isProcessingExternalUpdate = false;
	}

	#initDragPlugins(inst: DragInstance) {
		for (const plugin of this.#pluginsByPhase(inst)) this.#initOneDragPlugin(inst, plugin);
		inst.effects.flush();
	}

	#pluginsByPhase(inst: DragInstance): DragPlugin[] {
		const order = { pre: 0, resolve: 1, post: 2 } as const;
		return [...inst.flat].sort(
			(a, b) =>
				(order[a.phase ?? 'resolve'] ?? 1) - (order[b.phase ?? 'resolve'] ?? 1),
		);
	}

	#initOneDragPlugin(inst: DragInstance, plugin: DragPlugin) {
		if (!plugin.init) return;
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'init', plugin: { name: plugin.name, hook: 'init' }, node: inst.rootNode },
			() => {
				const state = plugin.init!(inst.dragCtx);
				if (state !== undefined) inst.states.set(plugin.key, state);
			},
		);
	}

	#destroyOneDragPlugin(inst: DragInstance, plugin: DragPlugin) {
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'destroy', plugin: { name: plugin.name, hook: 'destroy' }, node: inst.rootNode },
			() => plugin.destroy!(inst.dragCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	#initDropPlugins(inst: DropInstance) {
		const ctx = inst.dropCtx;
		for (const plugin of inst.flat) {
			if (!plugin.init) continue;
			this.#pluginVoid(
				inst,
				plugin.key,
				{ phase: 'init', plugin: { name: plugin.name, hook: 'init' }, node: inst.rootNode },
				() => {
					const state = plugin.init!(ctx);
					if (state !== undefined) inst.states.set(plugin.key, state);
				},
			);
		}
		inst.effects.flush();
	}

	#wireCompartments(inst: DragInstance) {
		for (const unsub of inst.compartmentUnsubs) unsub();
		inst.compartmentUnsubs.length = 0;

		for (const compartment of collectCompartments(inst.pluginInput)) {
			inst.compartmentUnsubs.push(
				compartment.subscribe(() => {
					this.update(inst.rootNode, inst.pluginInput);
				}),
			);
		}
	}

	#destroyDrag(inst: DragInstance) {
		for (const unsub of inst.compartmentUnsubs) unsub();
		inst.compartmentUnsubs.length = 0;
		for (const plugin of inst.flat) this.#destroyOneDragPlugin(inst, plugin);
		inst.controller.abort();
		inst.effects.clear();
	}

	#destroyDrop(inst: DropInstance) {
		for (const plugin of inst.flat) {
			if (plugin.destroy) {
				this.#pluginVoid(
					inst,
					plugin.key,
					{ phase: 'destroy', plugin: { name: plugin.name, hook: 'destroy' }, node: inst.rootNode },
					() => plugin.destroy!(inst.dropCtx, inst.states.get(plugin.key)),
				);
			}
		}
		inst.controller.abort();
		inst.effects.clear();
	}

	#pluginError(info: Omit<ErrorInfo, 'error'>, inst: PluginHost, key: symbol, error: unknown) {
		this.#onError?.({ ...info, error });
		if (this.#dev) throw error;
		inst.failed.add(key);
	}

	#pluginCall<T>(
		inst: PluginHost,
		key: symbol,
		info: Omit<ErrorInfo, 'error'>,
		fn: () => T,
	): T | typeof PLUGIN_FAILED {
		try {
			return fn();
		} catch (error) {
			this.#pluginError(info, inst, key, error);
			return PLUGIN_FAILED;
		}
	}

	#pluginVoid(
		inst: PluginHost,
		key: symbol,
		info: Omit<ErrorInfo, 'error'>,
		fn: () => void,
	) {
		try {
			fn();
		} catch (error) {
			this.#pluginError(info, inst, key, error);
		}
	}
}


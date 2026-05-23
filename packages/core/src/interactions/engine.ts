import { is_svg_element, is_svg_svg_element, listen } from '../utils.ts';
import { EffectScheduler } from './effects.ts';
import {
	ActiveSession,
	DragInstance,
	DropInstance,
	SessionPrivate,
} from './instance.ts';
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

type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

export interface EngineOptions {
	plugins?: DragPlugin[];
	dropPlugins?: DropPlugin[];
	delegate?: () => HTMLElement;
	onError?: (error: ErrorInfo) => void;
	dev?: boolean;
}

export class InteractionEngine {
	#dragSources = new Map<HTMLElement | SVGElement, DragInstance>();
	#dropTargets = new Map<HTMLElement | SVGElement, DropInstance>();
	#dropCount = 0;

	#active: ActiveSession | null = null;
	#activeSource: DragInstance | null = null;
	#activePointerId: number | null = null;

	#listenersInitialized = false;
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

	constructor(options: EngineOptions = {}) {
		this.#defaultDragPlugins = options.plugins ?? DEFAULT_DRAG_PLUGINS;
		this.#defaultDropPlugins = options.dropPlugins ?? [];
		this.#delegate = options.delegate ?? (() => document.documentElement);
		this.#onError = options.onError;
		this.#dev = options.dev ?? DEV;
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

	draggable(node: HTMLElement | SVGElement, plugins: DragPluginInput = []) {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. Wrap it in a div or use a child element.',
			);
		}

		this.#initListeners();

		const inst = new DragInstance(node);
		const resolved = typeof plugins === 'function' ? plugins() : plugins;
		this.#installDragPlugins(inst, resolved);
		this.#dragSources.set(node, inst);

		return () => {
			this.#destroyDrag(inst);
			this.#dragSources.delete(node);
		};
	}

	droppable(node: HTMLElement | SVGElement, plugins: DropPluginInput = []) {
		this.#initListeners();

		const inst = new DropInstance(node);
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

		return () => {
			this.#destroyDrop(inst);
			this.#dropTargets.delete(node);
			this.#dropCount--;
		};
	}

	update(node: HTMLElement | SVGElement, plugins: DragPlugin[]) {
		const inst = this.#dragSources.get(node);
		if (!inst) return;

		if (inst.lastList === plugins) return;
		inst.lastList = plugins;

		const prev = inst.flat;
		if (prev.length === plugins.length) {
			let same = true;
			for (let i = 0; i < plugins.length; i++) {
				if (plugins[i] !== prev[i]) {
					same = false;
					break;
				}
			}
			if (same) return;
		}

		if (inst.isUpdating) {
			inst.pendingUpdate = plugins;
			return;
		}

		inst.isUpdating = true;
		if (inst.isProcessingExternalUpdate) {
			inst.pendingUpdate = plugins;
			inst.isUpdating = false;
			return;
		}

		this.#diffDragPlugins(inst, plugins);
		inst.isUpdating = false;

		const pending = inst.pendingUpdate;
		inst.pendingUpdate = null;
		if (pending) this.update(node, pending);
	}

	dispose() {
		for (const inst of this.#dragSources.values()) this.#destroyDrag(inst);
		for (const inst of this.#dropTargets.values()) this.#destroyDrop(inst);
		this.#dragSources.clear();
		this.#dropTargets.clear();
		this.#cancelSession('cancel');
	}

	#idleSession: import('./types.ts').DragSession | null = null;

	#getSession(): import('./types.ts').DragSession {
		if (!this.#active) {
			if (!this.#idleSession) {
				const idle: ActiveSession = {
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
				this.#idleSession = createDragSession(idle, () => {});
			}
			return this.#idleSession;
		}
		return createDragSession(this.#active, (node) => this.#activeSource?.setVisual(node));
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

		const onDown = this.#onPointerDown.bind(this);
		const onMove = this.#onPointerMove.bind(this);
		const onUp = this.#onPointerUp.bind(this);

		listen(target, 'pointerdown', onDown, { passive: true, capture: true });
		listen(target, 'pointermove', onMove, { passive: false, capture: true });
		listen(target, 'pointerup', onUp, { passive: true, capture: true });
		listen(target, 'pointercancel', onUp, { passive: true, capture: true });

		listen(target, 'keydown', this.#onKeyDown.bind(this), { passive: true });

		this.#listenersInitialized = true;
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
		inst.syncContext();

		this.#beginSession(inst, e);
	}

	#onPointerMove(e: PointerEvent) {
		const inst = this.#activeSource;
		if (!inst?.isInteracting) return;

		inst.lastEvent = e;
		if (this.#active) {
			this.#active.pointerX = e.clientX;
			this.#active.pointerY = e.clientY;
		}

		if (!inst.isDragging) {
			const ctx = inst.createDragCtx(this.#active, () => this.#getSession());
			const startOk = this.#runStart(inst, ctx, e);
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
		inst.syncContext();

		if (this.#active) {
			this.#active.deltaX = inst.deltaX;
			this.#active.deltaY = inst.deltaY;
		}

		const ctx = inst.createDragCtx(this.#active, () => this.#getSession());
		this.#runDrag(inst, ctx, e);
		inst.offsetX += inst.proposedX;
		inst.offsetY += inst.proposedY;
		inst.proposedX = 0;
		inst.proposedY = 0;
		inst.syncContext();
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

		const ctx = inst.createDragCtx(this.#active, () => this.#getSession());
		this.#runEnd(inst, ctx, e, reason);
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
	}

	#cleanupPointer(pointerId: number) {
		const inst = this.#activeSource;
		if (!inst) return;
		inst.isInteracting = false;
		inst.isDragging = false;
		this.#active = null;
		this.#activeSource = null;
		this.#activePointerId = null;
	}

	#runStart(inst: DragInstance, ctx: DragCtx, e: PointerEvent): boolean {
		return this.#runHookBuckets(
			inst,
			ctx,
			e,
			[inst.preStart, inst.resolveStart, inst.postStart],
			'start',
		);
	}

	#runDrag(inst: DragInstance, ctx: DragCtx, e: PointerEvent) {
		const buckets = [inst.preDrag, inst.resolveDrag, inst.postDrag];
		outer: for (const bucket of buckets) {
			for (const plugin of bucket) {
				if (inst.failed.has(plugin.key) || !plugin.drag) continue;
				if (inst.cancelled && plugin.skipOnCancel) continue;

				const state = inst.states.get(plugin.key);
				const result = this.#resultify(
					() => plugin.drag!(ctx, state, e),
					{ phase: 'drag', plugin: { name: plugin.name, hook: 'drag' }, node: inst.rootNode },
					inst,
					plugin.key,
				);

				if (!result.ok) continue;

				const patch = result.value;
				if (patch) {
					if (patch.x !== undefined) inst.proposedX = patch.x;
					if (patch.y !== undefined) inst.proposedY = patch.y;
					inst.syncContext();
				}

				if (inst.cancelled) break outer;
			}
		}
	}

	#runEnd(inst: DragInstance, ctx: DragCtx, e: PointerEvent, reason: EndReason) {
		const buckets = [inst.preEnd, inst.resolveEnd, inst.postEnd];
		for (const bucket of buckets) {
			for (const plugin of bucket) {
				if (inst.failed.has(plugin.key) || !plugin.end) continue;
				if (inst.cancelled && plugin.skipOnCancel) continue;
				const state = inst.states.get(plugin.key);
				this.#resultify(
					() => plugin.end!(ctx, state, e, reason),
					{ phase: 'end', plugin: { name: plugin.name, hook: 'end' }, node: inst.rootNode },
					inst,
					plugin.key,
				);
			}
		}
	}

	#runHookBuckets(
		inst: DragInstance,
		ctx: DragCtx,
		e: PointerEvent,
		buckets: DragPlugin[][],
		hook: 'start',
	): boolean {
		for (const bucket of buckets) {
			for (const plugin of bucket) {
				if (inst.failed.has(plugin.key) || !plugin.start) continue;
				const state = inst.states.get(plugin.key);
				const result = this.#resultify(
					() => plugin.start!(ctx, state, e),
					{ phase: 'start', plugin: { name: plugin.name, hook: 'start' }, node: inst.rootNode },
					inst,
					plugin.key,
				);
				if (!result.ok) return false;
				if (result.value === false) return false;
				if (inst.cancelled) return false;
			}
		}
		return true;
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

	#dropBuckets(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
	): DropPlugin[][] {
		switch (hook) {
			case 'enter':
				return [inst.preEnter, inst.resolveEnter, inst.postEnter];
			case 'over':
				return [inst.preOver, inst.resolveOver, inst.postOver];
			case 'leave':
				return [inst.preLeave, inst.resolveLeave, inst.postLeave];
			default:
				return [inst.preDrop, inst.resolveDrop, inst.postDrop];
		}
	}

	#runDropHook(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		e: PointerEvent,
	): boolean | void {
		const ctx = this.#createDropCtx(inst);
		const buckets = this.#dropBuckets(inst, hook);
		for (const bucket of buckets) {
			for (let i = 0; i < bucket.length; i++) {
				const plugin = bucket[i]!;
				if (inst.failed.has(plugin.key)) continue;
				const handler = plugin[hook];
				if (!handler) continue;
				const state = inst.states.get(plugin.key);
				const result = this.#resultifyDrop(
					() => handler(ctx, state, e),
					{ phase: hook, plugin: { name: plugin.name, hook }, node: inst.rootNode },
					inst,
					plugin.key,
				);
				if (!result.ok) continue;
				if (hook === 'enter' && result.value === false) return false;
			}
		}
		return true;
	}

	#createDropCtx(inst: DropInstance): DropCtx {
		const engine = this;
		return {
			get pointer() {
				return {
					x: engine.#active?.pointerX ?? 0,
					y: engine.#active?.pointerY ?? 0,
				};
			},
			get session() {
				return engine.#getSession();
			},
			rootNode: inst.rootNode,
			get cachedRootNodeRect() {
				return inst.cachedRootNodeRect;
			},
			get lastEvent() {
				return engine.#activeSource?.lastEvent ?? null;
			},
			get isOver() {
				return inst.isOver;
			},
			effect(fn) {
				inst.effects.schedule(fn);
			},
		};
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
				plugin.update?.(inst.createDragCtx(this.#active, () => this.#getSession()), inst.states.get(plugin.key));
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
		const ctx = inst.createDragCtx(this.#active, () => this.#getSession());
		const result = this.#resultify(
			() => {
				const state = plugin.init!(ctx);
				if (state !== undefined) inst.states.set(plugin.key, state);
			},
			{ phase: 'init', plugin: { name: plugin.name, hook: 'init' }, node: inst.rootNode },
			inst,
			plugin.key,
		);
		if (!result.ok) inst.failed.add(plugin.key);
	}

	#destroyOneDragPlugin(inst: DragInstance, plugin: DragPlugin) {
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		const ctx = inst.createDragCtx(this.#active, () => this.#getSession());
		this.#resultify(
			() => plugin.destroy!(ctx, inst.states.get(plugin.key)),
			{ phase: 'destroy', plugin: { name: plugin.name, hook: 'destroy' }, node: inst.rootNode },
			inst,
			plugin.key,
		);
		inst.states.delete(plugin.key);
	}

	#initDropPlugins(inst: DropInstance) {
		const ctx = this.#createDropCtx(inst);
		for (const plugin of inst.flat) {
			if (!plugin.init) continue;
			const result = this.#resultifyDrop(
				() => {
					const state = plugin.init!(ctx);
					if (state !== undefined) inst.states.set(plugin.key, state);
				},
				{ phase: 'init', plugin: { name: plugin.name, hook: 'init' }, node: inst.rootNode },
				inst,
				plugin.key,
			);
			if (!result.ok) inst.failed.add(plugin.key);
		}
		inst.effects.flush();
	}

	#destroyDrag(inst: DragInstance) {
		for (const plugin of inst.flat) this.#destroyOneDragPlugin(inst, plugin);
		inst.controller.abort();
		inst.effects.clear();
	}

	#destroyDrop(inst: DropInstance) {
		for (const plugin of inst.flat) {
			if (plugin.destroy) {
				const ctx = this.#createDropCtx(inst);
				this.#resultifyDrop(
					() => plugin.destroy!(ctx, inst.states.get(plugin.key)),
					{ phase: 'destroy', plugin: { name: plugin.name, hook: 'destroy' }, node: inst.rootNode },
					inst,
					plugin.key,
				);
			}
		}
		inst.controller.abort();
		inst.effects.clear();
	}

	#resultify<T>(
		fn: () => T,
		info: Omit<ErrorInfo, 'error'>,
		inst: DragInstance,
		key: symbol,
	): Result<T> {
		try {
			return { ok: true, value: fn() };
		} catch (error) {
			this.#onError?.({ ...info, error });
			if (this.#dev) throw error;
			inst.failed.add(key);
			return { ok: false, error };
		}
	}

	#resultifyDrop<T>(
		fn: () => T,
		info: Omit<ErrorInfo, 'error'>,
		inst: DropInstance,
		key: symbol,
	): Result<T> {
		try {
			return { ok: true, value: fn() };
		} catch (error) {
			this.#onError?.({ ...info, error });
			if (this.#dev) throw error;
			inst.failed.add(key);
			return { ok: false, error };
		}
	}
}

export function createEngine(options?: EngineOptions) {
	return new InteractionEngine(options);
}

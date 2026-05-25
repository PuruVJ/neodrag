import { is_svg_element, is_svg_svg_element, listen } from '../utils.ts';
import {
	ActiveSession,
	DragInstance,
	DropInstance,
	type DropCtxHost,
	SessionPrivate,
} from './instance.ts';
import { DragHandle, DropHandle } from './handles.ts';
import { resolvePluginList } from './resolve-plugins.ts';
import { reconcilePluginListUpdate } from './plugin-reconcile.ts';
import {
	diffPluginFlat,
	mergePluginsByKey,
	pluginsLayoutChanged,
} from './plugin-lifecycle.ts';
import { sortByPhase } from './phase.ts';
import { DEFAULT_DRAG_PLUGINS, DEFAULTS } from '../defaults.ts';
import { applyDragTransform, type TransformApplier } from './apply-transform.ts';
import { DropTargetTracker, type DropTargetHost } from './drop-targets.ts';
import { createDragSession, resolveEndReason } from './session.ts';
import { transitionSession } from './state-machine.ts';
import type {
	DragCtx,
	DragPlugin,
	DragPluginList,
	DropCtx,
	DropPlugin,
	DropPluginList,
	DropTargetInfo,
	EndReason,
	ErrorInfo,
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
	static #sharedInstance: Neodrag | null = null;

	static get shared(): Neodrag {
		return (Neodrag.#sharedInstance ??= new Neodrag({ dev: false }));
	}
	#dragSources = new Map<HTMLElement | SVGElement, DragInstance>();
	#dropTargets = new Map<HTMLElement | SVGElement, DropInstance>();
	#dropCount = 0;

	#active: ActiveSession | null = null;
	#activeSource: DragInstance | null = null;
	#activePointerId: number | null = null;

	#listenersInitialized = false;
	#listenerDelegate: HTMLElement | null = null;
	#boundOnDown: ((e: PointerEvent) => void) | null = null;
	#boundOnKeyDown: ((e: KeyboardEvent) => void) | null = null;
	#boundOnMove: ((e: PointerEvent) => void) | null = null;
	#boundOnUp: ((e: PointerEvent) => void) | null = null;
	#pointerSessionAbort: AbortController | null = null;

	#lastTarget: Element | null = null;
	#lastResult: HTMLElement | SVGElement | null = null;

	#defaultDragPlugins: DragPlugin[];
	#defaultDropPlugins: DropPlugin[];
	#delegate?: () => HTMLElement;
	#onError?: (error: ErrorInfo) => void;
	#dev: boolean;

	#soleDrop: DropInstance | null = null;
	#dropTracker: DropTargetTracker;
	#dropHostBridge: DropTargetHost;

	#idleSession: import('./types.ts').DragSession | null = null;
	#activeSessionView: import('./types.ts').DragSession | null = null;

	readonly #dropHost: DropCtxHost = {
		pointerX: 0,
		pointerY: 0,
		lastEvent: null,
		session: null!,
	};

	constructor(options: EngineOptions = {}) {
		this.#dropHostBridge = {
			getDropCount: () => this.#dropCount,
			getSoleDrop: () => this.#soleDrop,
			getActive: () => this.#active,
			getActiveSource: () => this.#activeSource,
			getDropTargets: () => this.#dropTargets,
			runDropHook: (inst, hook, e) => this.#runDropHook(inst, hook, e),
		};
		this.#dropTracker = new DropTargetTracker(this.#dropHostBridge);

		this.#defaultDragPlugins = options.plugins ?? DEFAULT_DRAG_PLUGINS;
		this.#defaultDropPlugins = options.dropPlugins ?? [];
		this.#delegate = options.delegate;
		this.#onError = options.onError ?? DEFAULTS.onError;
		this.#dev = options.dev ?? DEV;
	}

	#createIdleActive(): ActiveSession {
		const root =
			typeof document !== 'undefined'
				? document.documentElement
				: ({ getBoundingClientRect: () => new DOMRect() } as HTMLElement);
		return {
			state: 'idle',
			sourceNode: root,
			visualNode: root,
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
		};
	}

	#ensureIdleSession(): import('./types.ts').DragSession {
		if (!this.#idleSession) {
			this.#idleSession = createDragSession(this.#createIdleActive(), () => {});
			if (!this.#activeSessionView) {
				this.#dropHost.session = this.#idleSession;
			}
		}
		return this.#idleSession;
	}

	get dev() {
		return this.#dev;
	}

	set dev(value: boolean) {
		this.#dev = value;
	}

	draggable(
		node: HTMLElement | SVGElement,
		plugins: DragPluginList = [],
		options: { applyTransform?: TransformApplier } = {},
	): DragHandle {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. Wrap it in a div or use a child element.',
			);
		}

		this.#initListeners();

		const inst = new DragInstance(node, this.#ensureIdleSession());
		inst.applyTransform = options.applyTransform;
		inst.lastSlots = plugins;
		inst.slotStaticCache = [];
		const resolved = resolvePluginList(plugins, inst.slotStaticCache, false);
		this.#installDragPlugins(inst, resolved);
		this.#syncDragTransform(inst);
		this.#dragSources.set(node, inst);

		return new DragHandle(this, node, () => {
			this.#destroyDrag(inst);
			this.#dragSources.delete(node);
		});
	}

	droppable(node: HTMLElement | SVGElement, plugins: DropPluginList = []): DropHandle {
		this.#initListeners();

		const inst = new DropInstance(node, this.#dropHost);
		inst.lastSlots = plugins;
		inst.slotStaticCache = [];
		const resolved = resolvePluginList(plugins, inst.slotStaticCache, false);
		this.#installDropPlugins(inst, resolved);
		this.#dropTargets.set(node, inst);
		this.#dropCount++;
		if (this.#dropCount === 1) this.#soleDrop = inst;

		return new DropHandle(this, node, () => {
			this.#destroyDrop(inst);
			this.#dropTargets.delete(node);
			this.#dropCount--;
			if (this.#soleDrop === inst) this.#soleDrop = null;
		});
	}

	updateDrop(node: HTMLElement | SVGElement, plugins: DropPluginList) {
		const inst = this.#dropTargets.get(node);
		if (!inst) return;
		reconcilePluginListUpdate({
			inst,
			plugins,
			dev: this.#dev,
			warnLabel: 'drop',
			merge: (resolved) => this.#mergeUserDropPlugins(resolved),
			diff: (target, resolved) => this.#diffDropPlugins(target as DropInstance, resolved),
			recurse: (pending) => this.updateDrop(node, pending as DropPluginList),
		});
	}

	update(node: HTMLElement | SVGElement, plugins: DragPluginList) {
		const inst = this.#dragSources.get(node);
		if (!inst) return;
		reconcilePluginListUpdate({
			inst,
			plugins,
			dev: this.#dev,
			warnLabel: 'drag',
			merge: (resolved) => this.#mergeUserDragPlugins(resolved),
			diff: (target, resolved) => this.#diffDragPlugins(target as DragInstance, resolved),
			recurse: (pending) => this.update(node, pending as DragPluginList),
		});
	}

	dispose() {
		this.#disarmPointerSession();
		this.#endActiveInteraction('cancel');
		for (const inst of this.#dragSources.values()) this.#destroyDrag(inst);
		for (const inst of this.#dropTargets.values()) this.#destroyDrop(inst);
		this.#dragSources.clear();
		this.#dropTargets.clear();
		this.#dropCount = 0;
		this.#soleDrop = null;
		this.#removeGlobalListeners();
	}

	#beginSession(source: DragInstance, e: PointerEvent) {
		const rect = source.rootNode.getBoundingClientRect();
		this.#active = {
			state: transitionSession('idle', { type: 'pointerdown' }),
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
		};
		this.#activeSource = source;
		this.#activePointerId = e.pointerId;

		this.#activeSessionView = createDragSession(this.#active, (node) => this.#activeSource?.setVisual(node));
		source.bindSession(this.#activeSessionView, () => {
			if (this.#active) {
				this.#active.state = transitionSession(this.#active.state, { type: 'cancel' });
			}
		});
		this.#dropHost.session = this.#activeSessionView;
	}

	#cancelSession(reason: EndReason) {
		if (!this.#active || !this.#activeSource) return;
		const e = this.#activeSource.lastEvent;
		if (e) this.#finishInteraction(reason, e);
	}

	#resolveDelegateTarget(): HTMLElement {
		return (this.#delegate ?? DEFAULTS.delegate)();
	}

	#initListeners() {
		if (this.#listenersInitialized) return;
		const target = this.#resolveDelegateTarget();
		this.#listenerDelegate = target;
		this.#boundOnDown = this.#onPointerDown.bind(this);
		this.#boundOnKeyDown = this.#onKeyDown.bind(this);
		this.#boundOnMove = this.#onPointerMove.bind(this);
		this.#boundOnUp = this.#onPointerUp.bind(this);

		listen(target, 'pointerdown', this.#boundOnDown, { passive: true, capture: true });
		listen(target, 'keydown', this.#boundOnKeyDown, { passive: true });

		this.#listenersInitialized = true;
	}

	#removeGlobalListeners() {
		if (!this.#listenersInitialized || !this.#listenerDelegate) return;
		const target = this.#listenerDelegate;
		const capture = { capture: true } as EventListenerOptions;
		if (this.#boundOnDown) target.removeEventListener('pointerdown', this.#boundOnDown, capture);
		if (this.#boundOnKeyDown) target.removeEventListener('keydown', this.#boundOnKeyDown);
		this.#listenersInitialized = false;
		this.#listenerDelegate = null;
		this.#boundOnDown = null;
		this.#boundOnKeyDown = null;
		this.#boundOnMove = null;
		this.#boundOnUp = null;
	}

	#armPointerSession() {
		if (this.#pointerSessionAbort) return;
		const target = this.#listenerDelegate ?? this.#resolveDelegateTarget();
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
		if (this.#activeSource?.isInteracting) return;

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
		this.#dropTracker.reset();
		this.#beginSession(inst, e);
		this.#armPointerSession();
	}

	#onPointerMove(e: PointerEvent) {
		if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId) return;

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
			if (!startOk) {
				if (this.#active) {
					this.#active.state = transitionSession(this.#active.state, { type: 'start-abort' });
				}
				return;
			}
			if (inst.cancelled) return;

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
		inst.dragCtx.effect(() => this.#syncDragTransform(inst));
		inst.effects.flush();

		if (this.#dropCount > 0) this.#dropTracker.queueUpdate(e);
	}

	#onPointerUp(e: PointerEvent) {
		if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId) return;

		const inst = this.#activeSource;
		if (!inst?.isInteracting) return;

		if (inst.isDragging && this.#dropCount > 0) {
			this.#dropTracker.flush(e);
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

		if (
			inst.pointerCapturedId !== null &&
			typeof inst.visualNode.hasPointerCapture === 'function' &&
			inst.visualNode.hasPointerCapture(inst.pointerCapturedId)
		) {
			inst.visualNode.releasePointerCapture(inst.pointerCapturedId);
		}

		this.#runEnd(inst, inst.dragCtx, e, reason);
		inst.effects.flush();

		const overDrops = this.#dropTracker.getOverDrops();
		if (reason === 'drop' && overDrops.length > 0) {
			const top = overDrops[overDrops.length - 1]!;
			this.#runDropHook(top, 'drop', e);
			top.effects.flush();
		}

		for (const drop of overDrops) {
			if (drop.isOver) this.#runDropHook(drop, 'leave', e);
			drop.isOver = false;
		}
		if (this.#active) this.#active.overTargets.length = 0;

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

		this.#active = null;
		this.#activeSource = null;
		this.#activePointerId = null;
		this.#activeSessionView = null;
		this.#dropHost.session = this.#ensureIdleSession();
		inst.bindSession(this.#ensureIdleSession());
		this.#disarmPointerSession();
		this.#dropTracker.reset();
	}

	#cleanupPointer(_pointerId: number) {
		const inst = this.#activeSource;
		if (!inst) return;
		inst.cancelled = true;
		const e = inst.lastEvent;
		if (e) {
			this.#finishInteraction('cancel', e);
			return;
		}
		this.#clearSessionState(inst);
	}

	#endActiveInteraction(reason: EndReason) {
		const inst = this.#activeSource;
		if (!inst?.isInteracting) return;
		const e = inst.lastEvent;
		if (e && this.#active) {
			this.#finishInteraction(reason, e);
			return;
		}
		this.#clearSessionState(inst);
	}

	#clearSessionState(inst: DragInstance) {
		inst.isInteracting = false;
		inst.isDragging = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;
		this.#active = null;
		this.#activeSource = null;
		this.#activePointerId = null;
		this.#activeSessionView = null;
		this.#dropHost.session = this.#ensureIdleSession();
		inst.bindSession(this.#ensureIdleSession());
		this.#disarmPointerSession();
		this.#dropTracker.reset();
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

	#mergeUserDragPlugins(userPlugins: DragPlugin[]) {
		return mergePluginsByKey(this.#defaultDragPlugins, userPlugins);
	}

	#installDragPlugins(inst: DragInstance, userPlugins: DragPlugin[]) {
		const merged = this.#mergeUserDragPlugins(userPlugins);
		inst.flat = merged;
		inst.byKey = new Map(merged.map((p) => [p.key, p]));
		inst.rebuildBuckets();
		this.#initDragPlugins(inst);
	}

	#diffDragPlugins(inst: DragInstance, userPlugins: DragPlugin[]) {
		const offsetX = inst.offsetX;
		const offsetY = inst.offsetY;
		diffPluginFlat(inst, {
			userPlugins,
			merge: (resolved) => this.#mergeUserDragPlugins(resolved),
			bucketsChanged: (prev, next) =>
				pluginsLayoutChanged(prev, next, (plugin) => [
					!!plugin.start,
					!!plugin.drag,
					!!plugin.end,
				]),
			init: (plugin) => this.#initOneDragPlugin(inst, plugin),
			destroy: (plugin) => this.#destroyOneDragPlugin(inst, plugin),
			update: (plugin) => plugin.update?.(inst.dragCtx, inst.states.get(plugin.key)),
		});
		if (inst.offsetX !== offsetX || inst.offsetY !== offsetY) this.#syncDragTransform(inst);
		inst.effects.flush();
	}

	#syncDragTransform(inst: DragInstance) {
		applyDragTransform(inst.dragCtx, inst.applyTransform);
	}

	#initDragPlugins(inst: DragInstance) {
		for (const plugin of sortByPhase(inst.flat)) this.#initOneDragPlugin(inst, plugin);
		inst.effects.flush();
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

	#mergeUserDropPlugins(userPlugins: DropPlugin[]) {
		return mergePluginsByKey(this.#defaultDropPlugins, userPlugins);
	}

	#installDropPlugins(inst: DropInstance, userPlugins: DropPlugin[]) {
		const merged = this.#mergeUserDropPlugins(userPlugins);
		inst.flat = merged;
		inst.byKey = new Map(merged.map((p) => [p.key, p]));
		inst.rebuildBuckets();
		this.#initDropPlugins(inst);
	}

	#diffDropPlugins(inst: DropInstance, userPlugins: DropPlugin[]) {
		diffPluginFlat(inst, {
			userPlugins,
			merge: (resolved) => this.#mergeUserDropPlugins(resolved),
			bucketsChanged: (prev, next) =>
				pluginsLayoutChanged(prev, next, (plugin) => [
					!!plugin.enter,
					!!plugin.over,
					!!plugin.leave,
					!!plugin.drop,
				]),
			init: (plugin) => this.#initOneDropPlugin(inst, plugin),
			destroy: (plugin) => this.#destroyOneDropPlugin(inst, plugin),
			update: (plugin) => plugin.update?.(inst.dropCtx, inst.states.get(plugin.key)),
		});
		inst.effects.flush();
	}

	#initDropPlugins(inst: DropInstance) {
		for (const plugin of sortByPhase(inst.flat)) this.#initOneDropPlugin(inst, plugin);
		inst.effects.flush();
	}

	#initOneDropPlugin(inst: DropInstance, plugin: DropPlugin) {
		if (!plugin.init) return;
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'init', plugin: { name: plugin.name, hook: 'init' }, node: inst.rootNode },
			() => {
				const state = plugin.init!(inst.dropCtx);
				if (state !== undefined) inst.states.set(plugin.key, state);
			},
		);
	}

	#destroyOneDropPlugin(inst: DropInstance, plugin: DropPlugin) {
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'destroy', plugin: { name: plugin.name, hook: 'destroy' }, node: inst.rootNode },
			() => plugin.destroy!(inst.dropCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	#destroyDrag(inst: DragInstance) {
		if (this.#activeSource === inst && inst.isInteracting) {
			inst.cancelled = true;
			this.#endActiveInteraction('cancel');
		}
		for (const plugin of inst.flat) this.#destroyOneDragPlugin(inst, plugin);
		inst.controller.abort();
		inst.effects.clear();
	}

	#destroyDrop(inst: DropInstance) {
		for (const plugin of inst.flat) this.#destroyOneDropPlugin(inst, plugin);
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


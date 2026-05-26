import { is_svg_element, is_svg_svg_element, listen } from './utils.ts';
import {
	ActiveSession,
	DragInstance,
	DropInstance,
	type DropCtxHost,
	SessionPrivate,
} from './instance.ts';
import { numberStub } from './length-contract.ts';
import type { LengthAdapter } from './length-runtime.ts';
import { ActiveResizeSession, ResizeInstance } from './resize-instance.ts';
import { invalidateSortableLayoutForNode } from './sortable/index.ts';
import { DragHandle, DropHandle, ResizeHandle } from './handles.ts';
import { applyResize, type ResizeApplier } from './apply-resize.ts';
import { DEFAULT_RESIZE_PLUGINS } from './resize-defaults.ts';
import {
	createResizeSession,
	resolveResizeEndReason,
	sizeFromPointer,
} from './resize-session.ts';
import {
	RESIZE_HANDLE_ATTR,
	type ResizeCtx,
	type ResizeEdge,
	type ResizeEndReason,
	type ResizePlugin,
	type ResizePluginList,
	type ResizeSession,
} from './resize/types.ts';
import { resolvePluginList } from './resolve-plugins.ts';
import { reconcilePluginListUpdate } from './plugin-reconcile.ts';
import {
	diffPluginFlat,
	mergePluginsByKey,
	pluginsLayoutChanged,
} from './plugin-lifecycle.ts';
import { sortByPhase } from './phase.ts';
import { DROP_HIT_EXPAND_KEY } from './plugins.ts';
import { DEFAULT_DRAG_PLUGINS, DEFAULTS } from './defaults.ts';
import { applyDragTransform, type TransformApplier } from './apply-transform.ts';
import { DropTargetTracker, type DropTargetHost } from './drop-targets.ts';
import { createDragSession, resolveEndReason } from './session.ts';
import { defaultSensors } from './sensors/defaults.ts';
import type { Sensor, SensorHost } from './sensors/types.ts';
import { transitionSession } from './state-machine.ts';
import {
	assertNamedPluginKeys,
	type DragCtx,
	type DragPlugin,
	type DragPluginList,
	type DragSession,
	type DropCtx,
	type DropPlugin,
	type DropPluginList,
	type DropTargetInfo,
	type EndReason,
	type ErrorInfo,
	type SessionState,
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
	sensors?: Sensor[];
	onError?: (error: ErrorInfo) => void;
	dev?: boolean;
}

export interface NeodragDebugSnapshot {
	dragTargets: number;
	dropTargets: number;
	resizeTargets: number;
	session: {
		state: SessionState;
		pointerX: number;
		pointerY: number;
		deltaX: number;
		deltaY: number;
		overTargets: number;
	} | null;
	resizeSession: {
		state: SessionState;
		pointerX: number;
		pointerY: number;
		deltaWidth: number;
		deltaHeight: number;
		width: number;
		height: number;
		anchor: ResizeEdge;
	} | null;
}

export class Neodrag {
	static #sharedInstance: Neodrag | null = null;

	static get shared(): Neodrag {
		return (Neodrag.#sharedInstance ??= new Neodrag({ dev: false }));
	}
	#dragSources = new Map<HTMLElement | SVGElement, DragInstance>();
	#dropTargets = new Map<HTMLElement | SVGElement, DropInstance>();
	#resizeSources = new Map<HTMLElement | SVGElement, ResizeInstance>();
	#dropCount = 0;

	#active: ActiveSession | null = null;
	#activeSource: DragInstance | null = null;
	#activeResize: ActiveResizeSession | null = null;
	#activeResizeSource: ResizeInstance | null = null;
	#activePointerId: number | null = null;

	#sensorsInitialized = false;
	#sensorCleanups: (() => void)[] = [];
	#pointerDisarm: (() => void) | null = null;
	#sensors: Sensor[];

	#lastTarget: Element | null = null;
	#lastResult: HTMLElement | SVGElement | null = null;

	#defaultDragPlugins: DragPlugin[];
	#defaultDropPlugins: DropPlugin[];
	#defaultResizePlugins: ResizePlugin[];
	#delegate?: () => HTMLElement;
	#onError?: (error: ErrorInfo) => void;
	#dev: boolean;

	#soleDrop: DropInstance | null = null;
	#dropTracker: DropTargetTracker;
	#dropHostBridge: DropTargetHost;

	#idleSession: DragSession | null = null;
	#activeSessionView: DragSession | null = null;
	#idleResizeSession: ResizeSession | null = null;
	#activeResizeSessionView: ResizeSession | null = null;

	readonly #dropHost: DropCtxHost = {
		pointerX: 0,
		pointerY: 0,
		lastEvent: null,
		session: null!,
	};

	readonly #sensorHost: SensorHost;

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
		this.#defaultResizePlugins = DEFAULT_RESIZE_PLUGINS;
		this.#delegate = options.delegate;
		this.#sensors = options.sensors ?? defaultSensors();
		this.#onError = options.onError ?? DEFAULTS.onError;
		this.#dev = options.dev ?? DEV;

		this.#sensorHost = {
			getDelegate: () => this.#resolveDelegateTarget(),
			setPointerDisarm: (disarm) => {
				this.#pointerDisarm = disarm;
			},
			onPointerDown: (e) => this.#onPointerDown(e),
			onPointerMove: (e) => this.#onPointerMove(e),
			onPointerUp: (e) => this.#onPointerUp(e),
			cancelActive: (reason) => this.#cancelSession(reason),
		};
	}

	#createIdleActive(): ActiveSession {
		const root = document.documentElement;
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

	#ensureIdleSession(): DragSession {
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
		options: { applyTransform?: TransformApplier; length?: LengthAdapter } = {},
	): DragHandle {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. Wrap it in a div or use a child element.',
			);
		}

		this.#initSensors();

		const inst = new DragInstance(
			node,
			this.#ensureIdleSession(),
			options.length ?? numberStub,
		);
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

	resizable(
		node: HTMLElement | SVGElement,
		plugins: ResizePluginList = [],
		options: { applyResize?: ResizeApplier; length?: LengthAdapter } = {},
	): ResizeHandle {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Resizing the root SVG element directly is not supported. Wrap it in a div or use an HTML wrapper.',
			);
		}

		this.#initSensors();

		const inst = new ResizeInstance(
			node,
			this.#ensureIdleResizeSession(),
			options.length ?? numberStub,
		);
		inst.applyResize = options.applyResize;
		inst.lastSlots = plugins;
		inst.slotStaticCache = [];
		const resolved = resolvePluginList(plugins, inst.slotStaticCache, false);
		this.#installResizePlugins(inst, resolved);
		this.#syncResize(inst);
		this.#resizeSources.set(node, inst);

		return new ResizeHandle(this, node, () => {
			this.#destroyResize(inst);
			this.#resizeSources.delete(node);
		});
	}

	droppable(
		node: HTMLElement | SVGElement,
		plugins: DropPluginList = [],
		options: { length?: LengthAdapter } = {},
	): DropHandle {
		this.#initSensors();

		const inst = new DropInstance(node, this.#dropHost, options.length ?? numberStub);
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

	updateResize(node: HTMLElement | SVGElement, plugins: ResizePluginList) {
		const inst = this.#resizeSources.get(node);
		if (!inst) return;
		reconcilePluginListUpdate({
			inst,
			plugins,
			dev: this.#dev,
			warnLabel: 'resize',
			merge: (resolved) => this.#mergeUserResizePlugins(resolved),
			diff: (target, resolved) => this.#diffResizePlugins(target as ResizeInstance, resolved),
			recurse: (pending) => this.updateResize(node, pending as ResizePluginList),
		});
	}

	debugSnapshot(): NeodragDebugSnapshot | null {
		if (!this.#dev) return null;
		const active = this.#active;
		const activeResize = this.#activeResize;
		return {
			dragTargets: this.#dragSources.size,
			dropTargets: this.#dropCount,
			resizeTargets: this.#resizeSources.size,
			session: active
				? {
						state: active.state,
						pointerX: active.pointerX,
						pointerY: active.pointerY,
						deltaX: active.deltaX,
						deltaY: active.deltaY,
						overTargets: active.overTargets.length,
					}
				: null,
			resizeSession: activeResize
				? {
						state: activeResize.state,
						pointerX: activeResize.pointerX,
						pointerY: activeResize.pointerY,
						deltaWidth: activeResize.deltaWidth,
						deltaHeight: activeResize.deltaHeight,
						width: activeResize.width,
						height: activeResize.height,
						anchor: activeResize.anchor,
					}
				: null,
		};
	}

	dispose() {
		this.#pointerDisarm?.();
		this.#endActiveInteraction('cancel');
		for (const inst of this.#dragSources.values()) this.#destroyDrag(inst);
		for (const inst of this.#dropTargets.values()) this.#destroyDrop(inst);
		for (const inst of this.#resizeSources.values()) this.#destroyResize(inst);
		this.#dragSources.clear();
		this.#dropTargets.clear();
		this.#resizeSources.clear();
		this.#dropCount = 0;
		this.#soleDrop = null;
		this.#teardownSensors();
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
		if (this.#activeResizeSource?.isInteracting) {
			const e = this.#activeResizeSource.lastEvent;
			if (e) this.#finishResize('cancel', e);
			return;
		}
		if (!this.#active || !this.#activeSource) return;
		const e = this.#activeSource.lastEvent;
		if (e) this.#finishInteraction(reason, e);
	}

	#resolveDelegateTarget(): HTMLElement {
		return (this.#delegate ?? DEFAULTS.delegate)();
	}

	#initSensors() {
		if (this.#sensorsInitialized) return;
		for (const sensor of this.#sensors) {
			this.#sensorCleanups.push(sensor.setup(this.#sensorHost));
		}
		this.#sensorsInitialized = true;
	}

	#teardownSensors() {
		for (const cleanup of this.#sensorCleanups) cleanup();
		this.#sensorCleanups.length = 0;
		this.#sensorsInitialized = false;
		this.#pointerDisarm = null;
	}

	#onPointerDown(e: PointerEvent) {
		if (e.button === 2) return;
		if (this.#activeSource?.isInteracting || this.#activeResizeSource?.isInteracting) return;

		const resizeHit = this.#findResizeTarget(e);
		if (resizeHit) {
			const { inst, anchor, handleNode } = resizeHit;
			inst.cachedRootNodeRect = inst.rootNode.getBoundingClientRect();
			inst.cachedTargetRect = inst.targetNode.getBoundingClientRect();
			inst.inverseScale = this.#inverseScaleResize(inst);
			inst.loadSizeFromNode();
			inst.initialWidth = inst.width;
			inst.initialHeight = inst.height;
			inst.initialAuthored = inst.lengthAdapter.cloneAuthored(inst.unitPreserve);
			inst.initialPointerX = e.clientX;
			inst.initialPointerY = e.clientY;
			inst.anchor = anchor;
			inst.handleNode = handleNode;
			inst.isInteracting = true;
			inst.cancelled = false;
			inst.lastEvent = e;
			this.#beginResizeSession(inst, e);
			return;
		}

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
	}

	#onPointerMove(e: PointerEvent) {
		if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId) return;

		if (this.#activeResizeSource?.isInteracting) {
			this.#onResizePointerMove(e);
			return;
		}

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

		if (this.#activeResizeSource?.isInteracting) {
			const reason = resolveResizeEndReason(this.#activeResize, this.#activeResizeSource.cancelled);
			this.#finishResize(reason, e);
			return;
		}

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
		this.#pointerDisarm?.();
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
		const resizeInst = this.#activeResizeSource;
		if (resizeInst?.isInteracting) {
			const e = resizeInst.lastEvent;
			if (e && this.#activeResize) {
				this.#finishResize(reason === 'cancel' ? 'cancel' : 'commit', e);
				return;
			}
			this.#clearResizeSessionState(resizeInst);
			return;
		}

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
		this.#pointerDisarm?.();
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
				{ phase: 'start', plugin: { key: plugin.key, hook: 'start' }, node: inst.rootNode },
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
				{ ...info, plugin: { key: plugin.key, hook: 'drag' } },
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
				{ phase: 'end', plugin: { key: plugin.key, hook: 'end' }, node: inst.rootNode },
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
				{ ...info, plugin: { key: plugin.key, hook } },
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
		assertNamedPluginKeys(userPlugins, this.#dev);
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
			{ phase: 'init', plugin: { key: plugin.key, hook: 'init' }, node: inst.rootNode },
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
			{ phase: 'destroy', plugin: { key: plugin.key, hook: 'destroy' }, node: inst.rootNode },
			() => plugin.destroy!(inst.dragCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	#mergeUserDropPlugins(userPlugins: DropPlugin[]) {
		assertNamedPluginKeys(userPlugins, this.#dev);
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
			{ phase: 'init', plugin: { key: plugin.key, hook: 'init' }, node: inst.rootNode },
			() => {
				const state = plugin.init!(inst.dropCtx);
				if (state !== undefined) {
					inst.states.set(plugin.key, state);
					if (plugin.key === DROP_HIT_EXPAND_KEY) {
						inst.hitExpandPx = state as {
							top: number;
							right: number;
							bottom: number;
							left: number;
						};
					}
				}
			},
		);
	}

	#destroyOneDropPlugin(inst: DropInstance, plugin: DropPlugin) {
		if (plugin.key === DROP_HIT_EXPAND_KEY) inst.hitExpandPx = null;
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'destroy', plugin: { key: plugin.key, hook: 'destroy' }, node: inst.rootNode },
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

	#createIdleResizeActive(): ActiveResizeSession {
		const root = document.documentElement;
		return {
			state: 'idle',
			sourceNode: root,
			sourceRect: new DOMRect(),
			anchor: 'se',
			pointerX: 0,
			pointerY: 0,
			deltaWidth: 0,
			deltaHeight: 0,
			width: 0,
			height: 0,
			data: undefined,
			pointerId: -1,
			startedAt: 0,
		};
	}

	#ensureIdleResizeSession(): ResizeSession {
		if (!this.#idleResizeSession) {
			this.#idleResizeSession = createResizeSession(this.#createIdleResizeActive());
		}
		return this.#idleResizeSession;
	}

	#beginResizeSession(source: ResizeInstance, e: PointerEvent) {
		const rect = source.rootNode.getBoundingClientRect();
		this.#activeResize = {
			state: transitionSession('idle', { type: 'pointerdown' }),
			sourceNode: source.rootNode,
			sourceRect: rect,
			anchor: source.anchor,
			pointerX: e.clientX,
			pointerY: e.clientY,
			deltaWidth: 0,
			deltaHeight: 0,
			width: source.width,
			height: source.height,
			data: undefined,
			pointerId: e.pointerId,
			startedAt: Date.now(),
		};
		this.#activeResizeSource = source;
		this.#activePointerId = e.pointerId;

		this.#activeResizeSessionView = createResizeSession(this.#activeResize);
		source.bindSession(this.#activeResizeSessionView, () => {
			if (this.#activeResize) {
				this.#activeResize.state = transitionSession(this.#activeResize.state, { type: 'cancel' });
			}
		});
	}

	#onResizePointerMove(e: PointerEvent) {
		const inst = this.#activeResizeSource;
		if (!inst?.isInteracting) return;

		inst.lastEvent = e;
		if (this.#activeResize) {
			this.#activeResize.pointerX = e.clientX;
			this.#activeResize.pointerY = e.clientY;
		}

		if (!inst.isResizing) {
			const startOk = this.#runResizeStart(inst, inst.resizeCtx, e);
			inst.effects.flush();
			if (!startOk) {
				if (this.#activeResize) {
					this.#activeResize.state = transitionSession(this.#activeResize.state, { type: 'start-abort' });
				}
				return;
			}
			if (inst.cancelled) return;

			inst.isResizing = true;
			if (this.#activeResize) {
				this.#activeResize.state = transitionSession(this.#activeResize.state, { type: 'threshold-passed' });
			}

			const captureNode = inst.handleNode ?? (inst.rootNode as HTMLElement);
			inst.pointerCapturedId = e.pointerId;
			try {
				captureNode.setPointerCapture(e.pointerId);
			} catch {
				this.#cleanupResizePointer(e.pointerId);
				return;
			}
		}

		e.preventDefault();

		const target = sizeFromPointer(
			inst.anchor,
			inst.initialPointerX,
			inst.initialPointerY,
			inst.initialWidth,
			inst.initialHeight,
			e.clientX,
			e.clientY,
			inst.inverseScale,
		);
		inst.deltaWidth = target.width - inst.width;
		inst.deltaHeight = target.height - inst.height;
		inst.proposedWidth = inst.deltaWidth;
		inst.proposedHeight = inst.deltaHeight;

		if (this.#activeResize) {
			this.#activeResize.deltaWidth = inst.deltaWidth;
			this.#activeResize.deltaHeight = inst.deltaHeight;
		}

		this.#runResize(inst, inst.resizeCtx, e);
		inst.width += inst.proposedWidth;
		inst.height += inst.proposedHeight;
		inst.proposedWidth = 0;
		inst.proposedHeight = 0;

		if (this.#activeResize) {
			this.#activeResize.width = inst.width;
			this.#activeResize.height = inst.height;
		}

		inst.resizeCtx.effect(() => this.#syncResize(inst));
		inst.effects.flush();
	}

	#finishResize(reason: ResizeEndReason, e: PointerEvent) {
		const inst = this.#activeResizeSource;
		if (!inst) return;

		const captureNode = inst.handleNode ?? (inst.rootNode as HTMLElement);
		if (
			inst.pointerCapturedId !== null &&
			typeof captureNode.hasPointerCapture === 'function' &&
			captureNode.hasPointerCapture(inst.pointerCapturedId)
		) {
			captureNode.releasePointerCapture(inst.pointerCapturedId);
		}

		this.#runResizeEnd(inst, inst.resizeCtx, e, reason);
		inst.effects.flush();

		if (reason === 'cancel') {
			inst.width = inst.initialWidth;
			inst.height = inst.initialHeight;
			inst.displaySize = inst.lengthAdapter.cloneAuthored(inst.initialAuthored);
			inst.unitPreserve = inst.lengthAdapter.cloneAuthored(inst.initialAuthored);
			this.#syncResize(inst);
			inst.effects.flush();
		} else {
			invalidateSortableLayoutForNode(inst.targetNode);
		}

		inst.isInteracting = false;
		inst.isResizing = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;
		inst.handleNode = null;

		if (this.#activeResize) {
			this.#activeResize.state = transitionSession(this.#activeResize.state, {
				type: 'pointerup',
				reason: reason === 'cancel' ? 'cancel' : 'no-target',
			});
		}

		this.#activeResize = null;
		this.#activeResizeSource = null;
		this.#activePointerId = null;
		this.#activeResizeSessionView = null;
		inst.bindSession(this.#ensureIdleResizeSession());
		this.#pointerDisarm?.();
	}

	#cleanupResizePointer(_pointerId: number) {
		const inst = this.#activeResizeSource;
		if (!inst) return;
		inst.cancelled = true;
		const e = inst.lastEvent;
		if (e) {
			this.#finishResize('cancel', e);
			return;
		}
		this.#clearResizeSessionState(inst);
	}

	#clearResizeSessionState(inst: ResizeInstance) {
		inst.isInteracting = false;
		inst.isResizing = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;
		inst.handleNode = null;
		this.#activeResize = null;
		this.#activeResizeSource = null;
		this.#activePointerId = null;
		this.#activeResizeSessionView = null;
		inst.bindSession(this.#ensureIdleResizeSession());
		this.#pointerDisarm?.();
	}

	#findResizeTarget(e: PointerEvent): {
		inst: ResizeInstance;
		anchor: ResizeEdge;
		handleNode: HTMLElement;
	} | null {
		const path = e.composedPath();
		for (let i = 0; i < Math.min(path.length, 20); i++) {
			const el = path[i];
			if (!(el instanceof HTMLElement)) continue;
			const attr = el.getAttribute(RESIZE_HANDLE_ATTR);
			if (!attr) continue;
			const anchor = attr as ResizeEdge;
			for (let j = i + 1; j < path.length; j++) {
				const root = path[j];
				if (
					root instanceof HTMLElement &&
					this.#resizeSources.has(root as HTMLElement | SVGElement)
				) {
					return {
						inst: this.#resizeSources.get(root as HTMLElement)!,
						anchor,
						handleNode: el,
					};
				}
			}
			let parent: HTMLElement | null = el.parentElement;
			while (parent) {
				if (this.#resizeSources.has(parent)) {
					return { inst: this.#resizeSources.get(parent)!, anchor, handleNode: el };
				}
				parent = parent.parentElement;
			}
		}
		return null;
	}

	#inverseScaleResize(inst: ResizeInstance) {
		const node = inst.targetNode;
		let scale = 1;

		if (node instanceof SVGElement) {
			const bbox = (node as SVGGraphicsElement).getBBox();
			const rect = inst.cachedTargetRect;
			if (bbox.width && rect.width) scale = bbox.width / rect.width;
		} else {
			const el = node as HTMLElement;
			scale = el.offsetWidth / inst.cachedTargetRect.width;
		}

		return Number.isFinite(scale) && scale > 0 ? scale : 1;
	}

	#runResizeStart(inst: ResizeInstance, ctx: ResizeCtx, e: PointerEvent): boolean {
		const chain = inst.startChain;
		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.start) continue;
			const state = inst.states.get(plugin.key);
			const out = this.#pluginCall(
				inst,
				plugin.key,
				{ phase: 'start', plugin: { key: plugin.key, hook: 'start' }, node: inst.rootNode },
				() => plugin.start!(ctx, state, e),
			);
			if (out === PLUGIN_FAILED) return false;
			if (out === false) return false;
			if (inst.cancelled) return false;
		}
		return true;
	}

	#runResize(inst: ResizeInstance, ctx: ResizeCtx, e: PointerEvent) {
		const chain = inst.resizeChain;
		const info = { phase: 'resize' as const, node: inst.rootNode };

		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.resize) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;

			const state = inst.states.get(plugin.key);
			const patch = this.#pluginCall(
				inst,
				plugin.key,
				{ ...info, plugin: { key: plugin.key, hook: 'resize' } },
				() => plugin.resize!(ctx, state, e),
			);
			if (patch === PLUGIN_FAILED) continue;

			if (patch) {
				if (patch.width !== undefined) inst.proposedWidth = patch.width;
				if (patch.height !== undefined) inst.proposedHeight = patch.height;
			}

			if (inst.cancelled) break;
		}
	}

	#runResizeEnd(inst: ResizeInstance, ctx: ResizeCtx, e: PointerEvent, reason: ResizeEndReason) {
		const chain = inst.endChain;
		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.end) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;
			const state = inst.states.get(plugin.key);
			this.#pluginVoid(
				inst,
				plugin.key,
				{ phase: 'end', plugin: { key: plugin.key, hook: 'end' }, node: inst.rootNode },
				() => plugin.end!(ctx, state, e, reason),
			);
		}
	}

	#mergeUserResizePlugins(userPlugins: ResizePlugin[]) {
		assertNamedPluginKeys(userPlugins, this.#dev);
		return mergePluginsByKey(this.#defaultResizePlugins, userPlugins);
	}

	#installResizePlugins(inst: ResizeInstance, userPlugins: ResizePlugin[]) {
		const merged = this.#mergeUserResizePlugins(userPlugins);
		inst.flat = merged;
		inst.byKey = new Map(merged.map((p) => [p.key, p]));
		inst.rebuildBuckets();
		this.#initResizePlugins(inst);
	}

	#diffResizePlugins(inst: ResizeInstance, userPlugins: ResizePlugin[]) {
		const width = inst.width;
		const height = inst.height;
		diffPluginFlat(inst, {
			userPlugins,
			merge: (resolved) => this.#mergeUserResizePlugins(resolved),
			bucketsChanged: (prev, next) =>
				pluginsLayoutChanged(prev, next, (plugin) => [
					!!plugin.start,
					!!plugin.resize,
					!!plugin.end,
				]),
			init: (plugin) => this.#initOneResizePlugin(inst, plugin),
			destroy: (plugin) => this.#destroyOneResizePlugin(inst, plugin),
			update: (plugin) => plugin.update?.(inst.resizeCtx, inst.states.get(plugin.key)),
		});
		if (inst.width !== width || inst.height !== height) this.#syncResize(inst);
		inst.effects.flush();
	}

	#syncResize(inst: ResizeInstance) {
		inst.syncDisplaySize();
		applyResize(
			inst.targetNode,
			inst.displaySize,
			{ width: inst.width, height: inst.height },
			inst.anchor,
			inst.applyResize,
		);
	}

	#initResizePlugins(inst: ResizeInstance) {
		for (const plugin of sortByPhase(inst.flat)) this.#initOneResizePlugin(inst, plugin);
		inst.effects.flush();
	}

	#initOneResizePlugin(inst: ResizeInstance, plugin: ResizePlugin) {
		if (!plugin.init) return;
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'init', plugin: { key: plugin.key, hook: 'init' }, node: inst.rootNode },
			() => {
				const state = plugin.init!(inst.resizeCtx);
				if (state !== undefined) inst.states.set(plugin.key, state);
			},
		);
	}

	#destroyOneResizePlugin(inst: ResizeInstance, plugin: ResizePlugin) {
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#pluginVoid(
			inst,
			plugin.key,
			{ phase: 'destroy', plugin: { key: plugin.key, hook: 'destroy' }, node: inst.rootNode },
			() => plugin.destroy!(inst.resizeCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	#destroyResize(inst: ResizeInstance) {
		if (this.#activeResizeSource === inst && inst.isInteracting) {
			inst.cancelled = true;
			this.#endActiveInteraction('cancel');
		}
		for (const plugin of inst.flat) this.#destroyOneResizePlugin(inst, plugin);
		inst.controller.abort();
		inst.effects.clear();
	}
}


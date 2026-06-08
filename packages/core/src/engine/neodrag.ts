import { is_svg_svg_element } from '../utils.ts';
import {
	ActiveSession,
	DragInstance,
	DropInstance,
	type DropCtxHost,
	SessionPrivate,
} from '../instance.ts';
import { numberStub } from '../length-contract.ts';
import type { LengthAdapter } from '../length-runtime.ts';
import { ActiveResizeSession, ResizeInstance } from '../resize-instance.ts';
import { DragHandle, DropHandle, ResizeHandle } from '../handles.ts';
import type { ResizeApplier } from '../apply-resize.ts';
import { createResizeSession, resolveResizeEndReason, sizeFromPointer } from '../resize-session.ts';
import {
	RESIZE_HANDLE_ATTR,
	type ResizeEdge,
	type ResizeEndReason,
	type ResizePluginList,
	type ResizeSession,
} from '../resize/types.ts';
import { resolvePluginList } from '../resolve-plugins.ts';
import { reconcilePluginListUpdate } from '../plugin-reconcile.ts';
import { FullEngine } from './full-engine.ts';
import type { InteractionCoordinatorHost } from './interaction-coordinator.ts';
import type { InteractionCoordinator } from './interaction-coordinator.ts';
import { DEFAULTS } from '../defaults.ts';
import { ensureDraggableEngineExtensions } from '../draggable/engine-extensions.ts';
import { interactionDefaults } from '../interaction-defaults.ts';
import type { TransformApplier } from '../apply-transform.ts';
import { applyDragMarkupIdle } from '../drag-markup.ts';
import { createDomMarkupAdapter, type MarkupAdapter } from '../markup-adapter.ts';
import { DropTargetTracker } from '../drop-targets.ts';
import { createEngineDropHost } from '../engine-drop-host.ts';
import { createDragSession } from '../session.ts';
import {
	interactionPointerId,
	isPointerInput,
	type InteractionInput,
	type PointerInteractionInput,
} from '../interaction-input.ts';
import { installDefaultSensors } from '../sensors/defaults.ts';
import type { Sensor, SensorHost } from '../sensors/types.ts';
import { syncDragSessionPointer, syncResizeSessionPointer } from '../sync-session-pointer.ts';
import { transitionSession } from '../state-machine.ts';
import {
	enableCostProfiling,
	measureCost,
	resetCostProfiling,
	takeCostSnapshot,
	type EngineCostSnapshot,
} from '../engine-profile.ts';
import { resetThresholdSample, type DragThresholdInput } from '../threshold.ts';
import type {
	DragPluginList,
	DragSession,
	DropPluginList,
	EndReason,
	ErrorInfo,
	SessionState,
} from '../types.ts';

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

export interface EngineOptions {
	plugins?: DragPlugin[];
	dropPlugins?: DropPlugin[];
	resizePlugins?: ResizePlugin[];
	delegate?: () => HTMLElement;
	/** Register pointer, keyboard cancel, and keyboard-move sensors. Default: `true`. */
	defaultSensors?: boolean;
	onError?: (error: ErrorInfo) => void;
	dev?: boolean;
	/** Accumulate per-span timings for benchmarks (`getCostProfile`). */
	profile?: boolean;
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
	#sensorCleanups = new Map<symbol, () => void>();
	#pointerDisarm: (() => void) | null = null;
	#sensors: Sensor[] = [];

	#defaultDragPlugins: DragPlugin[];
	#defaultDropPlugins: DropPlugin[];
	#defaultResizePlugins: ResizePlugin[];
	#delegate?: () => HTMLElement;
	#onError?: (error: ErrorInfo) => void;
	#dev: boolean;

	#soleDrop: DropInstance | null = null;
	#dropTracker: DropTargetTracker;

	#idleSession: DragSession | null = null;
	#activeSessionView: DragSession | null = null;
	#idleResizeSession: ResizeSession | null = null;
	#activeResizeSessionView: ResizeSession | null = null;

	readonly #dropHost: DropCtxHost = {
		pointerX: 0,
		pointerY: 0,
		lastInput: null,
		session: null!,
	};

	readonly #engine: FullEngine;
	readonly #coordinator: InteractionCoordinator;

	readonly #sensorHost: SensorHost;
	readonly #profileEnabled: boolean;

	constructor(options: EngineOptions = {}) {
		if (options.plugins === undefined) ensureDraggableEngineExtensions();
		this.#defaultDragPlugins =
			options.plugins !== undefined ? options.plugins : [...interactionDefaults.drag()];
		this.#defaultDropPlugins =
			options.dropPlugins !== undefined ? options.dropPlugins : [...interactionDefaults.drop()];
		this.#defaultResizePlugins =
			options.resizePlugins !== undefined
				? options.resizePlugins
				: [...interactionDefaults.resize()];
		this.#delegate = options.delegate;
		this.#onError = options.onError ?? DEFAULTS.onError;
		this.#dev = options.dev ?? DEV;

		let coordinator!: InteractionCoordinator;
		const endActive = (reason: EndReason) => coordinator.endActiveInteraction(reason);

		this.#engine = new FullEngine({
			engine: this,
			onError: this.#onError,
			dev: () => this.#dev,
			defaultDragPlugins: () => this.#defaultDragPlugins,
			defaultDropPlugins: () => this.#defaultDropPlugins,
			defaultResizePlugins: () => this.#defaultResizePlugins,
			endActiveInteraction: endActive,
			getActiveSource: () => this.#activeSource,
			getActiveResizeSource: () => this.#activeResizeSource,
			finishResize: (reason, input) => this.#finishResize(reason, input),
		});

		coordinator = this.#engine.createCoordinator(this.#createCoordinatorHost(this));
		this.#coordinator = coordinator;

		this.#dropTracker = new DropTargetTracker(
			createEngineDropHost({
				getDropCount: () => this.#dropCount,
				getSoleDrop: () => this.#soleDrop,
				getActive: () => this.#active,
				getActiveSource: () => this.#activeSource,
				getDropTargets: () => this.#dropTargets,
				runDropHook: (inst, hook, input) => this.#engine.drop.runHook(inst, hook, input),
				measure: (span, fn) => {
					measureCost(this, span, fn);
				},
			}),
		);

		this.#profileEnabled = options.profile === true;
		if (this.#profileEnabled) enableCostProfiling(this);

		if (options.defaultSensors !== false) {
			installDefaultSensors((sensor) => this.registerSensor(sensor));
		}

		this.#sensorHost = {
			getDelegate: () => this.#resolveDelegateTarget(),
			setPointerDisarm: (disarm) => {
				this.#pointerDisarm = disarm;
			},
			onInteractionStart: (input) => this.#coordinator.onStart(input),
			onInteractionMove: (input) => this.#coordinator.onMove(input),
			onInteractionEnd: (input) => this.#coordinator.onEnd(input),
			cancelActive: (reason) => this.#coordinator.cancelSession(reason),
		};
	}

	#createCoordinatorHost(engine: Neodrag): InteractionCoordinatorHost {
		return {
			engine,
			extensions: engine.#engine.extensions,
			drag: engine.#engine.drag,
			drop: engine.#engine.drop,
			getActive: () => engine.#active,
			setActive: (session) => {
				engine.#active = session;
			},
			getActiveSource: () => engine.#activeSource,
			setActiveSource: (source) => {
				engine.#activeSource = source;
			},
			getActivePointerId: () => engine.#activePointerId,
			setActivePointerId: (id) => {
				engine.#activePointerId = id;
			},
			getActiveSessionView: () => engine.#activeSessionView,
			setActiveSessionView: (view) => {
				engine.#activeSessionView = view;
			},
			getDropHost: () => engine.#dropHost,
			getDropTracker: () => engine.#dropTracker,
			getDropCount: () => engine.#dropCount,
			hasDragSource: (node) => engine.#dragSources.has(node),
			getDragSource: (node) => engine.#dragSources.get(node),
			ensureIdleSession: () => engine.#ensureIdleSession(),
			disarmPointer: () => engine.#pointerDisarm?.(),
			isDragInteracting: () => engine.#activeSource?.isInteracting ?? false,
			isResizeInteracting: () => engine.#activeResizeSource?.isInteracting ?? false,
			tryBeginResize: (input) => engine.#tryBeginResize(input),
			onResizeMove: (input) => engine.#onResizeInteractionMove(input),
			onResizePointerEnd: (input) => engine.#onResizePointerEnd(input),
			finishResize: (reason, input) => engine.#finishResize(reason, input),
			getResizeLastInput: () => engine.#activeResizeSource?.lastInput ?? null,
			hasActiveResizeSession: () => engine.#activeResize !== null,
			clearResizeSession: () => {
				const inst = engine.#activeResizeSource;
				if (inst) engine.#clearResizeSessionState(inst);
			},
		};
	}

	#tryBeginResize(input: PointerInteractionInput): boolean {
		const e = input.native;
		const resizeHit = this.#findResizeTarget(e);
		if (!resizeHit) return false;
		const { inst, anchor, handleNode } = resizeHit;
		inst.cachedRootNodeRect = inst.rootNode.getBoundingClientRect();
		inst.cachedTargetRect = inst.targetNode.getBoundingClientRect();
		inst.inverseScale = this.#engine.resize.inverseScale(inst);
		inst.loadSizeFromNode();
		inst.initialWidth = inst.width;
		inst.initialHeight = inst.height;
		inst.initialAuthored = inst.lengthAdapter.cloneAuthored(inst.unitPreserve);
		inst.initialPointerX = input.clientX;
		inst.initialPointerY = input.clientY;
		inst.anchor = anchor;
		inst.handleNode = handleNode;
		inst.resizeOrigin = this.#engine.resize.captureOrigin(inst);
		inst.isInteracting = true;
		inst.cancelled = false;
		syncResizeSessionPointer(input, inst, this.#activeResize);
		this.#beginResizeSession(inst, input);
		return true;
	}

	#onResizePointerEnd(input: InteractionInput) {
		const reason = resolveResizeEndReason(this.#activeResize, this.#activeResizeSource?.cancelled ?? false);
		this.#finishResize(reason, input);
	}

	resetCostProfile() {
		if (this.#profileEnabled) resetCostProfiling(this);
	}

	takeCostProfile(wallMs: number): EngineCostSnapshot | null {
		if (!this.#profileEnabled) return null;
		return takeCostSnapshot(this, wallMs);
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
		options: {
			applyTransform?: TransformApplier;
			length?: LengthAdapter;
			threshold?: DragThresholdInput;
			markup?: MarkupAdapter;
		} = {},
	): DragHandle {
		if (is_svg_svg_element(node)) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. Wrap it in a div or use a child element.',
			);
		}

		this.#initSensors();

		const inst = new DragInstance(node, this.#ensureIdleSession(), options.length ?? numberStub);
		inst.markup = options.markup ?? createDomMarkupAdapter(node);
		inst.applyTransform = options.applyTransform;
		inst.setThreshold(options.threshold);
		inst.lastSlots = plugins;
		inst.slotStaticCache = [];
		const resolved = resolvePluginList(plugins, inst.slotStaticCache, false);
		this.#engine.drag.install(inst, resolved);
		applyDragMarkupIdle(inst.markup, inst.rootNode, inst.dragEndCount);
		this.#engine.drag.syncTransform(inst);
		this.#dragSources.set(node, inst);

		return new DragHandle(this, node, () => {
			this.#engine.drag.destroy(inst);
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
		this.#engine.resize.install(inst, resolved);
		this.#engine.resize.sync(inst);
		this.#resizeSources.set(node, inst);

		return new ResizeHandle(this, node, () => {
			this.#engine.resize.destroy(inst);
			this.#resizeSources.delete(node);
		});
	}

	droppable(
		node: HTMLElement | SVGElement,
		plugins: DropPluginList = [],
		options: { length?: LengthAdapter; markup?: MarkupAdapter } = {},
	): DropHandle {
		this.#initSensors();

		const inst = new DropInstance(node, this.#dropHost, options.length ?? numberStub);
		inst.markup = options.markup ?? createDomMarkupAdapter(node);
		inst.lastSlots = plugins;
		inst.slotStaticCache = [];
		const resolved = resolvePluginList(plugins, inst.slotStaticCache, false);
		this.#engine.drop.install(inst, resolved);
		this.#dropTargets.set(node, inst);
		this.#dropCount++;
		if (this.#dropCount === 1) this.#soleDrop = inst;

		return new DropHandle(this, node, () => {
			this.#engine.drop.destroy(inst);
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
			merge: (resolved) => this.#engine.drop.mergeUser(resolved),
			diff: (target, resolved) => this.#engine.drop.diff(target as DropInstance, resolved),
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
			merge: (resolved) => this.#engine.drag.mergeUser(resolved),
			diff: (target, resolved) => this.#engine.drag.diff(target as DragInstance, resolved),
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
			merge: (resolved) => this.#engine.resize.mergeUser(resolved),
			diff: (target, resolved) => this.#engine.resize.diff(target as ResizeInstance, resolved),
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

	#resolveDelegateTarget(): HTMLElement {
		return (this.#delegate ?? DEFAULTS.delegate)();
	}

	registerSensor(sensor: Sensor): this {
		if (this.#sensors.some((s) => s.key === sensor.key)) {
			const label = sensor.key.description ?? 'sensor';
			throw new Error(`Sensor already registered: ${label}`);
		}
		this.#sensors.push(sensor);
		if (this.#sensorsInitialized) {
			this.#sensorCleanups.set(sensor.key, sensor.setup(this.#sensorHost));
		}
		return this;
	}

	unregisterSensor(key: symbol): this {
		const index = this.#sensors.findIndex((s) => s.key === key);
		if (index === -1) return this;
		this.#sensors.splice(index, 1);
		const cleanup = this.#sensorCleanups.get(key);
		if (cleanup) {
			cleanup();
			this.#sensorCleanups.delete(key);
		}
		return this;
	}

	getSensors(): readonly Sensor[] {
		return this.#sensors;
	}

	#initSensors() {
		if (this.#sensorsInitialized) return;
		for (const sensor of this.#sensors) {
			if (this.#sensorCleanups.has(sensor.key)) continue;
			this.#sensorCleanups.set(sensor.key, sensor.setup(this.#sensorHost));
		}
		this.#sensorsInitialized = true;
	}

	#teardownSensors() {
		for (const cleanup of this.#sensorCleanups.values()) cleanup();
		this.#sensorCleanups.clear();
		this.#sensorsInitialized = false;
		this.#pointerDisarm = null;
	}

	dispose() {
		this.#pointerDisarm?.();
		this.#coordinator.endActiveInteraction('cancel');
		for (const inst of this.#dragSources.values()) this.#engine.drag.destroy(inst);
		for (const inst of this.#dropTargets.values()) this.#engine.drop.destroy(inst);
		for (const inst of this.#resizeSources.values()) this.#engine.resize.destroy(inst);
		this.#dragSources.clear();
		this.#dropTargets.clear();
		this.#resizeSources.clear();
		this.#dropCount = 0;
		this.#soleDrop = null;
		this.#teardownSensors();
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

	#beginResizeSession(source: ResizeInstance, input: InteractionInput) {
		const rect = source.rootNode.getBoundingClientRect();
		this.#activeResize = {
			state: transitionSession('idle', { type: 'pointerdown' }),
			sourceNode: source.rootNode,
			sourceRect: rect,
			anchor: source.anchor,
			pointerX: input.clientX,
			pointerY: input.clientY,
			deltaWidth: 0,
			deltaHeight: 0,
			width: source.width,
			height: source.height,
			data: undefined,
			pointerId: interactionPointerId(input),
			startedAt: Date.now(),
		};
		this.#activeResizeSource = source;
		this.#activePointerId = interactionPointerId(input);

		this.#activeResizeSessionView = createResizeSession(this.#activeResize);
		source.bindSession(this.#activeResizeSessionView, () => {
			if (this.#activeResize) {
				this.#activeResize.state = transitionSession(this.#activeResize.state, { type: 'cancel' });
			}
		});
	}

	#onResizeInteractionMove(input: PointerInteractionInput) {
		const e = input.native;
		const inst = this.#activeResizeSource;
		if (!inst?.isInteracting) return;

		syncResizeSessionPointer(input, inst, this.#activeResize);
		if (this.#activeResize) {
			this.#activeResize.pointerX = input.clientX;
			this.#activeResize.pointerY = input.clientY;
		}

		if (!inst.isResizing) {
			const startOk = this.#engine.resize.runStart(inst, inst.resizeCtx, input);
			inst.effects.flush();
			if (!startOk) {
				if (this.#activeResize) {
					this.#activeResize.state = transitionSession(this.#activeResize.state, {
						type: 'start-abort',
					});
				}
				return;
			}
			if (inst.cancelled) return;

			inst.isResizing = true;
			if (this.#activeResize) {
				this.#activeResize.state = transitionSession(this.#activeResize.state, {
					type: 'threshold-passed',
				});
			}

			const captureNode = inst.handleNode ?? (inst.rootNode as HTMLElement);
			inst.pointerCapturedId = input.pointer.pointerId;
			try {
				captureNode.setPointerCapture(input.pointer.pointerId);
			} catch {
				this.#cleanupResizePointer(input.pointer.pointerId);
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
			input.clientX,
			input.clientY,
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

		this.#engine.resize.runResize(inst, inst.resizeCtx, input);
		inst.width += inst.proposedWidth;
		inst.height += inst.proposedHeight;
		inst.proposedWidth = 0;
		inst.proposedHeight = 0;

		if (this.#activeResize) {
			this.#activeResize.width = inst.width;
			this.#activeResize.height = inst.height;
		}

		inst.effects.flush();
		this.#engine.resize.sync(inst);
	}

	#finishResize(reason: ResizeEndReason, input: InteractionInput) {
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

		this.#engine.resize.runEnd(inst, inst.resizeCtx, input, reason);
		inst.effects.flush();

		if (reason === 'cancel') {
			this.#engine.resize.restoreLayoutOnCancel(inst);
		} else {
			this.#engine.resize.notifyLayoutCommit(inst);
		}

		inst.isInteracting = false;
		inst.isResizing = false;
		inst.cancelled = false;
		inst.pointerCapturedId = null;
		inst.handleNode = null;
		inst.resizeOrigin = null;

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
		const last = inst.lastInput;
		if (last) {
			this.#finishResize('cancel', last);
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

}

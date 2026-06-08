import { is_svg_svg_element } from '../utils.ts';
import { ActiveSession, DragInstance, type DropCtxHost, SessionPrivate } from '../instance.ts';
import { numberStub } from '../length-contract.ts';
import type { LengthAdapter } from '../length-runtime.ts';
import { DragHandle } from '../handles.ts';
import { resolvePluginList } from '../resolve-plugins.ts';
import { reconcilePluginListUpdate } from '../plugin-reconcile.ts';
import { DragEngine } from './drag-engine.ts';
import type { InteractionCoordinatorHost } from './interaction-coordinator.ts';
import type { InteractionCoordinator } from './interaction-coordinator.ts';
import { NoopDropTargetTracker } from './noop-drop-tracker.ts';
import { DEFAULTS } from '../defaults.ts';
import { interactionDefaults } from '../interaction-defaults.ts';
import type { TransformApplier } from '../apply-transform.ts';
import { applyDragMarkupIdle } from '../drag-markup.ts';
import { createDomMarkupAdapter, type MarkupAdapter } from '../markup-adapter.ts';
import { createDragSession } from '../session.ts';
import { isPointerInput, type InteractionInput } from '../interaction-input.ts';
import { PointerSensor } from '../sensors/pointer-sensor.ts';
import type { Sensor, SensorHost } from '../sensors/types.ts';
import { syncDragSessionPointer } from '../sync-session-pointer.ts';
import { transitionSession } from '../state-machine.ts';
import {
	enableCostProfiling,
	measureCost,
	resetCostProfiling,
	takeCostSnapshot,
	type EngineCostSnapshot,
} from '../engine-profile.ts';
import type { DragThresholdInput } from '../threshold.ts';
import type {
	DragPlugin,
	DragPluginList,
	DragSession,
	EndReason,
	ErrorInfo,
	SessionState,
} from '../types.ts';

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

export interface DragEngineOptions {
	plugins?: DragPlugin[];
	delegate?: () => HTMLElement;
	/** Register pointer, keyboard cancel, and keyboard-move sensors. Default: `true`. */
	defaultSensors?: boolean;
	onError?: (error: ErrorInfo) => void;
	dev?: boolean;
	/** Accumulate per-span timings for benchmarks (`getCostProfile`). */
	profile?: boolean;
}

export interface DragNeodragDebugSnapshot {
	dragTargets: number;
	session: {
		state: SessionState;
		pointerX: number;
		pointerY: number;
		deltaX: number;
		deltaY: number;
		overTargets: number;
	} | null;
}

export class DragNeodrag {
	static #sharedInstance: DragNeodrag | null = null;

	static get shared(): DragNeodrag {
		return (DragNeodrag.#sharedInstance ??= new DragNeodrag({ dev: false }));
	}
	#dragSources = new Map<HTMLElement | SVGElement, DragInstance>();
	#dropCount = 0;

	#active: ActiveSession | null = null;
	#activeSource: DragInstance | null = null;
	#activePointerId: number | null = null;

	#sensorsInitialized = false;
	#sensorCleanups = new Map<symbol, () => void>();
	#pointerDisarm: (() => void) | null = null;
	#sensors: Sensor[] = [];

	#defaultDragPlugins: DragPlugin[];
	#delegate?: () => HTMLElement;
	#onError?: (error: ErrorInfo) => void;
	#dev: boolean;

	#dropTracker = new NoopDropTargetTracker();

	#idleSession: DragSession | null = null;
	#activeSessionView: DragSession | null = null;

	readonly #dropHost: DropCtxHost = {
		pointerX: 0,
		pointerY: 0,
		lastInput: null,
		session: null!,
	};

	readonly #engine: DragEngine;
	readonly #coordinator: InteractionCoordinator;

	readonly #sensorHost: SensorHost;
	readonly #profileEnabled: boolean;

	constructor(options: DragEngineOptions = {}) {
		this.#defaultDragPlugins =
			options.plugins !== undefined ? options.plugins : [...interactionDefaults.drag()];
		this.#delegate = options.delegate;
		this.#onError = options.onError ?? DEFAULTS.onError;
		this.#dev = options.dev ?? DEV;

		let coordinator!: InteractionCoordinator;
		const endActive = (reason: EndReason) => coordinator.endActiveInteraction(reason);

		this.#engine = new DragEngine({
			engine: this,
			onError: this.#onError,
			dev: () => this.#dev,
			defaultDragPlugins: () => this.#defaultDragPlugins,
			endActiveInteraction: endActive,
			getActiveSource: () => this.#activeSource,
		});

		coordinator = this.#engine.createCoordinator(this.#createCoordinatorHost(this));
		this.#coordinator = coordinator;

		this.#profileEnabled = options.profile === true;
		if (this.#profileEnabled) enableCostProfiling(this);

		if (options.defaultSensors !== false) {
			this.registerSensor(new PointerSensor());
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

	#createCoordinatorHost(engine: DragNeodrag): InteractionCoordinatorHost {
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
			isResizeInteracting: () => false,
			tryBeginResize: () => false,
			onResizeMove: () => {},
			onResizePointerEnd: () => {},
			finishResize: () => {},
			getResizeLastInput: () => null,
			hasActiveResizeSession: () => false,
			clearResizeSession: () => {},
		};
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

	debugSnapshot(): DragNeodragDebugSnapshot | null {
		if (!this.#dev) return null;
		const active = this.#active;
		return {
			dragTargets: this.#dragSources.size,
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
		this.#dragSources.clear();
		this.#teardownSensors();
	}
}


import { EffectScheduler } from './effects.ts';
import { numberStub, resolveSizeInput, sizeContext } from './length-contract.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { SizeInput } from './length-runtime.ts';
import { phaseChain, pushByPhase } from './phase.ts';
import type { TransformApplier } from './apply-transform.ts';
import { nativePointerEvent } from './interaction-input.ts';
import type { InteractionInput } from './interaction-input.ts';
import type {
	DragCtx,
	DragPlugin,
	DragSession,
	DropCtx,
	DropTargetInfo,
	SessionKey,
	SessionPrivateStore,
} from './types.ts';

export class SessionPrivate implements SessionPrivateStore {
	#store = new Map<symbol, unknown>();

	get<T>(key: SessionKey<T>): T | undefined {
		return this.#store.get(key.id) as T | undefined;
	}

	set<T>(key: SessionKey<T>, value: T): void {
		this.#store.set(key.id, value);
	}

	has(key: SessionKey<unknown>): boolean {
		return this.#store.has(key.id);
	}
}

export interface ActiveSession {
	state: DragSession['state'];
	sourceNode: HTMLElement | SVGElement;
	visualNode: HTMLElement | SVGElement;
	sourceRect: DOMRect;
	visualRect: DOMRect;
	pointerX: number;
	pointerY: number;
	deltaX: number;
	deltaY: number;
	data: unknown;
	overTargets: DropTargetInfo[];
	private: SessionPrivate;
	propagationStopped: boolean;
	pointerId: number;
	startedAt: number;
}

export class DragInstance {
	rootNode: HTMLElement | SVGElement;
	controller = new AbortController();
	effects = new EffectScheduler();

	deltaX = 0;
	deltaY = 0;
	proposedX = 0;
	proposedY = 0;
	offsetX = 0;
	offsetY = 0;
	offsetAuthored: { x: SizeInput; y: SizeInput } | null = null;
	lengthAdapter: LengthAdapter = numberStub;
	initialX = 0;
	initialY = 0;
	inverseScale = 1;
	isDragging = false;
	isInteracting = false;
	cancelled = false;
	lastInput: InteractionInput | null = null;
	lastEvent: PointerEvent | null = null;
	cachedRootNodeRect: DOMRect;
	visualNode: HTMLElement | SVGElement;
	pointerCapturedId: number | null = null;

	readonly #liveDelta: { readonly x: number; readonly y: number };
	readonly #liveProposed: { readonly x: number; readonly y: number };
	readonly #liveOffset: { readonly x: number; readonly y: number };
	readonly #liveInitial: { readonly x: number; readonly y: number };

	flat: DragPlugin[] = [];
	lastSlots: import('./types.ts').DragPluginList | null = null;
	slotStaticCache: (DragPlugin | undefined)[] = [];
	byKey = new Map<symbol, DragPlugin>();
	states = new Map<symbol, unknown>();
	failed = new Set<symbol>();

	dragChain: DragPlugin[] = [];
	startChain: DragPlugin[] = [];
	endChain: DragPlugin[] = [];

	preDrag: DragPlugin[] = [];
	resolveDrag: DragPlugin[] = [];
	postDrag: DragPlugin[] = [];
	preStart: DragPlugin[] = [];
	resolveStart: DragPlugin[] = [];
	postStart: DragPlugin[] = [];
	preEnd: DragPlugin[] = [];
	resolveEnd: DragPlugin[] = [];
	postEnd: DragPlugin[] = [];

	readonly dragCtx: DragCtx;

	#session: DragSession;
	#sessionCancel: (() => void) | null = null;

	isProcessingExternalUpdate = false;
	isUpdating = false;
	updateDepth = 0;
	pendingUpdate: import('./types.ts').DragPluginList | null = null;
	applyTransform?: TransformApplier;

	constructor(
		node: HTMLElement | SVGElement,
		idleSession: DragSession,
		lengthAdapter: LengthAdapter = numberStub,
	) {
		this.rootNode = node;
		this.visualNode = node;
		this.lengthAdapter = lengthAdapter;
		this.cachedRootNodeRect = node.getBoundingClientRect();
		this.#session = idleSession;

		const inst = this;
		this.#liveDelta = {
			get x() {
				return inst.deltaX;
			},
			get y() {
				return inst.deltaY;
			},
		};
		this.#liveProposed = {
			get x() {
				return inst.proposedX;
			},
			get y() {
				return inst.proposedY;
			},
		};
		this.#liveOffset = {
			get x() {
				return inst.offsetX;
			},
			get y() {
				return inst.offsetY;
			},
		};
		this.#liveInitial = {
			get x() {
				return inst.initialX;
			},
			get y() {
				return inst.initialY;
			},
		};
		this.dragCtx = {
			get delta() {
				return inst.#liveDelta;
			},
			get proposed() {
				return inst.#liveProposed;
			},
			get offset() {
				return inst.#liveOffset;
			},
			get offsetPx() {
				return inst.#liveOffset;
			},
			get offsetAuthored() {
				return inst.offsetAuthored ?? undefined;
			},
			get initial() {
				return inst.#liveInitial;
			},
			get isDragging() {
				return inst.isDragging;
			},
			get isInteracting() {
				return inst.isInteracting;
			},
			rootNode: inst.rootNode,
			get lastInput() {
				return inst.lastInput;
			},
			get lastEvent() {
				return nativePointerEvent(inst.lastInput);
			},
			get cachedRootNodeRect() {
				return inst.cachedRootNodeRect;
			},
			get session() {
				return inst.#session;
			},
			get length() {
				return inst.lengthAdapter;
			},
			effect(fn) {
				inst.effects.schedule(fn);
			},
			cancel() {
				inst.cancelled = true;
				inst.#sessionCancel?.();
			},
			setForcedPosition(x, y) {
				const wCtx = sizeContext(inst.rootNode, 'width');
				const hCtx = sizeContext(inst.rootNode, 'height');
				inst.offsetX = resolveSizeInput(inst.lengthAdapter, x, wCtx, inst.offsetX);
				inst.offsetY = resolveSizeInput(inst.lengthAdapter, y, hCtx, inst.offsetY);
				if (typeof x === 'string' || typeof y === 'string') {
					inst.offsetAuthored = {
						x: typeof x === 'string' ? x : inst.offsetX,
						y: typeof y === 'string' ? y : inst.offsetY,
					};
				} else {
					inst.offsetAuthored = null;
				}
			},
			setVisual(node) {
				inst.setVisual(node);
			},
		};
	}

	bindSession(session: DragSession, onCancel?: () => void) {
		this.#session = session;
		this.#sessionCancel = onCancel ?? null;
	}

	setVisual(node: HTMLElement | SVGElement) {
		if (
			this.pointerCapturedId !== null &&
			this.visualNode.hasPointerCapture(this.pointerCapturedId)
		) {
			this.visualNode.releasePointerCapture(this.pointerCapturedId);
			node.setPointerCapture(this.pointerCapturedId);
		}
		this.visualNode = node;
	}

	rebuildBuckets() {
		this.preDrag = [];
		this.resolveDrag = [];
		this.postDrag = [];
		this.preStart = [];
		this.resolveStart = [];
		this.postStart = [];
		this.preEnd = [];
		this.resolveEnd = [];
		this.postEnd = [];
		this.dragChain = [];
		this.startChain = [];
		this.endChain = [];

		for (const plugin of this.flat) {
			if (this.failed.has(plugin.key)) continue;
			const phase = plugin.phase ?? 'resolve';
			if (plugin.start) this.#pushPhase(this.preStart, this.resolveStart, this.postStart, phase, plugin);
			if (plugin.drag) this.#pushPhase(this.preDrag, this.resolveDrag, this.postDrag, phase, plugin);
			if (plugin.end) this.#pushPhase(this.preEnd, this.resolveEnd, this.postEnd, phase, plugin);
		}

		this.startChain = phaseChain(this.preStart, this.resolveStart, this.postStart);
		this.dragChain = phaseChain(this.preDrag, this.resolveDrag, this.postDrag);
		this.endChain = phaseChain(this.preEnd, this.resolveEnd, this.postEnd);
	}

	#pushPhase(
		pre: DragPlugin[],
		resolve: DragPlugin[],
		post: DragPlugin[],
		phase: NonNullable<DragPlugin['phase']>,
		plugin: DragPlugin,
	) {
		pushByPhase(pre, resolve, post, phase, plugin);
	}
}

export type DropCtxHost = {
	pointerX: number;
	pointerY: number;
	lastInput: InteractionInput | null;
	lastEvent: PointerEvent | null;
	session: DragSession;
};

export class DropInstance {
	rootNode: HTMLElement | SVGElement;
	controller = new AbortController();
	effects = new EffectScheduler();
	cachedRootNodeRect: DOMRect;

	readonly dropCtx: DropCtx;
	#host: DropCtxHost;

	flat: import('./types.ts').DropPlugin[] = [];
	lastSlots: import('./types.ts').DropPluginList | null = null;
	slotStaticCache: (import('./types.ts').DropPlugin | undefined)[] = [];
	byKey = new Map<symbol, import('./types.ts').DropPlugin>();
	states = new Map<symbol, unknown>();
	failed = new Set<symbol>();
	isOver = false;
	hitExpandPx: { top: number; right: number; bottom: number; left: number } | null = null;
	lengthAdapter: LengthAdapter = numberStub;

	isProcessingExternalUpdate = false;
	isUpdating = false;
	updateDepth = 0;
	pendingUpdate: import('./types.ts').DropPluginList | null = null;

	enterChain: import('./types.ts').DropPlugin[] = [];
	overChain: import('./types.ts').DropPlugin[] = [];
	leaveChain: import('./types.ts').DropPlugin[] = [];
	dropChain: import('./types.ts').DropPlugin[] = [];

	preEnter: import('./types.ts').DropPlugin[] = [];
	resolveEnter: import('./types.ts').DropPlugin[] = [];
	postEnter: import('./types.ts').DropPlugin[] = [];
	preOver: import('./types.ts').DropPlugin[] = [];
	resolveOver: import('./types.ts').DropPlugin[] = [];
	postOver: import('./types.ts').DropPlugin[] = [];
	preLeave: import('./types.ts').DropPlugin[] = [];
	resolveLeave: import('./types.ts').DropPlugin[] = [];
	postLeave: import('./types.ts').DropPlugin[] = [];
	preDrop: import('./types.ts').DropPlugin[] = [];
	resolveDrop: import('./types.ts').DropPlugin[] = [];
	postDrop: import('./types.ts').DropPlugin[] = [];

	constructor(
		node: HTMLElement | SVGElement,
		host: DropCtxHost,
		lengthAdapter: LengthAdapter = numberStub,
	) {
		this.rootNode = node;
		this.lengthAdapter = lengthAdapter;
		this.cachedRootNodeRect = node.getBoundingClientRect();
		this.#host = host;

		const inst = this;
		this.dropCtx = {
			get pointer() {
				return { x: inst.#host.pointerX, y: inst.#host.pointerY };
			},
			get session() {
				return inst.#host.session;
			},
			rootNode: inst.rootNode,
			get cachedRootNodeRect() {
				return inst.cachedRootNodeRect;
			},
			get lastInput() {
				return inst.#host.lastInput;
			},
			get lastEvent() {
				return inst.#host.lastEvent;
			},
			get isOver() {
				return inst.isOver;
			},
			get length() {
				return inst.lengthAdapter;
			},
			effect(fn) {
				inst.effects.schedule(fn);
			},
		};
	}

	rebuildBuckets() {
		this.preEnter = [];
		this.resolveEnter = [];
		this.postEnter = [];
		this.preOver = [];
		this.resolveOver = [];
		this.postOver = [];
		this.preLeave = [];
		this.resolveLeave = [];
		this.postLeave = [];
		this.preDrop = [];
		this.resolveDrop = [];
		this.postDrop = [];
		this.enterChain = [];
		this.overChain = [];
		this.leaveChain = [];
		this.dropChain = [];

		for (const plugin of this.flat) {
			if (this.failed.has(plugin.key)) continue;
			const phase = plugin.phase ?? 'resolve';
			if (plugin.enter) this.#bucket(phase, 'enter', plugin);
			if (plugin.over) this.#bucket(phase, 'over', plugin);
			if (plugin.leave) this.#bucket(phase, 'leave', plugin);
			if (plugin.drop) this.#bucket(phase, 'drop', plugin);
		}

		this.enterChain = phaseChain(this.preEnter, this.resolveEnter, this.postEnter);
		this.overChain = phaseChain(this.preOver, this.resolveOver, this.postOver);
		this.leaveChain = phaseChain(this.preLeave, this.resolveLeave, this.postLeave);
		this.dropChain = phaseChain(this.preDrop, this.resolveDrop, this.postDrop);
	}

	#bucket(
		phase: NonNullable<import('./types.ts').DropPlugin['phase']>,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		plugin: import('./types.ts').DropPlugin,
	) {
		const pre =
			hook === 'enter'
				? this.preEnter
				: hook === 'over'
					? this.preOver
					: hook === 'leave'
						? this.preLeave
						: this.preDrop;
		const resolve =
			hook === 'enter'
				? this.resolveEnter
				: hook === 'over'
					? this.resolveOver
					: hook === 'leave'
						? this.resolveLeave
						: this.resolveDrop;
		const post =
			hook === 'enter'
				? this.postEnter
				: hook === 'over'
					? this.postOver
					: hook === 'leave'
						? this.postLeave
						: this.postDrop;

		pushByPhase(pre, resolve, post, phase, plugin);
	}
}

import { EffectScheduler } from './effects.ts';
import type {
	DragCtx,
	DragPlugin,
	DragSession,
	DropTargetInfo,
	EndReason,
	SessionKey,
	SessionPrivateStore,
} from './types.ts';
import { Vec2 } from './vec2.ts';

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
	initialX = 0;
	initialY = 0;
	inverseScale = 1;
	isDragging = false;
	isInteracting = false;
	cancelled = false;
	lastEvent: PointerEvent | null = null;
	cachedRootNodeRect: DOMRect;
	visualNode: HTMLElement | SVGElement;
	pointerCapturedId: number | null = null;

	readonly delta = new Vec2();
	readonly proposed = new Vec2();
	readonly offset = new Vec2();
	readonly initial = new Vec2();

	flat: DragPlugin[] = [];
	lastList: DragPlugin[] | null = null;
	byKey = new Map<symbol, DragPlugin>();
	states = new Map<symbol, unknown>();
	failed = new Set<symbol>();

	preDrag: DragPlugin[] = [];
	resolveDrag: DragPlugin[] = [];
	postDrag: DragPlugin[] = [];
	preStart: DragPlugin[] = [];
	resolveStart: DragPlugin[] = [];
	postStart: DragPlugin[] = [];
	preEnd: DragPlugin[] = [];
	resolveEnd: DragPlugin[] = [];
	postEnd: DragPlugin[] = [];

	isProcessingExternalUpdate = false;
	isUpdating = false;
	pendingUpdate: DragPlugin[] | null = null;

	constructor(node: HTMLElement | SVGElement) {
		this.rootNode = node;
		this.visualNode = node;
		this.cachedRootNodeRect = node.getBoundingClientRect();
	}

	syncContext() {
		this.delta.x = this.deltaX;
		this.delta.y = this.deltaY;
		this.proposed.x = this.proposedX;
		this.proposed.y = this.proposedY;
		this.offset.x = this.offsetX;
		this.offset.y = this.offsetY;
		this.initial.x = this.initialX;
		this.initial.y = this.initialY;
	}

	createDragCtx(session: ActiveSession | null, getSession: () => DragSession): DragCtx {
		const inst = this;
		return {
			get delta() {
				return inst.delta;
			},
			get proposed() {
				return inst.proposed;
			},
			get offset() {
				return inst.offset;
			},
			get initial() {
				return inst.initial;
			},
			get isDragging() {
				return inst.isDragging;
			},
			get isInteracting() {
				return inst.isInteracting;
			},
			rootNode: inst.rootNode,
			get lastEvent() {
				return inst.lastEvent;
			},
			get cachedRootNodeRect() {
				return inst.cachedRootNodeRect;
			},
			get session() {
				return getSession();
			},
			effect(fn) {
				inst.effects.schedule(fn);
			},
			cancel() {
				inst.cancelled = true;
				session?.cancel();
			},
			setForcedPosition(x, y) {
				inst.offsetX = x;
				inst.offsetY = y;
				inst.syncContext();
			},
		};
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

		for (const plugin of this.flat) {
			if (this.failed.has(plugin.key)) continue;
			const phase = plugin.phase ?? 'resolve';
			if (plugin.start) this.#pushPhase(this.preStart, this.resolveStart, this.postStart, phase, plugin);
			if (plugin.drag) this.#pushPhase(this.preDrag, this.resolveDrag, this.postDrag, phase, plugin);
			if (plugin.end) this.#pushPhase(this.preEnd, this.resolveEnd, this.postEnd, phase, plugin);
		}
	}

	#pushPhase(
		pre: DragPlugin[],
		resolve: DragPlugin[],
		post: DragPlugin[],
		phase: NonNullable<DragPlugin['phase']>,
		plugin: DragPlugin,
	) {
		if (phase === 'pre') pre.push(plugin);
		else if (phase === 'post') post.push(plugin);
		else resolve.push(plugin);
	}
}

export class DropInstance {
	rootNode: HTMLElement | SVGElement;
	controller = new AbortController();
	effects = new EffectScheduler();
	cachedRootNodeRect: DOMRect;

	flat: import('./types.ts').DropPlugin[] = [];
	lastList: import('./types.ts').DropPlugin[] | null = null;
	byKey = new Map<symbol, import('./types.ts').DropPlugin>();
	states = new Map<symbol, unknown>();
	failed = new Set<symbol>();
	isOver = false;

	constructor(node: HTMLElement | SVGElement) {
		this.rootNode = node;
		this.cachedRootNodeRect = node.getBoundingClientRect();
	}
}

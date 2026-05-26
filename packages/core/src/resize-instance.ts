import { EffectScheduler } from './effects.ts';
import { phaseChain, pushByPhase } from './phase.ts';
import type { ResizeApplier } from './apply-resize.ts';
import { numberStub, resolveSizeInput, sizeContext } from './length-contract.ts';
import type { AuthoredSizePair, LengthAdapter } from './length-runtime.ts';
import type { SizeInput } from './length-runtime.ts';
import { readBoxSizePx } from './length/utils.ts';
import { nativePointerEvent } from './interaction-input.ts';
import type { InteractionInput } from './interaction-input.ts';
import type { ResizeCtx, ResizePlugin, ResizeSession } from './resize/types.ts';

export { readBoxSizePx as readSizePx };

export interface ActiveResizeSession {
	state: ResizeSession['state'];
	sourceNode: HTMLElement | SVGElement;
	sourceRect: DOMRect;
	anchor: ResizeSession['anchor'];
	pointerX: number;
	pointerY: number;
	deltaWidth: number;
	deltaHeight: number;
	width: number;
	height: number;
	data: unknown;
	pointerId: number;
	startedAt: number;
}

export class ResizeInstance {
	rootNode: HTMLElement | SVGElement;
	targetNode: HTMLElement | SVGElement;
	handleNode: HTMLElement | null = null;
	controller = new AbortController();
	effects = new EffectScheduler();

	lengthAdapter: LengthAdapter = numberStub;

	deltaWidth = 0;
	deltaHeight = 0;
	proposedWidth = 0;
	proposedHeight = 0;
	width = 0;
	height = 0;
	initialWidth = 0;
	initialHeight = 0;
	displaySize: AuthoredSizePair = { width: '0px', height: '0px' };
	unitPreserve: AuthoredSizePair = { width: '0px', height: '0px' };
	initialAuthored: AuthoredSizePair = { width: '0px', height: '0px' };
	initialPointerX = 0;
	initialPointerY = 0;
	anchor: ResizeSession['anchor'] = 'se';
	inverseScale = 1;
	isResizing = false;
	isInteracting = false;
	cancelled = false;
	lastInput: InteractionInput | null = null;
	cachedRootNodeRect: DOMRect;
	cachedTargetRect: DOMRect;
	pointerCapturedId: number | null = null;

	readonly #liveDelta: { readonly width: number; readonly height: number };
	readonly #liveProposed: { readonly width: number; readonly height: number };
	readonly #liveSize: { readonly width: string; readonly height: string };
	readonly #liveSizePx: { readonly width: number; readonly height: number };
	readonly #liveInitial: { readonly width: string; readonly height: string };
	readonly #liveInitialPx: { readonly width: number; readonly height: number };

	flat: ResizePlugin[] = [];
	lastSlots: import('./resize/types.ts').ResizePluginList | null = null;
	slotStaticCache: (ResizePlugin | undefined)[] = [];
	byKey = new Map<symbol, ResizePlugin>();
	states = new Map<symbol, unknown>();
	failed = new Set<symbol>();

	resizeChain: ResizePlugin[] = [];
	startChain: ResizePlugin[] = [];
	endChain: ResizePlugin[] = [];

	preResize: ResizePlugin[] = [];
	resolveResize: ResizePlugin[] = [];
	postResize: ResizePlugin[] = [];
	preStart: ResizePlugin[] = [];
	resolveStart: ResizePlugin[] = [];
	postStart: ResizePlugin[] = [];
	preEnd: ResizePlugin[] = [];
	resolveEnd: ResizePlugin[] = [];
	postEnd: ResizePlugin[] = [];

	readonly resizeCtx: ResizeCtx;

	#session: ResizeSession;
	#sessionCancel: (() => void) | null = null;

	isProcessingExternalUpdate = false;
	isUpdating = false;
	updateDepth = 0;
	pendingUpdate: import('./resize/types.ts').ResizePluginList | null = null;
	applyResize?: ResizeApplier;

	constructor(
		node: HTMLElement | SVGElement,
		idleSession: ResizeSession,
		lengthAdapter: LengthAdapter = numberStub,
	) {
		this.rootNode = node;
		this.targetNode = node;
		this.lengthAdapter = lengthAdapter;
		this.cachedRootNodeRect = node.getBoundingClientRect();
		this.cachedTargetRect = this.cachedRootNodeRect;
		this.#session = idleSession;
		this.loadSizeFromNode();

		const inst = this;
		this.#liveDelta = {
			get width() {
				return inst.deltaWidth;
			},
			get height() {
				return inst.deltaHeight;
			},
		};
		this.#liveProposed = {
			get width() {
				return inst.proposedWidth;
			},
			get height() {
				return inst.proposedHeight;
			},
		};
		this.#liveSize = {
			get width() {
				return inst.displaySize.width;
			},
			get height() {
				return inst.displaySize.height;
			},
		};
		this.#liveSizePx = {
			get width() {
				return inst.width;
			},
			get height() {
				return inst.height;
			},
		};
		this.#liveInitial = {
			get width() {
				return inst.initialAuthored.width;
			},
			get height() {
				return inst.initialAuthored.height;
			},
		};
		this.#liveInitialPx = {
			get width() {
				return inst.initialWidth;
			},
			get height() {
				return inst.initialHeight;
			},
		};
		this.resizeCtx = {
			get delta() {
				return inst.#liveDelta;
			},
			get proposed() {
				return inst.#liveProposed;
			},
			get size() {
				return inst.#liveSize;
			},
			get sizePx() {
				return inst.#liveSizePx;
			},
			get initial() {
				return inst.#liveInitial;
			},
			get initialPx() {
				return inst.#liveInitialPx;
			},
			get length() {
				return inst.lengthAdapter;
			},
			get anchor() {
				return inst.anchor;
			},
			get isResizing() {
				return inst.isResizing;
			},
			get isInteracting() {
				return inst.isInteracting;
			},
			rootNode: inst.rootNode,
			get targetNode() {
				return inst.targetNode;
			},
			get handleNode() {
				return inst.handleNode;
			},
			get lastInput() {
				return inst.lastInput;
			},
			get lastEvent() {
				return nativePointerEvent(inst.lastInput);
			},
			get cachedRootNodeRect() {
				return inst.cachedRootNodeRect;
			},
			get cachedTargetRect() {
				return inst.cachedTargetRect;
			},
			get session() {
				return inst.#session;
			},
			effect(fn) {
				inst.effects.schedule(fn);
			},
			cancel() {
				inst.cancelled = true;
				inst.#sessionCancel?.();
			},
			setForcedSize(width, height) {
				const wCtx = sizeContext(inst.targetNode, 'width');
				const hCtx = sizeContext(inst.targetNode, 'height');
				inst.width = resolveSizeInput(inst.lengthAdapter, width, wCtx, inst.width);
				inst.height = resolveSizeInput(inst.lengthAdapter, height, hCtx, inst.height);
			},
		};
	}

	syncDisplaySize() {
		this.displaySize = this.lengthAdapter.commitAuthored(
			{ width: this.width, height: this.height },
			this.unitPreserve,
			this.targetNode,
		);
	}

	loadSizeFromNode() {
		const px = readBoxSizePx(this.targetNode);
		this.width = px.width;
		this.height = px.height;
		this.unitPreserve = this.lengthAdapter.readAuthoredPair(this.targetNode);
		this.displaySize = this.lengthAdapter.cloneAuthored(this.unitPreserve);
	}

	bindSession(session: ResizeSession, onCancel?: () => void) {
		this.#session = session;
		this.#sessionCancel = onCancel ?? null;
	}

	rebuildBuckets() {
		this.preResize = [];
		this.resolveResize = [];
		this.postResize = [];
		this.preStart = [];
		this.resolveStart = [];
		this.postStart = [];
		this.preEnd = [];
		this.resolveEnd = [];
		this.postEnd = [];
		this.resizeChain = [];
		this.startChain = [];
		this.endChain = [];

		for (const plugin of this.flat) {
			if (this.failed.has(plugin.key)) continue;
			const phase = plugin.phase ?? 'resolve';
			if (plugin.start) this.#pushPhase(this.preStart, this.resolveStart, this.postStart, phase, plugin);
			if (plugin.resize)
				this.#pushPhase(this.preResize, this.resolveResize, this.postResize, phase, plugin);
			if (plugin.end) this.#pushPhase(this.preEnd, this.resolveEnd, this.postEnd, phase, plugin);
		}

		this.startChain = phaseChain(this.preStart, this.resolveStart, this.postStart);
		this.resizeChain = phaseChain(this.preResize, this.resolveResize, this.postResize);
		this.endChain = phaseChain(this.preEnd, this.resolveEnd, this.postEnd);
	}

	#pushPhase(
		pre: ResizePlugin[],
		resolve: ResizePlugin[],
		post: ResizePlugin[],
		phase: NonNullable<ResizePlugin['phase']>,
		plugin: ResizePlugin,
	) {
		pushByPhase(pre, resolve, post, phase, plugin);
	}
}

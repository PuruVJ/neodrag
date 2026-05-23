import type { Compartment, Plugin, PluginContext, PluginResolver } from './plugins.ts';
import { Vec2 } from './vec2.ts';

export class DragInstance implements PluginContext {
	readonly rootNode: HTMLElement | SVGElement;
	readonly sourceElement: HTMLElement | SVGElement;

	plugins: Plugin[] = [];
	controller = new AbortController();
	resolver: PluginResolver | undefined;
	pluginStates = new Map<string, unknown>();
	failedPlugins = new Set<string>();
	dragstartPrevented = false;
	currentDragHookCancelled = false;
	pointerCapturedId: number | null = null;
	inverseScale = 1;
	paintEffects = new Set<() => void>();
	immediateEffects = new Set<() => void>();
	compartmentMap = new Map<Compartment, Plugin | null | undefined>();
	pendingCompartments = new Set<Compartment>();
	isFlushingCompartments = false;
	isProcessingExternalUpdate = false;

	proposedX: number | null = 0;
	proposedY: number | null = 0;
	deltaX = 0;
	deltaY = 0;
	offsetX = 0;
	offsetY = 0;
	initialX = 0;
	initialY = 0;

	readonly delta = new Vec2();
	readonly offset = new Vec2();
	readonly initial = new Vec2();
	readonly proposed = { x: null as number | null, y: null as number | null };

	isDragging = false;
	isInteracting = false;
	lastEvent: PointerEvent | null = null;
	cachedRootNodeRect: DOMRect;
	currentlyDraggedNode: HTMLElement | SVGElement;
	dragTarget: HTMLElement | SVGElement | null = null;
	proxyIntent = false;

	readonly effect = {
		immediate: (func: () => void) => {
			this.immediateEffects.add(func);
		},
		paint: (func: () => void) => {
			this.paintEffects.add(func);
		},
	};

	readonly proxy: PluginContext['proxy'];

	constructor(node: HTMLElement | SVGElement, resolver?: PluginResolver) {
		this.rootNode = node;
		this.sourceElement = node;
		this.resolver = resolver;
		this.cachedRootNodeRect = node.getBoundingClientRect();
		this.currentlyDraggedNode = node;

		const inst = this;
		this.proxy = {
			get isActive() {
				return inst.dragTarget !== null;
			},
			get hasIntent() {
				return inst.proxyIntent;
			},
			set(proxyNode: HTMLElement | SVGElement | null) {
				if (proxyNode === null) {
					inst.dragTarget = null;
					inst.setCurrentlyDraggedNode(inst.rootNode);
				} else {
					inst.dragTarget = proxyNode;
					inst.setCurrentlyDraggedNode(proxyNode);
				}
			},
			end() {
				if (inst.dragTarget) {
					if (document.body.contains(inst.dragTarget)) {
						document.body.removeChild(inst.dragTarget);
					}
					inst.offsetX = 0;
					inst.offsetY = 0;
					inst.dragTarget = null;
					inst.setCurrentlyDraggedNode(inst.rootNode);
				}
			},
			registerIntent() {
				inst.proxyIntent = true;
			},
		};
	}

	get visualElement() {
		return this.dragTarget || this.rootNode;
	}

	syncCoords() {
		this.delta.x = this.deltaX;
		this.delta.y = this.deltaY;
		this.proposed.x = this.proposedX;
		this.proposed.y = this.proposedY;
		this.offset.x = this.offsetX;
		this.offset.y = this.offsetY;
		this.initial.x = this.initialX;
		this.initial.y = this.initialY;
	}

	propose(x: number | null, y: number | null) {
		this.proposedX = x;
		this.proposedY = y;
		this.syncCoords();
	}

	cancel() {
		this.currentDragHookCancelled = true;
	}

	preventStart() {
		this.dragstartPrevented = true;
	}

	setForcedPosition(x: number, y: number) {
		this.offsetX = x;
		this.offsetY = y;
		this.syncCoords();
	}

	setCurrentlyDraggedNode(val: HTMLElement | SVGElement) {
		if (
			this.pointerCapturedId !== null &&
			this.currentlyDraggedNode.hasPointerCapture(this.pointerCapturedId)
		) {
			this.currentlyDraggedNode.releasePointerCapture(this.pointerCapturedId);
			val.setPointerCapture(this.pointerCapturedId);
		}
		this.currentlyDraggedNode = val;
	}
}

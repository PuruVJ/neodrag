import type { DropContext, DropPlugin } from './types.ts';

export class DropInstance implements DropContext {
	readonly dropNode: HTMLElement | SVGElement;

	plugins: DropPlugin[] = [];
	controller = new AbortController();
	pluginStates = new Map<string, unknown>();
	failedPlugins = new Set<string>();
	accepted = false;
	rejected = false;
	paintEffects = new Set<() => void>();
	immediateEffects = new Set<() => void>();
	isOver = false;
	isActive = false;
	draggedElement: HTMLElement | SVGElement | null = null;
	lastEvent: PointerEvent | null = null;
	data: any = null;

	readonly effect = {
		immediate: (func: () => void) => {
			this.immediateEffects.add(func);
		},
		paint: (func: () => void) => {
			this.paintEffects.add(func);
		},
	};

	constructor(node: HTMLElement | SVGElement) {
		this.dropNode = node;
	}

	accept() {
		this.accepted = true;
		this.rejected = false;
	}

	reject() {
		this.rejected = true;
		this.accepted = false;
	}

	setData(value: any) {
		this.data = value;
	}
}

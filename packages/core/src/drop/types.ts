export interface DropPlugin {
	name: string;
	priority?: number;
	liveUpdate?: boolean;
	cancelable?: boolean;
	setup?: (ctx: DropContext) => any;
	onEnter?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	onOver?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	onLeave?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	onDrop?: (ctx: DropContext, state: any, event: PointerEvent) => void | false;
	cleanup?: (ctx: DropContext, state: any) => void;
}

export interface DropContext {
	readonly isOver: boolean;
	readonly isActive: boolean;
	readonly draggedElement: HTMLElement | SVGElement | null;
	readonly dropNode: HTMLElement | SVGElement;
	readonly lastEvent: PointerEvent | null;
	readonly data: any;

	effect: {
		immediate: (func: () => void) => void;
		paint: (func: () => void) => void;
	};

	accept(): void;
	reject(): void;
	setData(data: any): void;
}

export interface DropErrorInfo {
	phase: 'setup' | 'onEnter' | 'onOver' | 'onLeave' | 'onDrop';
	plugin?: {
		name: string;
		hook: string;
	};
	node: HTMLElement | SVGElement;
	error: unknown;
}

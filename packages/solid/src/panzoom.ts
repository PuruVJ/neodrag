import { PanZoom, type PanZoomBindOptions, type PanZoomTransform } from '@neodrag/core/panzoom';
import { createSignal, onCleanup, type Accessor } from 'solid-js';

type RefSetter = (node: HTMLElement | null) => void;

/**
 * Pan/zoom canvas primitive — a thin adapter over the core `PanZoom` binder (which owns the pan
 * drag, wheel/pinch zoom, and the world transform). Put `viewport` on the clipping element's `ref`
 * and `world` on the inner content layer's `ref`; read live `scale()` / `x()` / `y()` / `transform()`.
 */
export function createPanZoom(options: PanZoomBindOptions = {}): {
	viewport: RefSetter;
	world: RefSetter;
	scale: Accessor<number>;
	x: Accessor<number>;
	y: Accessor<number>;
	transform: Accessor<PanZoomTransform>;
	zoomBy: (factor: number, cx?: number, cy?: number) => void;
	zoomTo: (scale: number, cx?: number, cy?: number) => void;
	panBy: (dx: number, dy: number) => void;
	setTransform: (t: Partial<PanZoomTransform>) => void;
	reset: () => void;
} {
	const [transform, set_transform] = createSignal<PanZoomTransform>({
		x: options.x ?? 0,
		y: options.y ?? 0,
		scale: options.scale ?? 1,
	});

	// One persistent core instance shared by the viewport + world refs (they bind independently).
	const inst = new PanZoom({ ...options, onChange: (t) => set_transform(t) });

	let v_dispose: (() => void) | null = null;
	const viewport: RefSetter = (node) => {
		v_dispose?.();
		v_dispose = node ? inst.viewport(node) : null;
	};

	let w_dispose: (() => void) | null = null;
	const world: RefSetter = (node) => {
		w_dispose?.();
		w_dispose = node ? inst.world(node) : null;
	};

	const zoomBy = (factor: number, cx?: number, cy?: number) => inst.zoomBy(factor, cx, cy);
	const zoomTo = (scale: number, cx?: number, cy?: number) => inst.zoomTo(scale, cx, cy);
	const panBy = (dx: number, dy: number) => inst.panBy(dx, dy);
	const setTransform = (t: Partial<PanZoomTransform>) => inst.setTransform(t);
	const reset = () => inst.reset();

	onCleanup(() => {
		v_dispose?.();
		v_dispose = null;
		w_dispose?.();
		w_dispose = null;
	});

	return {
		viewport,
		world,
		scale: () => transform().scale,
		x: () => transform().x,
		y: () => transform().y,
		transform,
		zoomBy,
		zoomTo,
		panBy,
		setTransform,
		reset,
	};
}

export type { PanZoomOptions, PanZoomBindOptions, PanZoomTransform } from '@neodrag/core/panzoom';

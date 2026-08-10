import { PanZoom, type PanZoomBindOptions, type PanZoomTransform } from '@neodrag/core/panzoom';
import { onScopeDispose, ref, type Ref } from 'vue';

type FnRef = (el: HTMLElement | null) => void;

/**
 * Vue v3 pan/zoom canvas composable — a thin adapter over the core `PanZoom` binder (which owns the pan
 * drag, wheel/pinch zoom, and the world transform). Bind `:ref="viewport"` on the clipping element and
 * `:ref="world"` on the inner content layer; read live reactive `scale` / `x` / `y` / `transform`.
 */
export function usePanZoom(options: PanZoomBindOptions = {}): {
	viewport: FnRef;
	world: FnRef;
	scale: Ref<number>;
	x: Ref<number>;
	y: Ref<number>;
	transform: Ref<PanZoomTransform>;
	zoomBy: (factor: number, cx?: number, cy?: number) => void;
	zoomTo: (scale: number, cx?: number, cy?: number) => void;
	panBy: (dx: number, dy: number) => void;
	setTransform: (t: Partial<PanZoomTransform>) => void;
	reset: () => void;
} {
	const transform = ref<PanZoomTransform>({
		x: options.x ?? 0,
		y: options.y ?? 0,
		scale: options.scale ?? 1,
	}) as Ref<PanZoomTransform>;
	const scale = ref(transform.value.scale);
	const x = ref(transform.value.x);
	const y = ref(transform.value.y);

	// One persistent core instance shared by the viewport + world refs (they bind independently).
	const inst = new PanZoom({
		...options,
		onChange: (t) => {
			transform.value = t;
			scale.value = t.scale;
			x.value = t.x;
			y.value = t.y;
		},
	});

	let v_dispose: (() => void) | null = null;
	const viewport: FnRef = (node) => {
		v_dispose?.();
		v_dispose = node ? inst.viewport(node) : null;
	};

	let w_dispose: (() => void) | null = null;
	const world: FnRef = (node) => {
		w_dispose?.();
		w_dispose = node ? inst.world(node) : null;
	};

	const zoomBy = (factor: number, cx?: number, cy?: number) => inst.zoomBy(factor, cx, cy);
	const zoomTo = (s: number, cx?: number, cy?: number) => inst.zoomTo(s, cx, cy);
	const panBy = (dx: number, dy: number) => inst.panBy(dx, dy);
	const setTransform = (t: Partial<PanZoomTransform>) => inst.setTransform(t);
	const reset = () => inst.reset();

	onScopeDispose(() => {
		v_dispose?.();
		w_dispose?.();
	});

	return { viewport, world, scale, x, y, transform, zoomBy, zoomTo, panBy, setTransform, reset };
}

export type { PanZoomOptions, PanZoomBindOptions, PanZoomTransform } from '@neodrag/core/panzoom';

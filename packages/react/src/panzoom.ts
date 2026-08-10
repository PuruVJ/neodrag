import { PanZoom, type PanZoomBindOptions, type PanZoomTransform } from '@neodrag/core/panzoom';
import { useCallback, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';

/**
 * Pan/zoom canvas hook — a thin adapter over the core `PanZoom` binder (which owns the pan drag,
 * wheel/pinch zoom, and the world transform). Put `viewport` on the clipping element's `ref` and
 * `world` on the inner content layer's `ref`; read live `scale` / `x` / `y` / `transform`.
 */
export function usePanZoom(options: PanZoomBindOptions = {}): {
	viewport: RefCallback;
	world: RefCallback;
	scale: number;
	x: number;
	y: number;
	transform: PanZoomTransform;
	zoomBy: (factor: number, cx?: number, cy?: number) => void;
	zoomTo: (scale: number, cx?: number, cy?: number) => void;
	panBy: (dx: number, dy: number) => void;
	setTransform: (t: Partial<PanZoomTransform>) => void;
	reset: () => void;
} {
	const instance = useRef<PanZoom | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [transform, setTransform] = useState<PanZoomTransform>({
		x: options.x ?? 0,
		y: options.y ?? 0,
		scale: options.scale ?? 1,
	});

	if (!instance.current) {
		instance.current = new PanZoom({
			...opts.current,
			onChange: (t) => setTransform(t),
		});
	}

	const v_dispose = useRef<(() => void) | null>(null);
	const viewport = useCallback<RefCallback>((node) => {
		v_dispose.current?.();
		v_dispose.current = node ? instance.current!.viewport(node) : null;
	}, []);

	const w_dispose = useRef<(() => void) | null>(null);
	const world = useCallback<RefCallback>((node) => {
		w_dispose.current?.();
		w_dispose.current = node ? instance.current!.world(node) : null;
	}, []);

	const zoomBy = useCallback((factor: number, cx?: number, cy?: number) => instance.current?.zoomBy(factor, cx, cy), []);
	const zoomTo = useCallback((scale: number, cx?: number, cy?: number) => instance.current?.zoomTo(scale, cx, cy), []);
	const panBy = useCallback((dx: number, dy: number) => instance.current?.panBy(dx, dy), []);
	const setTransformFn = useCallback((t: Partial<PanZoomTransform>) => instance.current?.setTransform(t), []);
	const reset = useCallback(() => instance.current?.reset(), []);

	return {
		viewport,
		world,
		scale: transform.scale,
		x: transform.x,
		y: transform.y,
		transform,
		zoomBy,
		zoomTo,
		panBy,
		setTransform: setTransformFn,
		reset,
	};
}

export type { PanZoomOptions, PanZoomBindOptions, PanZoomTransform } from '@neodrag/core/panzoom';

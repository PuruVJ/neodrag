import { createAttachmentKey } from 'svelte/attachments';
import { PanZoom as CorePanZoom, type PanZoomBindOptions, type PanZoomTransform } from '@neodrag/core/panzoom';
import type { DndNode } from '@neodrag/core';
import type { AttachProps } from './_internal.ts';

export type { PanZoomOptions, PanZoomTransform, PanZoomBindOptions } from '@neodrag/core/panzoom';

/**
 * Reactive Svelte wrapper for a pan/zoom canvas — a thin adapter over the core `PanZoom` binder
 * (which owns the pan drag, wheel/pinch zoom, and the world transform). Spread `{...canvas.viewport}`
 * on the clipping element and `{...canvas.world}` on the inner content layer; read live `canvas.scale`
 * / `canvas.x` / `canvas.y`.
 */
export class PanZoom {
	readonly #core: CorePanZoom;
	#x = $state(0);
	#y = $state(0);
	#scale = $state(1);
	readonly viewport: AttachProps;
	readonly world: AttachProps;

	constructor(options: PanZoomBindOptions = {}) {
		this.#core = new CorePanZoom({
			...options,
			onChange: (t) => {
				this.#x = t.x;
				this.#y = t.y;
				this.#scale = t.scale;
				options.onChange?.(t);
			},
		});
		this.#x = this.#core.x;
		this.#y = this.#core.y;
		this.#scale = this.#core.scale;

		this.viewport = {
			[createAttachmentKey()]: (node: DndNode) => this.#core.viewport(node as HTMLElement),
		};
		this.world = {
			[createAttachmentKey()]: (node: DndNode) => this.#core.world(node as HTMLElement),
		};
	}

	/** Live world scale (reactive). */
	get scale(): number {
		return this.#scale;
	}
	/** Live world translate x in viewport px (reactive). */
	get x(): number {
		return this.#x;
	}
	/** Live world translate y in viewport px (reactive). */
	get y(): number {
		return this.#y;
	}
	/** The current transform as a plain object. */
	get transform(): PanZoomTransform {
		return { x: this.#x, y: this.#y, scale: this.#scale };
	}

	/** Multiply the scale by `factor`, keeping `(cx, cy)` viewport-local fixed (default: centre). */
	zoomBy(factor: number, cx?: number, cy?: number): void {
		this.#core.zoomBy(factor, cx, cy);
	}
	/** Zoom to an absolute scale, keeping `(cx, cy)` viewport-local fixed (default: centre). */
	zoomTo(scale: number, cx?: number, cy?: number): void {
		this.#core.zoomTo(scale, cx, cy);
	}
	/** Pan the world by `(dx, dy)` viewport px. */
	panBy(dx: number, dy: number): void {
		this.#core.panBy(dx, dy);
	}
	/** Set any subset of the transform directly. */
	setTransform(t: Partial<PanZoomTransform>): void {
		this.#core.setTransform(t);
	}
	/** Restore the initial transform. */
	reset(): void {
		this.#core.reset();
	}
}

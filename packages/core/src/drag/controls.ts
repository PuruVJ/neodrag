/**
 * Drag start-gating by nested allow/block zones — a richer alternative to the single
 * `handle`/`cancel` whitelist/blacklist. Overlapping zones resolve by area: the smallest zone
 * containing the pointer wins, with a configurable allow-vs-block tie-break. Built into Draggable
 * via the `controls` option (it hard-gates the start, unlike a post-start `use:[]` plugin could).
 */

export type ControlZone = {
	element: Element;
	top: number;
	right: number;
	bottom: number;
	left: number;
	area: number;
};

export type ZonesFrom = (root: Element) => ControlZone[];

export const ControlFrom = {
	/**
	 * Build control zones from a CSS selector. The string is passed to `querySelectorAll` —
	 * supply a developer-trusted/static selector, never one built from untrusted input.
	 */
	selector(selector: string): ZonesFrom {
		return (root) => ControlFrom.elements(root.querySelectorAll(selector))(root);
	},

	elements(elements: ArrayLike<Element | null | undefined>): ZonesFrom {
		return (root) => {
			const root_rect = root.getBoundingClientRect();
			const data: ControlZone[] = [];
			for (let i = 0; i < elements.length; i++) {
				const el = elements[i];
				if (!el) continue;
				const rect = el.getBoundingClientRect();
				data.push({
					element: el,
					top: rect.top - root_rect.top,
					right: rect.right - root_rect.left,
					bottom: rect.bottom - root_rect.top,
					left: rect.left - root_rect.left,
					area: rect.width * rect.height,
				});
			}
			return data;
		};
	},
};

function isNested(inner: ControlZone, outer: ControlZone): boolean {
	return (
		inner.area < outer.area &&
		inner.left >= outer.left &&
		inner.right <= outer.right &&
		inner.top >= outer.top &&
		inner.bottom <= outer.bottom
	);
}

function isPointInZone(x: number, y: number, zone: ControlZone, root_rect: DOMRect): boolean {
	const rx = x - root_rect.left;
	const ry = y - root_rect.top;
	return rx >= zone.left && rx <= zone.right && ry >= zone.top && ry <= zone.bottom;
}

function containingZones(x: number, y: number, zones: ControlZone[], root_rect: DOMRect): ControlZone[] {
	const out: ControlZone[] = [];
	for (const z of zones) if (isPointInZone(x, y, z, root_rect)) out.push(z);
	out.sort((a, b) => a.area - b.area);
	return out;
}

/**
 * Decide whether a point lands in an allow or block zone — the tie-break ladder. `allow_defined`
 * is whether any allow zones were configured at all (an empty allow set with allow configured
 * means "block everything not explicitly allowed").
 */
export function resolveControl(
	allow: ControlZone[],
	block: ControlZone[],
	allow_defined: boolean,
	priority: 'allow' | 'block' = 'allow',
): { zone: ControlZone | null; isAllow: boolean } {
	if (allow_defined && allow.length === 0) return { zone: null, isAllow: false };
	if (allow.length === 0 && block.length === 0)
		return { zone: null, isAllow: allow_defined ? false : true };

	let i = 0;
	let j = 0;
	while (i < allow.length || j < block.length) {
		const a = allow[i];
		const b = block[j];
		if (!a) return { zone: b!, isAllow: false };
		if (!b) return { zone: a, isAllow: true };
		if (isNested(a, b)) return { zone: a, isAllow: true };
		if (isNested(b, a)) return { zone: b, isAllow: false };
		if (a.area === b.area && priority === 'block') return { zone: b, isAllow: false };
		if (a.area <= b.area) return { zone: a, isAllow: true };
		return { zone: b, isAllow: false };
	}
	return { zone: null, isAllow: allow_defined ? false : true };
}

/** A control region: a CSS selector or element (sugar), or `ControlFrom.*` for nested zones. */
export type ControlInput = string | HTMLElement | ZonesFrom;

function toZones(input: ControlInput): ZonesFrom {
	if (typeof input === 'function') return input;
	if (typeof input === 'string') return ControlFrom.selector(input);
	return ControlFrom.elements([input]);
}

/**
 * Built-in drag start-gate. `handle` = where a drag may start (allow), `cancel` = where it may not
 * (block); overlapping zones resolve by area with the `priority` tie-break. A bare selector/element
 * is the simple whitelist/blacklist; `ControlFrom.*` opts into nested-zone resolution.
 */
export interface DragControls {
	handle?: ControlInput;
	cancel?: ControlInput;
	priority?: 'allow' | 'block';
}

/** Whether a pointerdown at viewport `(x, y)` inside `root` may start a drag, per `controls`. */
export function controlAllowsStart(controls: DragControls, root: Element, x: number, y: number): boolean {
	const allow = (controls.handle ? toZones(controls.handle)(root) : []).sort((a, b) => a.area - b.area);
	const block = (controls.cancel ? toZones(controls.cancel)(root) : []).sort((a, b) => a.area - b.area);
	const root_rect = root.getBoundingClientRect();
	const allow_hit = containingZones(x, y, allow, root_rect);
	const block_hit = containingZones(x, y, block, root_rect);
	return resolveControl(allow_hit, block_hit, controls.handle != null, controls.priority ?? 'allow').isAllow;
}

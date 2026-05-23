import { defineDragPlugin } from '../types.ts';
import { CONTROLS_KEY } from './keys.ts';

type ControlZone = {
	element: Element;
	top: number;
	right: number;
	bottom: number;
	left: number;
	area: number;
};

export const ControlFrom = {
	selector(selector: string): (root: Element) => ControlZone[] {
		return (root) => ControlFrom.elements(root.querySelectorAll(selector))(root);
	},

	elements(elements: NodeListOf<Element> | (Element | null | undefined)[]): (root: Element) => ControlZone[] {
		return (root) => {
			const root_rect = root.getBoundingClientRect();
			const data: ControlZone[] = [];
			for (const el of Array.from(elements)) {
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

function is_nested(inner: ControlZone, outer: ControlZone) {
	return (
		inner.area < outer.area &&
		inner.left >= outer.left &&
		inner.right <= outer.right &&
		inner.top >= outer.top &&
		inner.bottom <= outer.bottom
	);
}

function is_point_in_zone(x: number, y: number, zone: ControlZone, root_rect: DOMRect) {
	const rx = x - root_rect.left;
	const ry = y - root_rect.top;
	return rx >= zone.left && rx <= zone.right && ry >= zone.top && ry <= zone.bottom;
}

function find_containing_zones(
	event: PointerEvent,
	zones: ControlZone[],
	root_rect: DOMRect,
) {
	const out: ControlZone[] = [];
	for (let i = 0; i < zones.length; i++) {
		const z = zones[i]!;
		if (is_point_in_zone(event.clientX, event.clientY, z, root_rect)) out.push(z);
	}
	out.sort((a, b) => a.area - b.area);
	return out;
}

function resolve_zone(
	allow: ControlZone[],
	block: ControlZone[],
	allow_defined: boolean,
): { zone: ControlZone | null; is_allow: boolean } {
	if (allow_defined && allow.length === 0) return { zone: null, is_allow: false };
	if (allow.length === 0 && block.length === 0) return { zone: null, is_allow: allow_defined ? false : true };

	let i = 0;
	let j = 0;
	while (i < allow.length || j < block.length) {
		const a = allow[i];
		const b = block[j];
		if (!a) return { zone: b!, is_allow: false };
		if (!b) return { zone: a, is_allow: true };
		if (is_nested(a, b)) return { zone: a, is_allow: true };
		if (is_nested(b, a)) return { zone: b, is_allow: false };
		if (a.area <= b.area) {
			i++;
			return { zone: a, is_allow: true };
		}
		j++;
		return { zone: b, is_allow: false };
	}
	return { zone: null, is_allow: allow_defined ? false : true };
}

export const controls = defineDragPlugin(
	(
		options?: {
			allow?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			block?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			priority?: 'allow' | 'block';
		} | null,
		shouldRecompute: (ctx: { hook: 'init' | 'start' | 'drag' | 'end' }) => boolean = (ctx) =>
			ctx.hook === 'init',
	) => ({
		key: CONTROLS_KEY,
		name: 'controls',
		phase: 'pre',

		init(ctx) {
			const compute = () => {
				const allow = (options?.allow?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area);
				const block = (options?.block?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area);
				return { allow, block };
			};
			const { allow, block } = compute();
			return {
				allow,
				block,
				priority: options?.priority ?? 'allow',
				compute,
			};
		},

		start(ctx, state, event) {
			if (shouldRecompute({ hook: 'start' })) {
				const next = state.compute();
				state.allow = next.allow;
				state.block = next.block;
			}

			const allow_zones = find_containing_zones(event, state.allow, ctx.cachedRootNodeRect);
			const block_zones = find_containing_zones(event, state.block, ctx.cachedRootNodeRect);
			const { zone, is_allow } = resolve_zone(
				allow_zones,
				block_zones,
				state.allow.length > 0,
			);

			if (!zone) return is_allow;

			if (is_allow) {
				ctx.session.setVisual(zone.element as HTMLElement);
				return true;
			}
			return false;
		},
	}),
);

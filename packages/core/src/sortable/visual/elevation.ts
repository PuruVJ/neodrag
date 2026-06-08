import { fmtPoint, sortableStory } from '../agent-log.ts';
import type { SortableContext } from '../context.ts';

export const SORTABLE_ELEVATED_SOURCE_ATTR = 'data-neodrag-sortable-elevated-source';

const DEFAULT_CONTAINER_Z = 10;
const DEFAULT_CHIP_Z = 1000;

type ElevationSnapshot = {
	containerPosition: string;
	containerZIndex: string;
	chipPosition: string;
	chipZIndex: string;
};

const elevationSnapshots = new WeakMap<HTMLElement, ElevationSnapshot>();

function stackingProbe(
	pointerX: number,
	pointerY: number,
	dragChip: HTMLElement | null,
	raised: boolean,
): void {
	if (!Number.isFinite(pointerX) || !Number.isFinite(pointerY)) return;
	const stack = document.elementsFromPoint(pointerX, pointerY).slice(0, 10);
	const top = stack.map((el) => {
		if (!(el instanceof HTMLElement)) {
			return { tag: el.tagName, key: null, z: '', pos: '' };
		}
		const cs = getComputedStyle(el);
		return {
			tag: el.tagName,
			key: el.getAttribute('data-sortable-key'),
			z: cs.zIndex,
			pos: cs.position,
			cls: typeof el.className === 'string' ? el.className.slice(0, 48) : '',
		};
	});
	const dragIndex = dragChip ? stack.indexOf(dragChip) : -1;
	const dragAboveForeign =
		dragIndex >= 0 &&
		stack.slice(0, dragIndex).every((el) => {
			if (!(el instanceof HTMLElement)) return true;
			const key = el.getAttribute('data-sortable-key');
			return !key || key === dragChip?.getAttribute('data-sortable-key');
		});
	const dragKey = dragChip?.getAttribute('data-sortable-key') ?? '?';
	sortableStory('E', 'visual/elevation.ts', `stacking · ${dragKey}`, () => ({
		story: [
			raised
				? `Source column raised while dragging "${dragKey}" over a friend.`
				: `Stacking check for "${dragKey}" (not elevated).`,
			`${fmtPoint(pointerX, pointerY)} — hit-test top ${top.length} layers.`,
			dragIndex >= 0
				? `Drag chip is layer #${dragIndex + 1}; ${dragAboveForeign ? 'nothing foreign occludes it' : 'friend content may paint above the chip'}.`
				: 'Drag chip not found in hit stack.',
		].join(' '),
		data: {
			raised,
			pointerX,
			pointerY,
			dragIndex,
			dragAboveForeign,
			top,
			dragChipZ: dragChip ? getComputedStyle(dragChip).zIndex : null,
			dragChipPos: dragChip ? getComputedStyle(dragChip).position : null,
		},
	}));
}

export function syncGroupedSourceElevation<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
	raised: boolean,
	pointerX = NaN,
	pointerY = NaN,
): void {
	const container = sourceCtx.containerNode;
	const chip = sourceCtx.nodesByKey.get(dragKey);
	if (!(container instanceof HTMLElement) || !(chip instanceof HTMLElement)) return;

	const isRaised = container.hasAttribute(SORTABLE_ELEVATED_SOURCE_ATTR);
	if (raised === isRaised) {
		if (raised && Number.isFinite(pointerX)) {
			stackingProbe(pointerX, pointerY, chip, true);
		}
		return;
	}

	if (raised) {
		const containerCs = getComputedStyle(container);
		const chipCs = getComputedStyle(chip);
		elevationSnapshots.set(container, {
			containerPosition: container.style.position,
			containerZIndex: container.style.zIndex,
			chipPosition: chip.style.position,
			chipZIndex: chip.style.zIndex,
		});
		container.setAttribute(SORTABLE_ELEVATED_SOURCE_ATTR, '');
		if (containerCs.position === 'static') container.style.position = 'relative';
		container.style.zIndex = String(DEFAULT_CONTAINER_Z);
		if (chipCs.position === 'static') chip.style.position = 'relative';
		chip.style.zIndex = String(sourceCtx.opts.zIndex ?? DEFAULT_CHIP_Z);
		sortableStory('E', 'visual/elevation.ts', `elevation ON · ${dragKey}`, () => ({
		story: [
				`Friend hover: raised home column and chip "${dragKey}" so it paints above friend chips.`,
				`container z-index ${container.style.zIndex}, chip z-index ${chip.style.zIndex}.`,
			].join(' '),
		data: { dragKey, containerZ: container.style.zIndex, chipZ: chip.style.zIndex },
	}));
		stackingProbe(pointerX, pointerY, chip, true);
		return;
	}

	const snapshot = elevationSnapshots.get(container);
	container.removeAttribute(SORTABLE_ELEVATED_SOURCE_ATTR);
	if (snapshot) {
		container.style.position = snapshot.containerPosition;
		container.style.zIndex = snapshot.containerZIndex;
		chip.style.position = snapshot.chipPosition;
		chip.style.zIndex = snapshot.chipZIndex;
		elevationSnapshots.delete(container);
	} else {
		container.style.position = '';
		container.style.zIndex = '';
		chip.style.position = '';
		chip.style.zIndex = '';
	}
	sortableStory('E', 'visual/elevation.ts', `elevation OFF · ${dragKey}`, () => ({
		story: `Drag over friend ended — restored home column and chip "${dragKey}" stacking.`,
		data: { dragKey },
	}));
}

export function clearGroupedSourceElevation<T>(sourceCtx: SortableContext<T>, dragKey: string): void {
	syncGroupedSourceElevation(sourceCtx, dragKey, false);
}

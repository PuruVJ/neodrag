export type SizesKeyMap = Record<string, string>;

export type SizesOutput = {
	version: 2;
	generatedAt: string;
	drag: { keys: SizesKeyMap; sizes: Record<string, number> };
	drop: { keys: SizesKeyMap; sizes: Record<string, number> };
	extras: {
		engineMinimal: number;
		sortable: number;
		draggableOnly: number;
	};
	presets: Record<string, { bytes: number; drag: string[]; drop: string[]; label: string }>;
};

export const DRAG_DEFAULT_NAMES = [
	'ignoreMultitouch',
	'applyUserSelectHack',
	'threshold',
	'touchAction',
] as const;

export function bitmaskFromKeys(selected: string[], keyMap: SizesKeyMap): number {
	let mask = 0;
	for (const key of selected) {
		const index = Number(key);
		if (!Number.isNaN(index)) mask |= 1 << index;
	}
	return mask;
}

export function lookupSize(sizes: Record<string, number>, mask: number, fallback = 0): number {
	return sizes[String(mask)] ?? sizes['0'] ?? fallback;
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes.toFixed(0)} B`;
	return `${(bytes / 1024).toFixed(2)} KB`;
}

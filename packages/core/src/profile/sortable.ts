const DEBUG_ENDPOINT =
	'http://127.0.0.1:7434/ingest/ac64e1c3-d2a6-4561-a995-7ab24ced017d';
const DEBUG_SESSION = 'ae0e33';

let narrativeFrame = 0;

export type SortableRectLike = Pick<
	DOMRect,
	'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'
>;

export type SortableStoryPayload = {
	story: string;
	data?: Record<string, unknown>;
};

export function fmtPoint(x: number, y: number, label = 'cursor'): string {
	if (!Number.isFinite(x) || !Number.isFinite(y)) return `${label} (invalid)`;
	return `${label} (${Math.round(x)}, ${Math.round(y)})`;
}

export function fmtRect(rect: SortableRectLike | null | undefined, label = 'box'): string {
	if (!rect) return `${label}: ∅`;
	const w = rect.width ?? rect.right - rect.left;
	const h = rect.height ?? rect.bottom - rect.top;
	return `${label} [L${Math.round(rect.left)} T${Math.round(rect.top)} R${Math.round(rect.right)} B${Math.round(rect.bottom)}] ${Math.round(w)}×${Math.round(h)}`;
}

export function fmtOffset(ax: number, ay: number, bx: number, by: number): string {
	const dx = Math.round(ax - bx);
	const dy = Math.round(ay - by);
	const mag = Math.round(Math.hypot(dx, dy));
	return `Δ(${dx}px, ${dy}px) ≈ ${mag}px`;
}

export function fmtIndexChange(from: number, to: number): string {
	if (from === to) return `stays at index ${from}`;
	return `index ${from} → ${to}`;
}

export function fmtOrder(keys: readonly string[], insertAt: number, dragKey?: string): string {
	if (!keys.length) return insertAt === 0 ? '[ ▶ drop here ]' : '[ empty ]';
	const parts: string[] = [];
	for (let i = 0; i <= keys.length; i++) {
		if (i === insertAt) parts.push('▶');
		if (i < keys.length) {
			const k = keys[i]!;
			parts.push(k === dragKey ? `⟨${k}⟩` : k);
		}
	}
	return `[ ${parts.join(' ')} ]`;
}

export function fmtMids(mids: readonly { key?: string; mid: number }[]): string {
	if (!mids.length) return 'no slot mids';
	return mids
		.map((m, i) => `${m.key ?? i}@${Math.round(m.mid)}`)
		.join(', ');
}

export function sortableAgentLog(
	hypothesisId: string,
	location: string,
	message: string,
	data: Record<string, unknown>,
	runId = 'pre-fix',
): void {
	fetch(DEBUG_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Debug-Session-Id': DEBUG_SESSION,
		},
		body: JSON.stringify({
			sessionId: DEBUG_SESSION,
			runId,
			hypothesisId,
			location,
			message,
			data,
			timestamp: Date.now(),
		}),
	}).catch(() => {});
}

export function sortableStory(
	hypothesisId: string,
	location: string,
	beat: string,
	build: () => SortableStoryPayload,
	runId = 'pre-fix',
): void {
	const { story, data = {} } = build();
	narrativeFrame += 1;
	const frame = narrativeFrame;
	sortableAgentLog(
		hypothesisId,
		location,
		`[f${frame}] ${beat}`,
		{
			...data,
			frame,
			beat,
			story,
		},
		runId,
	);
}

export function sortableRowSnapshot(row: HTMLElement | null) {
	if (!row) return null;
	const cs = getComputedStyle(row);
	const rect = row.getBoundingClientRect();
	return {
		minWidth: row.style.minWidth || cs.minWidth,
		minHeight: row.style.minHeight || cs.minHeight,
		marginLeft: row.style.marginLeft || cs.marginLeft,
		marginTop: row.style.marginTop || cs.marginTop,
		flexShrink: row.style.flexShrink || cs.flexShrink,
		translate: row.style.translate || cs.translate,
		transform: row.style.transform || cs.transform,
		zIndex: row.style.zIndex || cs.zIndex,
		placeholder: row.hasAttribute('data-neodrag-sortable-placeholder-row'),
		rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
	};
}

export function sortableChipSnapshot(el: HTMLElement | null) {
	if (!el) return null;
	const cs = getComputedStyle(el);
	const rect = el.getBoundingClientRect();
	return {
		key: el.getAttribute('data-sortable-key'),
		translate: el.style.translate || cs.translate,
		transform: el.style.transform || cs.transform,
		position: el.style.position || cs.position,
		zIndex: el.style.zIndex || cs.zIndex,
		left: el.style.left,
		top: el.style.top,
		displaced: el.hasAttribute('data-neodrag-sortable-displaced'),
		dragState: el.getAttribute('data-neodrag-state'),
		rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
	};
}

export function sortableChipsSnapshot(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
): Record<string, ReturnType<typeof sortableChipSnapshot>> {
	const out: Record<string, ReturnType<typeof sortableChipSnapshot>> = {};
	for (const [key, node] of nodesByKey) {
		if (node instanceof HTMLElement) out[key] = sortableChipSnapshot(node);
	}
	return out;
}

export function describeChipMotion(
	key: string,
	transform: { x: number; y: number } | undefined,
): string {
	if (!transform || (transform.x === 0 && transform.y === 0)) {
		return `"${key}" stays put`;
	}
	return `"${key}" nudged translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px)`;
}

/**
 * Client side of the dev debug-log pipeline (see `docs/debug-log-plugin.ts`). `createDebug(name)`
 * returns a batched logger that POSTs structured events to `/__debug?name=<name>`, which the dev
 * server appends to `docs/.debug/<name>.log` for the agent to read. A no-op in production.
 *
 * Usage:
 *   const dbg = createDebug('collab');
 *   dbg.clear();                         // start a fresh session (truncates the file)
 *   dbg.log('peer-b', 'presence in', { insertIndex, rel });
 */
const DEV = import.meta.env.DEV;

export type DebugEvent = {
	sessionId: string;
	t: number; // ms since page load (performance.now), monotonic — good for timing deltas
	location: string;
	message: string;
	data?: unknown;
};

export type DebugLogger = {
	log(location: string, message: string, data?: unknown): void;
	/** Truncate the file and start a fresh, timestamped session. */
	clear(): void;
	/** Force-send any buffered events now. */
	flush(): void;
};

const NOOP: DebugLogger = { log() {}, clear() {}, flush() {} };

function rid(): string {
	return Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, '0');
}

export function createDebug(name: string): DebugLogger {
	if (!DEV || typeof window === 'undefined') return NOOP;

	const sessionId = rid();
	const endpoint = `/__debug?name=${encodeURIComponent(name)}`;
	let queue: DebugEvent[] = [];
	let timer: ReturnType<typeof setTimeout> | null = null;

	const send = (path: string, body: string): void => {
		// keepalive so an in-flight flush survives a navigation/unload.
		void fetch(path, { method: 'POST', body, keepalive: true }).catch(() => {});
	};

	const flush = (): void => {
		if (timer != null) {
			clearTimeout(timer);
			timer = null;
		}
		if (queue.length === 0) return;
		const batch = queue;
		queue = [];
		send(endpoint, JSON.stringify(batch));
	};

	const log = (location: string, message: string, data?: unknown): void => {
		queue.push({ sessionId, t: Math.round(performance.now()), location, message, data });
		if (queue.length >= 40) flush();
		else if (timer == null) timer = setTimeout(flush, 100);
	};

	const clear = (): void => {
		queue = [];
		send(`/__debug/clear?name=${encodeURIComponent(name)}`, '');
	};

	window.addEventListener('beforeunload', flush);
	return { log, clear, flush };
}

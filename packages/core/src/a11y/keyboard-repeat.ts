export type KeyboardRepeatTick = (fast: boolean) => void;

export type KeyboardRepeatHandle = {
	stop(): void;
};

export function startKeyboardRepeat(opts: {
	onTick: KeyboardRepeatTick;
	slowInterval: number;
	speedupDelay: number;
	fastInterval: number;
}): KeyboardRepeatHandle {
	let rafId = 0;
	let lastTick = 0;
	let startedAt = 0;
	let stopped = false;
	let fast = false;

	const loop = (now: number) => {
		if (stopped) return;
		if (!startedAt) startedAt = now;
		const interval = fast ? opts.fastInterval : opts.slowInterval;
		if (!fast && now - startedAt >= opts.speedupDelay) {
			fast = true;
			lastTick = now;
		}
		if (now - lastTick >= interval) {
			lastTick = now;
			opts.onTick(fast);
		}
		rafId = requestAnimationFrame(loop);
	};

	rafId = requestAnimationFrame(loop);

	return {
		stop() {
			stopped = true;
			if (rafId) cancelAnimationFrame(rafId);
		},
	};
}

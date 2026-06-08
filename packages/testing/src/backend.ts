import { commands } from '@vitest/browser/context';
import type { MotionSample } from './kinematics.ts';
import { dispatchPointer } from './mouse.ts';

export type PlayMode = 'fast' | 'realtime';

export type PointerSession = {
	target: Element;
	startX: number;
	startY: number;
};

export interface PointerBackend {
	readonly kind: 'synthetic' | 'playwright';
	begin(session: PointerSession): Promise<void>;
	move(samples: MotionSample[]): Promise<void>;
	end(x: number, y: number): Promise<void>;
	cancel?(): Promise<void>;
}

function isVitestBrowser(): boolean {
	return typeof commands !== 'undefined' && commands !== null;
}

function sleep(ms: number, mode: PlayMode): Promise<void> {
	if (mode === 'fast' || ms <= 0) return Promise.resolve();
	return new Promise((r) => setTimeout(r, ms));
}

export class SyntheticBackend implements PointerBackend {
	readonly kind = 'synthetic' as const;
	#target: Element | null = null;
	#mode: PlayMode;
	#timestamp = 0;

	constructor(mode: PlayMode = 'fast') {
		this.#mode = mode;
	}

	async begin(session: PointerSession): Promise<void> {
		this.#target = session.target;
		this.#timestamp = performance.now();
		const t = session.target;
		dispatchPointer(t, 'pointermove', session.startX, session.startY, 0);
		await sleep(1, this.#mode);
		dispatchPointer(t, 'pointerdown', session.startX, session.startY, 1);
	}

	async move(samples: MotionSample[]): Promise<void> {
		const t = this.#target ?? document.documentElement;
		for (const s of samples) {
			this.#timestamp += s.dt;
			dispatchPointer(t, 'pointermove', s.x, s.y, 1);
			await sleep(s.dt, this.#mode);
		}
	}

	async end(x: number, y: number): Promise<void> {
		const t = this.#target ?? document.documentElement;
		await sleep(1, this.#mode);
		dispatchPointer(t, 'pointerup', x, y, 0);
		this.#target = null;
	}

	async cancel(): Promise<void> {
		if (!this.#target) return;
		const pos = { x: 0, y: 0 };
		dispatchPointer(this.#target, 'pointerup', pos.x, pos.y, 0);
		this.#target = null;
	}
}

export class PlaywrightBackend implements PointerBackend {
	readonly kind = 'playwright' as const;
	#mode: PlayMode;

	constructor(mode: PlayMode = 'realtime') {
		this.#mode = mode;
	}

	async begin(session: PointerSession): Promise<void> {
		if (!isVitestBrowser()) {
			throw new Error('PlaywrightBackend requires Vitest browser mode');
		}
		await commands.mouseMove(session.startX, session.startY);
		await commands.mouseDown(session.startX, session.startY, 'left');
	}

	async move(samples: MotionSample[]): Promise<void> {
		if (!isVitestBrowser()) {
			throw new Error('PlaywrightBackend requires Vitest browser mode');
		}
		for (const s of samples) {
			await commands.mouseMove(s.x, s.y, 1);
			await sleep(s.dt, this.#mode);
		}
	}

	async end(x: number, y: number): Promise<void> {
		if (!isVitestBrowser()) {
			throw new Error('PlaywrightBackend requires Vitest browser mode');
		}
		await commands.mouseUp(x, y, 'left');
	}

	async cancel(): Promise<void> {
		if (!isVitestBrowser()) return;
		const pos = await commands.getMousePosition();
		await commands.mouseUp(pos.x, pos.y, 'left');
	}
}

export type PickBackendOptions = {
	trusted?: boolean;
	mode?: PlayMode;
};

export function pickBackend(opts: PickBackendOptions = {}): PointerBackend {
	if (opts.trusted && isVitestBrowser()) {
		return new PlaywrightBackend(opts.mode ?? 'realtime');
	}
	return new SyntheticBackend(opts.mode ?? 'fast');
}

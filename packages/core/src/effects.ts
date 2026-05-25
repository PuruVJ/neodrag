export class EffectScheduler {
	#effects: (() => void)[] = [];
	#scheduled = false;

	schedule(fn: () => void) {
		this.#effects.push(fn);
		if (!this.#scheduled) {
			this.#scheduled = true;
			requestAnimationFrame(() => this.flush());
		}
	}

	flush() {
		const effects = this.#effects;
		this.#effects = [];
		this.#scheduled = false;
		for (let i = 0; i < effects.length; i++) {
			effects[i]!();
		}
	}

	clear() {
		this.#effects = [];
		this.#scheduled = false;
	}
}

export type Rng = {
	next(): number;
	range(min: number, max: number): number;
	gaussian(mean?: number, std?: number): number;
	sign(): number;
	int(n: number): number;
};

export function createRng(seed: number): Rng {
	let state = seed >>> 0 || 1;

	const next = (): number => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	return {
		next,
		range(min: number, max: number) {
			return min + next() * (max - min);
		},
		gaussian(mean = 0, std = 1) {
			let u = 0;
			let v = 0;
			while (u === 0) u = next();
			while (v === 0) v = next();
			const mag = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
			return mean + mag * std;
		},
		sign() {
			return next() < 0.5 ? -1 : 1;
		},
		int(n: number) {
			return Math.floor(next() * n);
		},
	};
}

export function valueNoise1D(rng: Rng, length: number, scale = 1): number[] {
	const out: number[] = [];
	let v = rng.range(-scale, scale);
	for (let i = 0; i < length; i++) {
		v += rng.gaussian(0, scale * 0.35);
		out.push(v);
	}
	return out;
}

export function randomSeed(): number {
	return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

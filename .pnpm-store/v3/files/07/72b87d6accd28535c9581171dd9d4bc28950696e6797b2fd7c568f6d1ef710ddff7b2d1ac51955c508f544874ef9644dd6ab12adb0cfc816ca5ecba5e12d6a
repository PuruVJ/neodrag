import { VERSION } from 'svelte/compiler';
const svelteVersion = parseVersion(VERSION);

export function parseVersion(version: string): number[] {
	const segments = version.split('.', 3).map((s) => parseInt(s, 10));
	while (segments.length < 3) {
		segments.push(0);
	}
	return segments;
}

/**
 * compare version with current svelte, only takes major.minor.patch into account.
 * If you don't pass all three, values will be filled with 0, ie `3` is equal to `3.0.0`
 * @param version
 * @returns 1 if passed version is larger than current, 0 if it is equal and -1 if it is lower
 */
export function compareToSvelte(version: string): 1 | 0 | -1 {
	const parsedVersion = parseVersion(version);
	for (let i = 0; i < svelteVersion.length; i++) {
		const a = parsedVersion[i];
		const b = svelteVersion[i];
		if (a === b) {
			continue;
		} else if (a > b) {
			return 1;
		} else {
			return -1;
		}
	}
	return 0;
}

export function atLeastSvelte(version: string) {
	const result = compareToSvelte(version) <= 0;
	return result;
}

import { describe, expect, test } from 'vitest';
import { Neodrag } from '../../src/index.ts';

describe('Neodrag debugSnapshot', () => {
	test('returns null when dev is false', () => {
		const engine = new Neodrag({ dev: false });
		expect(engine.debugSnapshot()).toBeNull();
	});

	test('returns counts when dev is true', () => {
		const engine = new Neodrag({ dev: true });
		const snap = engine.debugSnapshot();
		expect(snap).not.toBeNull();
		expect(snap!.dragTargets).toBe(0);
		expect(snap!.dropTargets).toBe(0);
		expect(snap!.session).toBeNull();
	});
});

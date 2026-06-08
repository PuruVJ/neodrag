/**
 * Sole-drop vs multi-drop hit-test budgets during drag.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { defineDropPlugin } from '../../src/types.ts';
import { pointer, resetBody, runBench } from './helpers.ts';

const ZONE_N = 10;

function setupSoleDrop() {
	resetBody();
	const zone = document.createElement('div');
	zone.style.cssText = 'position:absolute;left:0;top:0;width:500px;height:500px;background:#f0f0f0';
	const box = document.createElement('div');
	box.style.cssText =
		'position:absolute;left:40px;top:40px;width:60px;height:60px;background:#4a9eff;touch-action:none';
	zone.appendChild(box);
	document.body.appendChild(zone);

	const noopDrop = defineDropPlugin(() => ({
		key: Symbol('noop'),
		over() {},
	}))();

	const engine = new Neodrag({ dev: false });
	engine.droppable(zone, [noopDrop]);
	engine.draggable(box, [], { threshold: null });

	pointer(box, 'pointerdown', 70, 70);
	pointer(box, 'pointermove', 80, 80);

	return { zone, box, engine };
}

function setupMultiDrop() {
	resetBody();
	const zones: HTMLElement[] = [];
	for (let i = 0; i < ZONE_N; i++) {
		const z = document.createElement('div');
		z.style.cssText = `position:absolute;left:${(i % 5) * 100}px;top:${Math.floor(i / 5) * 120}px;width:90px;height:90px;background:#eee`;
		document.body.appendChild(z);
		zones.push(z);
	}
	const box = document.createElement('div');
	box.style.cssText =
		'position:absolute;left:220px;top:220px;width:60px;height:60px;background:#4a9eff;touch-action:none';
	document.body.appendChild(box);

	const noopDrop = defineDropPlugin(() => ({
		key: Symbol('noop'),
		over() {},
	}))();

	const engine = new Neodrag({ dev: false });
	for (const z of zones) engine.droppable(z, [noopDrop]);
	engine.draggable(box, [], { threshold: null });

	pointer(box, 'pointerdown', 250, 250);
	pointer(box, 'pointermove', 260, 260);

	return { zones, box, engine };
}

describe('drop target perf', () => {
	it('sole-drop and multi-drop stay within budget', () => {
		const sole = setupSoleDrop();
		const soleStats = runBench('drop · sole zone · pointermove sweep', 120, 15, () => {
			for (let y = 50; y < 450; y += 8) {
				pointer(sole.zone, 'pointermove', 250, y);
			}
		});
		sole.engine.dispose();
		sole.zone.remove();

		const multi = setupMultiDrop();
		const multiStats = runBench(`drop · ${ZONE_N} zones · pointermove sweep`, 120, 15, () => {
			for (let y = 50; y < 450; y += 8) {
				pointer(multi.box, 'pointermove', 250, y);
			}
		});
		multi.engine.dispose();
		for (const z of multi.zones) z.remove();
		multi.box.remove();

		expect(soleStats.meanMs).toBeLessThan(2);
		expect(multiStats.meanMs).toBeLessThan(6);
		expect(multiStats.meanMs / soleStats.meanMs).toBeLessThan(8);
	});
});

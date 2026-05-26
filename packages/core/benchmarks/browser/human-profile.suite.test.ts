/**
 * Chrome DevTools CPU profiles for human-expectations workloads.
 * Run: pnpm bench:profile
 * Output: benchmarks/reports/human-profile.json
 */
import { describe, expect, it } from 'vitest';
import { commands } from '@vitest/browser/context';
import { DEFAULTS, Neodrag } from '../../src/index.ts';
import { BoundsFrom, axis, bounds, disabled } from '../../src/plugins.ts';
import { accepts, highlight, onDrop } from '../../src/drop-plugins.ts';
import { dragData } from '../../src/plugins.ts';
import { sortable } from '../../src/drop/index.ts';
import { formatProfileReport } from './profile-analysis.ts';
import { profileScenario } from './profile-helpers.ts';
import { DRAG, humanScenarios } from './human-scenarios.ts';
import { createBox, dragElementByDelta, dragSteps, resetBody } from './helpers.ts';

const REPORT_REL = 'benchmarks/reports/human-profile.json';

describe('Human behavior CPU profiles (Chromium CDP)', () => {
	it('profiles scenarios and hot-path gesture loops', async () => {
		const reports = [];

		for (const scenario of humanScenarios()) {
			const report = await profileScenario(
				`full · ${scenario.group} · ${scenario.id}`,
				scenario.run,
				{ iterations: 20 },
			);
			reports.push(report);
		}

		reports.push(
			await profileScenario(
				'hot · drag · default plugins',
				async () => {
					resetBody();
					const box = createBox();
					const engine = new Neodrag({ plugins: DEFAULTS.plugins, dev: false });
					engine.draggable(box, [], { threshold: null });
					for (let i = 0; i < 80; i++) {
						dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
					}
					engine.dispose();
				},
				{ iterations: 1 },
			),
		);

		reports.push(
			await profileScenario(
				'hot · drag · bounds parent',
				async () => {
					resetBody();
					const parent = document.createElement('div');
					parent.style.cssText = 'position:relative;width:200px;height:200px;overflow:hidden';
					const box = createBox('10px', '10px');
					parent.appendChild(box);
					document.body.appendChild(parent);
					const engine = new Neodrag({ dev: false });
					engine.draggable(box, [bounds(BoundsFrom.parent())], { threshold: null });
					for (let i = 0; i < 60; i++) {
						dragElementByDelta(box, 80, 80, 10);
					}
					engine.dispose();
					parent.remove();
				},
				{ iterations: 1 },
			),
		);

		reports.push(
			await profileScenario(
				'hot · drop · over zone',
				async () => {
					resetBody();
					const zone = document.createElement('div');
					zone.style.cssText =
						'position:absolute;left:40px;top:40px;width:300px;height:300px;border:1px dashed #333';
					const box = createBox('80px', '80px');
					zone.appendChild(box);
					document.body.appendChild(zone);
					const engine = new Neodrag({ dev: false });
					engine.droppable(zone, [
						accepts<{ kind: string }>((d) => d.kind === 'card'),
						onDrop(() => {}),
					]);
					engine.draggable(box, [dragData(() => ({ kind: 'card' }))], { threshold: null });
					const zr = zone.getBoundingClientRect();
					const br = box.getBoundingClientRect();
					for (let i = 0; i < 50; i++) {
						dragSteps(
							box,
							br.left + br.width / 2,
							br.top + br.height / 2,
							zr.left + zr.width / 2,
							zr.top + zr.height / 2,
							12,
						);
					}
					engine.dispose();
					zone.remove();
				},
				{ iterations: 1 },
			),
		);

		reports.push(
			await profileScenario(
				'hot · sortable · reorder',
				async () => {
					resetBody();
					const items = [
						{ id: '1', text: 'One' },
						{ id: '2', text: 'Two' },
						{ id: '3', text: 'Three' },
					];
					const container = document.createElement('ul');
					container.style.cssText =
						'list-style:none;padding:0;margin:0;width:200px;position:absolute;left:40px;top:40px';
					for (const item of items) {
						const li = document.createElement('li');
						li.setAttribute('data-sortable-key', item.id);
						li.style.cssText = 'padding:12px;margin:4px 0;height:28px;background:#b8e0ff';
						container.appendChild(li);
					}
					document.body.appendChild(container);
					const list = sortable({
						items: () => items,
						keyBy: (i) => i.id,
						onReorder: (next) => {
							items.length = 0;
							items.push(...next);
						},
						strategy: 'vertical',
					});
					const engine = new Neodrag({ dev: false });
					engine.droppable(container, list.container());
					for (const item of items) {
						const el = container.querySelector(`[data-sortable-key="${item.id}"]`) as HTMLElement;
						engine.draggable(el, list.item(item.id), { threshold: null });
					}
					const first = container.querySelector('[data-sortable-key="1"]') as HTMLElement;
					const third = container.querySelector('[data-sortable-key="3"]') as HTMLElement;
					const r1 = first.getBoundingClientRect();
					const r3 = third.getBoundingClientRect();
					for (let i = 0; i < 40; i++) {
						dragSteps(
							first,
							r1.left + r1.width / 2,
							r1.top + r1.height / 2,
							r3.left + r3.width / 2,
							r3.top + r3.height + 8,
							16,
						);
					}
					engine.dispose();
					container.remove();
				},
				{ iterations: 1 },
			),
		);

		const markdown = reports.map((r) => formatProfileReport(r)).join('\n');
		console.log('\n=== Human behavior — CPU profile summary ===');
		console.log(markdown);

		await commands.writeFile(
			REPORT_REL,
			`${JSON.stringify(
				{
					recordedAt: new Date().toISOString(),
					note: 'CDP Profiler sampling. "full" = whole scenario × iterations. "hot" = gesture loop only inside one profile window.',
					reports,
				},
				null,
				2,
			)}\n`,
		);

		for (const report of reports) {
			expect(report.sampleCount, report.name).toBeGreaterThan(0);
		}
	});
});

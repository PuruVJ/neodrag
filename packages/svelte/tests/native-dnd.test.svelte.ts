/**
 * Real-browser test for native OS drag-and-drop: synthetic DragEvents carrying a DataTransfer
 * (files + text) over a `native: true` Droppable should drive enter/over and deliver the payload
 * to onDrop. Runs in a real browser so DataTransfer / DragEvent / File behave like the OS.
 */
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { waitForEffects } from '../../core/tests/utils.ts';
import DropHarness from './DropHarness.svelte';

function fireDrag(node: Element, type: string, dt: DataTransfer, x: number, y: number) {
	node.dispatchEvent(
		new DragEvent(type, { dataTransfer: dt, clientX: x, clientY: y, bubbles: true, cancelable: true }),
	);
}

describe('@neodrag/svelte native (OS) file/text drop', () => {
	test('a file drop delivers files + fires enter/over', async () => {
		const comp = render(DropHarness);
		await waitForEffects();
		const zone = (await comp.getByTestId('zone').element()) as HTMLElement;
		const r = zone.getBoundingClientRect();
		const x = r.left + r.width / 2;
		const y = r.top + r.height / 2;

		const dt = new DataTransfer();
		dt.items.add(new File(['hello'], 'note.txt', { type: 'text/plain' }));

		fireDrag(zone, 'dragenter', dt, x, y);
		fireDrag(zone, 'dragover', dt, x, y);
		await waitForEffects();
		expect(comp.component.getOver()).toBe(true);

		fireDrag(zone, 'drop', dt, x, y);
		await waitForEffects();
		expect(comp.component.getDropped()).toBe(true);
		expect(comp.component.getFileNames()).toEqual(['note.txt']);
		expect(comp.component.getOver()).toBe(false);
	});

	test('a text drop delivers text', async () => {
		const comp = render(DropHarness);
		await waitForEffects();
		const zone = (await comp.getByTestId('zone').element()) as HTMLElement;
		const r = zone.getBoundingClientRect();
		const x = r.left + r.width / 2;
		const y = r.top + r.height / 2;

		const dt = new DataTransfer();
		dt.setData('text/plain', 'dropped text');

		fireDrag(zone, 'dragenter', dt, x, y);
		fireDrag(zone, 'dragover', dt, x, y);
		fireDrag(zone, 'drop', dt, x, y);
		await waitForEffects();
		expect(comp.component.getText()).toBe('dropped text');
	});
});

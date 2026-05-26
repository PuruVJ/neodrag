import type { Locator } from '@vitest/browser/context';
import { beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { disabled } from '../../src/plugins.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import { dragAndDrop } from '../mouse.ts';
import { translate } from '../utils.ts';

describe('interactions disabled', () => {
	let el: Locator;

	beforeEach(() => {
		const comp = render(InteractionsBox, { plugins: [disabled()] });
		el = comp.getByTestId('draggable');
	});

	test('does not move when disabled', async () => {
		await dragAndDrop(el, { deltaX: 50, deltaY: 50 });
		const node = await el.element();
		const t = getComputedStyle(node).translate;
		expect(t === 'none' || t === '0px' || t.startsWith('0px')).toBe(true);
	});
});

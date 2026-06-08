/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { MINIMAL_DRAG_PLUGINS, Neodrag } from '../../src/index.ts';
import { ariaDrag, keyboardDrag } from '../../src/a11y/index.ts';
import { Draggable } from '../../src/draggable-binding.ts';

describe('keyboard drag', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('moves with arrow keys after space grab', () => {
		const engine = new Neodrag({ dev: false });
		const binding = new Draggable({
			engine,
			plugins: [...MINIMAL_DRAG_PLUGINS, keyboardDrag({ step: 10 }), ariaDrag({ announce: false })],
		});
		const node = document.createElement('div');
		node.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:100px';
		document.body.appendChild(node);
		binding.attach(node);
		node.focus();

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));

		expect(node.style.translate).toContain('10px');
		binding.destroy();
	});

	it('escape cancels keyboard session via keyboard sensor', () => {
		const engine = new Neodrag({ dev: false });
		const binding = new Draggable({
			engine,
			plugins: [...MINIMAL_DRAG_PLUGINS, keyboardDrag({ step: 5 })],
		});
		const node = document.createElement('div');
		node.style.cssText = 'position:absolute;left:0;top:0;width:80px;height:80px';
		document.body.appendChild(node);
		binding.attach(node);
		node.focus();

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		document.documentElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);

		const afterMove = node.style.translate;
		expect(afterMove).toContain('5px');
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		expect(node.style.translate).toBe(afterMove);
		binding.destroy();
	});

	it('ariaDrag sets grab attributes on keyboard grab', () => {
		const engine = new Neodrag({ dev: false });
		const binding = new Draggable({
			engine,
			plugins: [...MINIMAL_DRAG_PLUGINS, keyboardDrag(), ariaDrag({ label: 'Item' })],
		});
		const node = document.createElement('div');
		document.body.appendChild(node);
		binding.attach(node);
		node.focus();

		expect(node.getAttribute('tabindex')).toBe('0');
		expect(node.getAttribute('aria-label')).toBe('Item');

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		expect(node.getAttribute('aria-grabbed')).toBe('true');

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
		expect(node.getAttribute('aria-grabbed')).toBe('false');
		binding.destroy();
	});
});

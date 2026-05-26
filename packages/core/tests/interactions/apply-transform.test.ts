/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { applyDragTransform } from '../../src/apply-transform.ts';
import type { DragCtx } from '../../src/types.ts';

const SVG_TRANSFORM_TRANSLATE = 2;
const SVG_TRANSFORM_SCALE = 3;

class MockTransform {
	type = SVG_TRANSFORM_TRANSLATE;
	matrix = { e: 5, f: 10 };
	setTranslate(x: number, y: number) {
		this.matrix.e = x;
		this.matrix.f = y;
	}
}

class MockTransformList {
	#items: MockTransform[] = [];
	get numberOfItems() {
		return this.#items.length;
	}
	getItem(i: number) {
		return this.#items[i]!;
	}
	appendItem(t: MockTransform) {
		this.#items.push(t);
		return t;
	}
	insertItemBefore(t: MockTransform, index: number) {
		this.#items.splice(index, 0, t);
		return t;
	}
	removeItem(i: number) {
		this.#items.splice(i, 1);
	}
}

function mockSvgRect(existing: MockTransform[]) {
	const list = new MockTransformList();
	for (const t of existing) list.appendItem(t);
	const node = Object.create(SVGElement.prototype) as SVGGraphicsElement;
	Object.defineProperty(node, 'transform', { value: { baseVal: list } });
	Object.defineProperty(node, 'ownerSVGElement', {
		value: { createSVGTransform: () => new MockTransform() },
	});
	return { node, list };
}

function ctxFor(node: SVGGraphicsElement): DragCtx {
	return {
		offset: { x: 40, y: 50 },
		isDragging: true,
		rootNode: node,
		session: { visual: { node } },
	} as DragCtx;
}

describe('applyDragTransform SVG', () => {
	it('updates translate item without removing scale transform', () => {
		const scale = new MockTransform();
		scale.type = SVG_TRANSFORM_SCALE;
		const translate = new MockTransform();
		const { node, list } = mockSvgRect([scale, translate]);

		applyDragTransform(ctxFor(node));

		expect(list.numberOfItems).toBe(2);
		expect(list.getItem(0).type).toBe(SVG_TRANSFORM_SCALE);
		expect(list.getItem(1).matrix.e).toBe(40);
		expect(list.getItem(1).matrix.f).toBe(50);
	});

	it('inserts translate when none exists', () => {
		const scale = new MockTransform();
		scale.type = SVG_TRANSFORM_SCALE;
		const { node, list } = mockSvgRect([scale]);

		applyDragTransform(ctxFor(node));

		expect(list.numberOfItems).toBe(2);
		expect(list.getItem(0).type).toBe(SVG_TRANSFORM_TRANSLATE);
		expect(list.getItem(1).type).toBe(SVG_TRANSFORM_SCALE);
	});
});

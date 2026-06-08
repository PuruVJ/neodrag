import { describe, expect, test } from 'vitest';
import { DRAG_MARKUP_STATE } from '@neodrag/core/internal';
import { NEODRAG_ATTACH_KEY } from '../src/attachments.ts';
import { Draggable } from '../src/draggable.ts';

describe('@neodrag/vue target API', () => {
	test('Draggable target is stable and markup-only keys', () => {
		const drag = new Draggable({ plugins: [] });
		expect(drag.target).toBe(drag.target);
		expect(drag.isDragging).toBe(false);
		expect(Object.hasOwn(drag.target, 'isDragging')).toBe(false);
		expect(drag.target.draggable).toBe('false');
		expect(drag.target[DRAG_MARKUP_STATE]).toBe('idle');
		expect(drag.target[NEODRAG_ATTACH_KEY]).toBeTypeOf('function');
	});
});

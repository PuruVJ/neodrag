import { Draggable } from '@neodrag/core/draggable';
import { position } from '@neodrag/core/plugins';
export const binding = new Draggable({ plugins: [position({ current: { x: 0, y: 0 } })] });
import { Draggable } from '@neodrag/core';
import { position } from '@neodrag/core/plugins';
const d = new Draggable({ plugins: [position({ current: { x: 0, y: 0 } })] });
export { d };

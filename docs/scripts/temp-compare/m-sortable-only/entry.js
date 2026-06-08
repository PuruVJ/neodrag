import { Neodrag } from '@neodrag/core';
import { Sortable } from '@neodrag/core/sortable';
export const e = new Neodrag(); new Sortable({ items: () => [], getKey: i => i.id });

import { Neodrag, Sortable } from '@neodrag/core';
const e = new Neodrag(); const s = new Sortable({ items: () => [], getKey: (i) => i.id });
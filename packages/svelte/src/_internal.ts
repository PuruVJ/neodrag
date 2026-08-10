import type { Attachment } from 'svelte/attachments';
import type { DndNode } from '@neodrag/core';

/** The shape a reactive wrapper's `.attach` (and `.row(key)`) produces — a Svelte attachment keyed
 *  by a unique symbol, spread onto an element with `{...wrapper.attach}`. */
export type AttachProps = { [key: symbol]: Attachment<DndNode> };

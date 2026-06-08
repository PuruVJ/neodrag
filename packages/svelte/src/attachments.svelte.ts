import { createAttachmentKey, type Attachment } from 'svelte/attachments';

export const NEODRAG_ATTACH_KEY = createAttachmentKey();

export type NeodragAttachBinding = {
	[NEODRAG_ATTACH_KEY]: Attachment<HTMLElement | SVGElement>;
};

export type NeodragElementProps = NeodragAttachBinding & Record<string, unknown>;

/** @deprecated Use `NeodragElementProps` */
export type NeodragSpreadProps = NeodragElementProps;

export interface DraggableTargetOptions {}

export interface DroppableZoneOptions {}

export interface ResizableFrameOptions {}

export function propsWithAttachment(
	attachment: Attachment<HTMLElement | SVGElement>,
	extra?: Record<string, unknown>,
): NeodragElementProps {
	return { ...extra, [NEODRAG_ATTACH_KEY]: attachment };
}

export function bindingProps(binding: NeodragAttachBinding): NeodragElementProps {
	return propsWithAttachment(binding[NEODRAG_ATTACH_KEY]);
}

/** @deprecated Use `bindingProps` */
export const bindingSpread = bindingProps;

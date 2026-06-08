import type { RefCallback } from 'react';

export const NEODRAG_ATTACH_KEY = Symbol.for('neodrag.attach');

export type NeodragAttachFn = (element: HTMLElement | SVGElement | null) => void | (() => void);

export type NeodragAttachBinding = {
	[NEODRAG_ATTACH_KEY]: NeodragAttachFn;
};

export type NeodragElementProps = NeodragAttachBinding & Record<string, unknown>;

export interface DraggableTargetOptions {}

export interface DroppableZoneOptions {}

export interface ResizableFrameOptions {}

export function propsWithAttachment(
	attach: NeodragAttachFn,
	extra?: Record<string, unknown>,
): NeodragElementProps {
	return { ...extra, [NEODRAG_ATTACH_KEY]: attach };
}

export function bindingProps(binding: NeodragAttachBinding): NeodragElementProps {
	return propsWithAttachment(binding[NEODRAG_ATTACH_KEY]);
}

export function neodragRef(attach: NeodragAttachFn): RefCallback<HTMLElement | SVGElement> {
	return (element) => {
		attach(element);
	};
}

export function targetSpreadProps(
	target: NeodragElementProps,
): Record<string, unknown> & { ref: RefCallback<HTMLElement | SVGElement> } {
	const attach = target[NEODRAG_ATTACH_KEY];
	const { [NEODRAG_ATTACH_KEY]: _attach, ...rest } = target;
	return {
		...rest,
		ref: neodragRef(attach),
	};
}

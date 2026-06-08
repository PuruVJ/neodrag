import type { ComponentPublicInstance, Ref } from 'vue';

export const NEODRAG_ATTACH_KEY = Symbol.for('neodrag.attach');

export type NeodragAttachFn = (element: HTMLElement | SVGElement | null) => void;

export type NeodragAttachBinding = {
	[NEODRAG_ATTACH_KEY]: NeodragAttachFn;
};

export type NeodragElementProps = NeodragAttachBinding & Record<string, unknown>;

export type NeodragTargetBind = Record<string, unknown> & {
	ref: (el: Element | ComponentPublicInstance | null) => void;
};

export function toTargetBind(target: NeodragElementProps): NeodragTargetBind {
	const attach = target[NEODRAG_ATTACH_KEY];
	const { [NEODRAG_ATTACH_KEY]: _attach, ...attrs } = target;
	return {
		...attrs,
		ref: (el) => {
			if (el === null) {
				attach(null);
				return;
			}
			const node =
				el instanceof HTMLElement || el instanceof SVGElement
					? el
					: ((el as ComponentPublicInstance).$el as HTMLElement | SVGElement | null);
			attach(node);
		},
	};
}

export function propsWithAttachment(
	attach: NeodragAttachFn,
	extra?: Record<string, unknown>,
): NeodragElementProps {
	return { ...extra, [NEODRAG_ATTACH_KEY]: attach };
}

export function bindingProps(binding: NeodragAttachBinding): NeodragElementProps {
	return propsWithAttachment(binding[NEODRAG_ATTACH_KEY]);
}

export function targetBindRef(bind: Ref<NeodragTargetBind>) {
	return bind;
}

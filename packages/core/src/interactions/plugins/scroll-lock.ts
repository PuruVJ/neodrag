import { get_node_style, set_node_key_style } from '../../utils.ts';
import { defineDragPlugin } from '../types.ts';
import { SCROLL_LOCK_KEY } from './keys.ts';

export const scrollLock = defineDragPlugin(
	(
		options: {
			lockAxis?: 'x' | 'y' | 'both';
			container?: HTMLElement | (() => HTMLElement);
			allowScrollbar?: boolean;
		} | null = {},
	) => ({
		key: SCROLL_LOCK_KEY,
		name: 'neodrag:scrollLock',
		phase: 'pre',

		init() {
			return {
				config: {
					lockAxis: options?.lockAxis ?? 'both',
					container: options?.container ?? document.documentElement,
					allowScrollbar: options?.allowScrollbar ?? false,
				},
				originalStyles: new Map<
					HTMLElement,
					{ userSelect: string; touchAction: string; overflow: string }
				>(),
			};
		},

		start(ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			ctx.effect(() => {
				const target = container instanceof HTMLElement ? container : document.body;
				state.originalStyles.set(target, {
					userSelect: get_node_style(target, 'user-select'),
					touchAction: get_node_style(target, 'touch-action'),
					overflow: get_node_style(target, 'overflow'),
				});

				set_node_key_style(target, 'user-select', 'none');

				if (!state.config.allowScrollbar) {
					set_node_key_style(target, 'overflow', 'hidden');
				}

				if (state.config.lockAxis === 'x' || state.config.lockAxis === 'both') {
					set_node_key_style(target, 'touch-action', 'pan-y');
				} else if (state.config.lockAxis === 'y') {
					set_node_key_style(target, 'touch-action', 'pan-x');
				}
			});
		},

		end(ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			ctx.effect(() => {
				const target = container instanceof HTMLElement ? container : document.body;
				const original = state.originalStyles.get(target);
				if (original) {
					set_node_key_style(target, 'user-select', original.userSelect);
					set_node_key_style(target, 'touch-action', original.touchAction);
					set_node_key_style(target, 'overflow', original.overflow);
				}
				state.originalStyles.delete(target);
			});
		},

		destroy(_ctx, state) {
			for (const [element, styles] of state.originalStyles) {
				set_node_key_style(element, 'user-select', styles.userSelect);
				set_node_key_style(element, 'touch-action', styles.touchAction);
				set_node_key_style(element, 'overflow', styles.overflow);
			}
			state.originalStyles.clear();
		},
	}),
);

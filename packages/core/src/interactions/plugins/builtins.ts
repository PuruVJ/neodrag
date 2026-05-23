import { get_node_style, set_node_dataset, set_node_key_style } from '../../utils.ts';
import type { DragPlugin } from '../types.ts';
import {
	APPLY_USER_SELECT_KEY,
	IGNORE_MULTITOUCH_KEY,
	STATE_MARKER_KEY,
	TOUCH_ACTION_KEY,
} from './keys.ts';

type MultitouchState = { active_pointers: Set<number> };
type StateMarkerState = { count: number };
type UserSelectState = { body_user_select_val: string };

export const ignoreMultitouch: DragPlugin<MultitouchState> = {
	key: IGNORE_MULTITOUCH_KEY,
	name: 'ignoreMultitouch',

	init() {
		return { active_pointers: new Set<number>() };
	},

	start(ctx, state, event) {
		ctx.effect(() => {
			state.active_pointers.add(event.pointerId);
			if (state.active_pointers.size > 1) event.preventDefault();
		});
	},

	drag(ctx, state) {
		if (state.active_pointers.size > 1) ctx.cancel();
	},

	end(_ctx, state, event) {
		state.active_pointers.delete(event.pointerId);
	},
};

export const stateMarker: DragPlugin<StateMarkerState> = {
	key: STATE_MARKER_KEY,
	name: 'stateMarker',
	phase: 'post',
	skipOnCancel: true,

	init(ctx) {
		set_node_dataset(ctx.rootNode, 'neodrag', '');
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', '0');
		return { count: 0 };
	},

	start(ctx) {
		ctx.effect(() => set_node_dataset(ctx.rootNode, 'neodrag-state', 'dragging'));
	},

	end(ctx, state) {
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', String(++state.count));
	},
};

export const applyUserSelectHack: DragPlugin<UserSelectState> = {
	key: APPLY_USER_SELECT_KEY,
	name: 'applyUserSelectHack',
	phase: 'post',
	skipOnCancel: true,

	init() {
		return { body_user_select_val: '' };
	},

	start(ctx, state) {
		ctx.effect(() => {
			state.body_user_select_val =
				get_node_style(document.body, 'user-select') ??
				document.body.style.webkitUserSelect ??
				'';
			set_node_key_style(document.body, 'user-select', 'none');
			document.body.style.webkitUserSelect = 'none';
		});
	},

	end(_ctx, state) {
		set_node_key_style(document.body, 'user-select', state.body_user_select_val);
		document.body.style.webkitUserSelect = state.body_user_select_val;
	},
};

export const touchAction: DragPlugin = {
	key: TOUCH_ACTION_KEY,
	name: 'touchAction',
	phase: 'pre',

	init(ctx) {
		ctx.effect(() => set_node_key_style(ctx.rootNode, 'touch-action', 'none'));
	},
};

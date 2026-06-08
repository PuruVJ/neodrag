import { createSessionKey } from './types.ts';

export const SORTABLE_DROP_KEY = Symbol('neodrag.sortable.container');
export const SORTABLE_VISUAL_RELEASE_KEY = createSessionKey<Promise<void>>();
export const SORTABLE_VISUAL_RELEASE_DONE_KEY = createSessionKey<() => void>();
export const SORTABLE_GROUP_DROP_PLAN_KEY = createSessionKey<{
	plan: { kind: string };
	stickyTargetId: symbol | null;
	lastPointerX: number;
	lastPointerY: number;
}>();
export const SORTABLE_GROUP_DROP_HANDLED_KEY = createSessionKey<true>();
export const SORTABLE_PENDING_GROUP_COMMIT_KEY = createSessionKey<unknown>();

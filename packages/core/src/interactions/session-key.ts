import type { SessionKey } from './types.ts';

export function createSessionKey<T>(): SessionKey<T> {
	return { __brand: undefined as T, id: Symbol('neodrag.sessionKey') };
}

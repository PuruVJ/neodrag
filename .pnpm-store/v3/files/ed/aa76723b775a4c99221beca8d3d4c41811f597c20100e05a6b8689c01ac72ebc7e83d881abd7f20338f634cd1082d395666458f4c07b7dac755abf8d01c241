export type Message = string | Error;

export type PROLOAD_ERROR_CODE = 'ERR_PROLOAD_INVALID' | 'ERR_PROLOAD_NOT_FOUND';

export class ProloadError extends Error {
	name: 'ProloadError';
	code: PROLOAD_ERROR_CODE;
	message: string;
	constructor(options?: {
		message: string;
		code?: string
	});
}

export function assert(condition: boolean, message: Message, code?: PROLOAD_ERROR_CODE): asserts condition;

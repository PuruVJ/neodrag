import { browser } from '$helpers/utils.ts';
import { parse, type ZodMiniType } from 'zod/v4-mini';

export type Serde = {
	stringify: (value: unknown) => string;
	parse: (value: string) => unknown;
};

const default_serde: Serde = {
	stringify: (value) => JSON.stringify(value),
	parse: (value) => JSON.parse(value),
};

type ExtractZodType<T> = T extends ZodMiniType<infer U> ? U : never;

function get_value_from_storage(key: string, shape: ZodMiniType<any>, serde = default_serde) {
	const value = localStorage.getItem(key);

	if (!value) return { found: false, value: null };

	try {
		return {
			found: true,
			value: parse(shape, serde.parse(value)),
		};
	} catch {
		localStorage.removeItem(key);

		return {
			found: false,
			value: null,
		};
	}
}

export class Persisted<T extends ZodMiniType> {
	#current = $state<ExtractZodType<T>>(undefined as ExtractZodType<T>);
	#key: string;
	#shape: T;
	#serde: Serde;

	constructor(key: string, initial: ExtractZodType<T>, shape: T, serde = default_serde) {
		this.#current = initial;
		this.#key = key;
		this.#shape = shape;
		this.#serde = serde;

		if (browser) {
			this.reload_from_storage();
		}
	}

	reload_from_storage() {
		if (!browser) return;

		const val = get_value_from_storage(this.#key, this.#shape, this.#serde);
		if (val.found) {
			this.#current = val.value;
		}
	}

	get current() {
		return this.#current;
	}

	set current(value: ExtractZodType<T>) {
		this.#current = value;

		if (browser) {
			localStorage.setItem(this.#key, this.#serde.stringify(value));
		}
	}
}

import { browser } from '$helpers/utils.ts';
import * as devalue from 'devalue';
import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';
import { auto_destroy_effect_root } from './auto-destroy-effect-root.svelte.ts';

export type Serde = {
	stringify: (value: any) => string;
	parse: (value: string) => any;
};

const default_serde: Serde = {
	stringify: (value) => devalue.stringify(value),
	parse: (value) => devalue.parse(value),
};

function get_value_from_storage(key: string, serde = default_serde) {
	const value = localStorage.getItem(key);

	if (!value) return { found: false, value: null };

	try {
		return {
			found: true,
			value: serde.parse(value),
		};
	} catch (e) {
		localStorage.removeItem(key);

		return {
			found: false,
			value: null,
		};
	}
}

export class Persisted<T> {
	#current = $state<T>(undefined as T);
	#subscribe: () => void;
	#key: string;

	constructor(key: string, initial: T, serde = default_serde) {
		this.#current = initial;
		this.#key = key;

		if (browser) {
			const val = get_value_from_storage(key, serde);
			if (val.found) {
				this.#current = val.value;
			}
		}

		// Create subscriber that only triggers for this specific key
		this.#subscribe = createSubscriber((update) => {
			return on(window, 'storage', (e: StorageEvent) => {
				if (e.key === this.#key) {
					const val = get_value_from_storage(this.#key, serde);
					if (val.found) {
						this.#current = val.value;
						update();
					}
				}
			});
		});

		auto_destroy_effect_root(() => {
			let is_first_run = true;

			$effect(() => {
				this.#subscribe();

				const current = $state.snapshot(this.#current);
				if (!is_first_run) {
					console.log('SHUD RUn');
					localStorage.setItem(key, serde.stringify(current));
				}

				is_first_run = false;
			});
		});
	}

	get current() {
		return this.#current;
	}

	set current(value: T) {
		this.#current = value;
	}
}

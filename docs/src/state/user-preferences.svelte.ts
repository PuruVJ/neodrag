import { MediaQuery } from 'svelte/reactivity';
import { Persisted } from './persisted.svelte';
import { auto_destroy_effect_root } from './auto-destroy-effect-root.svelte';
import * as z from 'zod/v4/mini';

const schema = z.object({
	current: z.enum(['light', 'dark']),
	preference: z.enum(['system', 'light', 'dark']),
});

export type ThemeValue = z.infer<typeof schema>;

function apply_theme_to_dom(new_theme: string) {
	document.body.dataset.theme = new_theme;
}
class Theme {
	#persisted = new Persisted(
		'neodrag:theme',
		{
			current: 'light',
			preference: 'system',
		},
		schema,
	);
	#media_observer = new MediaQuery('prefers-color-scheme: dark');
	#current = $derived.by(() => {
		this.#media_observer.current;

		if (this.#persisted.current.preference === 'system') {
			return this.#media_observer.current ? 'dark' : 'light';
		}

		return this.#persisted.current.preference;
	});

	constructor() {
		auto_destroy_effect_root(() => {
			$effect(() => {
				this.#current;

				requestAnimationFrame(() => {
					if (document.startViewTransition) {
						document.startViewTransition(async () => {
							apply_theme_to_dom(this.#current);
						});
					} else {
						apply_theme_to_dom(this.#current);
					}
				});
			});
		});
	}

	get current() {
		return this.#current;
	}

	get preference() {
		return this.#persisted.current.preference;
	}

	set preference(value: ThemeValue['preference']) {
		this.#persisted.current.preference = value;

		if (value !== 'system') {
			this.#persisted.current.current = value;
		}
	}
}

export const theme = new Theme();

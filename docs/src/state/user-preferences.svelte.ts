import { browser } from '$helpers/utils';
import { MediaQuery } from 'svelte/reactivity';
import { on } from 'svelte/events';
import * as z from 'zod/v4/mini';
import { Persisted } from './persisted.svelte';

const schema = z.object({
	current: z.enum(['light', 'dark']),
	preference: z.enum(['system', 'light', 'dark']),
});

export type ThemeValue = z.infer<typeof schema>;

export function apply_theme_to_dom(new_theme: string) {
	if (typeof document === 'undefined') return;

	document.documentElement.dataset.theme = new_theme;
	document.documentElement.style.colorScheme = new_theme;
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

	#runtime_started = false;
	#stop_runtime: (() => void) | null = null;

	start_runtime() {
		if (!browser || this.#runtime_started) return;
		this.#runtime_started = true;

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const on_media = () => apply_theme_to_dom(this.#current);

		media.addEventListener('change', on_media);
		const stop_storage = on(window, 'storage', (e) => {
			if (e.key === 'neodrag:theme') {
				this.#persisted.reload_from_storage();
				apply_theme_to_dom(this.#current);
			}
		});

		this.#stop_runtime = () => {
			media.removeEventListener('change', on_media);
			stop_storage();
		};
	}

	stop_runtime() {
		this.#stop_runtime?.();
		this.#stop_runtime = null;
		this.#runtime_started = false;
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

		if (browser && this.#runtime_started) {
			apply_theme_to_dom(this.#current);
		}
	}
}

export const theme = new Theme();

export function init_theme_runtime() {
	theme.start_runtime();
}

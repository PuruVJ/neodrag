import { browser } from '$helpers/utils.ts';
import { auto_destroy_effect_root } from './auto-destroy-effect-root.svelte.ts';

type Primitive = string | null | symbol | boolean | number | undefined | bigint;

const is_primitive = (val: any): val is Primitive => {
	return val !== Object(val) || val === null;
};

function get_value_from_storage(key: string) {
	const value = localStorage.getItem(key);

	if (value === null) return { found: false, value: null };

	try {
		return {
			found: true,
			value: JSON.parse(value),
		};
	} catch (e) {
		console.error(`Error when parsing ${value} from persisted store "${key}"`, e);
		return {
			found: false,
			value: null,
		};
	}
}

export function persisted<T>(key: string, initial: T) {
	const existing = browser ? localStorage.getItem(key) : JSON.stringify(initial);

	const primitive = is_primitive(initial);
	const parsed_value = existing ? JSON.parse(existing) : initial;

	let state = $state<T extends Primitive ? { current: T } : T>(
		primitive ? { current: parsed_value } : parsed_value,
	);

	auto_destroy_effect_root(() => {
		$effect(() => {
			const controller = new AbortController();

			addEventListener(
				'storage',
				(event) => {
					if (event.key === key) {
						const val = get_value_from_storage(key);
						if (val.found) {
							state = primitive ? { current: val.value } : val.value;
						}
					}
				},
				{ signal: controller.signal },
			);

			return () => controller.abort();
		});

		$effect(() => {
			localStorage.setItem(
				key,
				// @ts-ignore
				JSON.stringify(primitive ? state.current : state),
			);
		});
	});

	return state;
}

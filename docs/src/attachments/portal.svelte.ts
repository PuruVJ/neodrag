import { auto_destroy_effect_root } from '$state/auto-destroy-effect-root.svelte';
import { tick } from 'svelte';
import type { Attachment } from 'svelte/attachments';

export const portal =
	(target: HTMLElement | string = 'body'): Attachment<HTMLElement> =>
	(node) => {
		let target_el: HTMLElement;

		async function update(new_target: HTMLElement | string) {
			target = new_target;

			if (typeof target === 'string') {
				target_el = document.querySelector(target)!;

				if (target_el === null) {
					await tick();
					target_el = document.querySelector(target)!;
				}

				if (target_el === null) {
					throw new Error(`No element found matching css selector: "${target}"`);
				}
			} else if (target instanceof HTMLElement) {
				target_el = target;
			} else {
				throw new TypeError(
					`Unknown portal target type: ${
						target === null ? 'null' : typeof target
					}. Allowed types: string (CSS selector) or HTMLElement.`,
				);
			}
			target_el.appendChild(node);
			node.hidden = false;
		}

		function destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}

		$effect(() => {
			update(target);
		});

		return destroy;
	};

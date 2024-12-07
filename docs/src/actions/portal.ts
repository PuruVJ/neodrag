import { tick } from 'svelte';

/**
 * Usage: <div use:portal={'css selector'}> or <div use:portal={document.body}>
 *
 * @param {HTMLElement} el
 * @param {HTMLElement|string} target DOM Element or CSS Selector
 */
export function portal(el: HTMLElement, target: HTMLElement | string = 'body') {
	let targetEl: HTMLElement;

	async function update(newTarget: HTMLElement | string) {
		target = newTarget;

		if (typeof target === 'string') {
			targetEl = document.querySelector(target)!;

			if (targetEl === null) {
				await tick();
				targetEl = document.querySelector(target)!;
			}

			if (targetEl === null) {
				throw new Error(`No element found matching css selector: "${target}"`);
			}
		} else if (target instanceof HTMLElement) {
			targetEl = target;
		} else {
			throw new TypeError(
				`Unknown portal target type: ${
					target === null ? 'null' : typeof target
				}. Allowed types: string (CSS selector) or HTMLElement.`,
			);
		}
		targetEl.appendChild(el);
		el.hidden = false;
	}

	function destroy() {
		if (el.parentNode) {
			el.parentNode.removeChild(el);
		}
	}

	update(target);

	return {
		update,
		destroy,
	};
}

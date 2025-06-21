import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

export const interact_outside =
	(callback: (event: Event) => void): Attachment<HTMLElement> =>
	(node) => {
		const handleInteraction = (event: Event) => {
			if (!node.contains(event.target as Node)) {
				callback(event);
			}
		};

		const controller = new AbortController();

		// Listen for various interaction events
		on(document, 'click', handleInteraction, {
			capture: true,
			signal: controller.signal,
		});
		on(document, 'mousedown', handleInteraction, {
			capture: true,
			signal: controller.signal,
		});
		on(document, 'touchstart', handleInteraction, {
			capture: true,
			signal: controller.signal,
		});

		return () => {
			controller.abort();
		};
	};

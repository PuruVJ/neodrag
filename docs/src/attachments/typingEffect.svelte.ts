import type { Attachment } from 'svelte/attachments';

export const typingEffect =
	(speed: number): Attachment<HTMLElement> =>
	(node) => {
		const text = node.innerHTML;

		node.innerHTML = '';

		let i = 0;
		const timer = setInterval(() => {
			if (i < text.length) node.append(text.charAt(i++));
		}, speed);

		return () => clearInterval(+timer);
	};

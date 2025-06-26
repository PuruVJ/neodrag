import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

export interface CopyCallbackParams {
	/**
	 * The text that was copied to clipboard
	 */
	text: string;
}
export type CopyCallback = (params: CopyCallbackParams) => void;

export const copy =
	({ onCopy, text }: { text: string; onCopy: CopyCallback }): Attachment =>
	(node) => {
		const handle = async () => {
			try {
				await navigator.clipboard.writeText(text);
				onCopy({ text });
			} catch (e) {
				// onerror at some point
			}
		};

		return on(node, 'click', handle, { capture: true });
	};

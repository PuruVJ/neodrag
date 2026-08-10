/**
 * Suppress text selection on the document while an interaction is mid-flight — the "user-select
 * hack". Shared by every interaction (drag, resize, sortable, …) so any of them can opt in with a
 * `userSelect` option.
 *
 * Refcounted, hence stateful: the body's original `user-select` is saved once, on the first claim,
 * and restored once, on the last release. That keeps two concurrent interactions (a drag in one
 * widget, a resize in another) from clearing the hack out from under each other. Pair every `apply`
 * with exactly one `release` — callers that didn't apply (option turned off) must NOT release.
 */
export class UserSelectHack {
	#claims = 0;
	#saved_body_user_select = '';

	/** Claim the hack. Sets `user-select: none` on the body the first time it's held. */
	apply(): void {
		if (typeof document === 'undefined') return;
		if (this.#claims === 0) {
			const body = document.body;
			this.#saved_body_user_select = body.style.userSelect;
			body.style.userSelect = 'none';
			body.style.setProperty('-webkit-user-select', 'none');
		}
		this.#claims += 1;
	}

	/** Release one claim. Restores the body's original `user-select` once the last claim drops. */
	release(): void {
		if (typeof document === 'undefined' || this.#claims === 0) return;
		this.#claims -= 1;
		if (this.#claims === 0) {
			const body = document.body;
			body.style.userSelect = this.#saved_body_user_select;
			body.style.removeProperty('-webkit-user-select');
		}
	}
}

/** Process-wide singleton — one body, one shared refcount across every interaction. */
export const userSelectHack = new UserSelectHack();

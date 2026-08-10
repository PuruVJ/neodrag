import type { CollabOp, PresenceFrame } from '@neodrag/svelte/collab';
import { createDebug } from '$helpers/debug';

const MIRROR_SEL = '[data-neodrag-sortable-remote-mirror]';

/**
 * Dev-only instrumentation for the RealtimeCollab scenario — logs presence/ops/commits and samples the
 * mirror clone's position to `docs/.debug/collab.log` (see `$helpers/debug` + `docs/debug-log-plugin.ts`).
 *
 * **Tree-shaking:** the scenario constructs this only via `import.meta.env.DEV ? createCollabDebug() : null`.
 * Vite replaces `import.meta.env.DEV` with `false` in `astro build`, so the ternary folds to `null`,
 * `createCollabDebug` becomes unreferenced, and Rollup drops this module + `$helpers/debug` (and its
 * `fetch`/queue machinery) from the production bundle. The call sites stay as cheap `debug?.…` no-ops.
 */
export function createCollabDebug() {
	const dbg = createDebug('collab');
	let started = false;
	const ensure = () => {
		if (started) return;
		started = true;
		dbg.clear(); // fresh session on the first real event of a page load
	};

	return {
		reorder(label: string, order: string[]): void {
			dbg.log(`peer-${label}`, 'onReorder (commit)', { order });
		},
		op(label: string, op: CollabOp): void {
			ensure();
			dbg.log(`peer-${label}`, 'remote op applied', op);
		},
		presence(label: string, frame: PresenceFrame | null): void {
			ensure();
			if (frame?.type === 'sortable') {
				dbg.log(`peer-${label}`, 'presence in', { insertIndex: frame.insertIndex, rel: frame.rel, from: frame.peerId });
			} else {
				dbg.log(`peer-${label}`, frame ? `presence in (${frame.type})` : 'presence END', frame ?? undefined);
			}
		},
		/** Per-frame sampler of the mirror clone's position (captures live tracking + the commit glide). */
		sampleMirror(label: string, mountEl: () => HTMLElement | undefined): () => void {
			let raf = 0;
			let last = '';
			const tick = () => {
				const clone = mountEl()?.querySelector<HTMLElement>(MIRROR_SEL);
				if (clone) {
					const sig = `${clone.style.left}|${clone.style.top}`;
					if (sig !== last) {
						last = sig;
						const r = clone.getBoundingClientRect();
						dbg.log(`peer-${label}`, 'clone pos', {
							left: clone.style.left,
							top: clone.style.top,
							x: Math.round(r.x),
							y: Math.round(r.y),
						});
					}
				} else if (last) {
					last = '';
					dbg.log(`peer-${label}`, 'clone gone', {});
				}
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
			return () => cancelAnimationFrame(raf);
		},
	};
}

export type CollabDebug = ReturnType<typeof createCollabDebug>;

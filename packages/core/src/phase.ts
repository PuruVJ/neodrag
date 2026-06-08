import type { PluginPhase } from './types.ts';

const PHASE_ORDER = { pre: 0, resolve: 1, post: 2 } as const;

export function phaseChain<T>(pre: T[], resolve: T[], post: T[]): T[] {
	return pre.length + resolve.length + post.length === 0 ? [] : [...pre, ...resolve, ...post];
}

export function pushByPhase<T>(pre: T[], resolve: T[], post: T[], phase: PluginPhase, item: T) {
	if (phase === 'pre') pre.push(item);
	else if (phase === 'post') post.push(item);
	else resolve.push(item);
}

export function sortByPhase<P extends { phase?: PluginPhase }>(plugins: readonly P[]): P[] {
	return [...plugins].sort(
		(a, b) => (PHASE_ORDER[a.phase ?? 'resolve'] ?? 1) - (PHASE_ORDER[b.phase ?? 'resolve'] ?? 1),
	);
}

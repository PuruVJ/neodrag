import { isLengthAdapter } from '../length-contract.ts';
import type { LengthAdapter } from '../length-runtime.ts';

export function defineLengthAdapter(impl: LengthAdapter): LengthAdapter {
	if (!isLengthAdapter(impl)) {
		throw new Error('Neodrag: defineLengthAdapter requires a complete LengthAdapter');
	}
	return impl;
}

export function delegateLengthAdapter(
	base: LengthAdapter,
	partial: Partial<LengthAdapter>,
): LengthAdapter {
	return {
		get units() {
			return partial.units ?? base.units;
		},
		resolvePx(value, ctx) {
			return partial.resolvePx?.(value, ctx) ?? base.resolvePx(value, ctx);
		},
		readAuthoredPair(node) {
			return partial.readAuthoredPair?.(node) ?? base.readAuthoredPair(node);
		},
		commitAuthored(px, preserve, node) {
			return (
				partial.commitAuthored?.(px, preserve, node) ?? base.commitAuthored(px, preserve, node)
			);
		},
		cloneAuthored(pair) {
			return partial.cloneAuthored?.(pair) ?? base.cloneAuthored(pair);
		},
	};
}

import { describe, expectTypeOf, it } from 'vitest';
import type { CssLengthString, SizeInput } from '../../src/length-types.ts';

describe('CssLengthString types', () => {
	it('accepts supported single-value lengths', () => {
		expectTypeOf('10px').toExtend<CssLengthString>();
		expectTypeOf('1.5rem').toExtend<CssLengthString>();
		expectTypeOf('-12px').toExtend<CssLengthString>();
		expectTypeOf('50%').toExtend<CssLengthString>();
		expectTypeOf('92vw').toExtend<CssLengthString>();
		expectTypeOf('82vh').toExtend<CssLengthString>();
		expectTypeOf('10dvh').toExtend<CssLengthString>();
	});

	it('rejects unsupported CSS expressions and units', () => {
		expectTypeOf('min(92vw, 720px)').not.toExtend<CssLengthString>();
		expectTypeOf('1fr').not.toExtend<CssLengthString>();
		expectTypeOf('10 px').not.toExtend<CssLengthString>();
		expectTypeOf('auto').not.toExtend<CssLengthString>();
	});

	it('SizeInput includes numbers and typed lengths', () => {
		expectTypeOf(120).toExtend<SizeInput>();
		expectTypeOf('12rem').toExtend<SizeInput>();
		expectTypeOf('bad').not.toExtend<SizeInput>();
	});
});

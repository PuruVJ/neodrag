import type * as ts from 'typescript/lib/tsserverlibrary';
import { ResolvedVueCompilerOptions } from '../types';
export declare function walkInterpolationFragment(ts: typeof import('typescript/lib/tsserverlibrary'), code: string, ast: ts.SourceFile, cb: (fragment: string, offset: number | undefined, isJustForErrorMapping?: boolean) => void, localVars: Record<string, number>, identifiers: Set<string>, vueOptions: ResolvedVueCompilerOptions): {
    text: string;
    isShorthand: boolean;
    offset: number;
}[];
export declare function colletVars(ts: typeof import('typescript/lib/tsserverlibrary'), node: ts.Node, result: string[]): void;

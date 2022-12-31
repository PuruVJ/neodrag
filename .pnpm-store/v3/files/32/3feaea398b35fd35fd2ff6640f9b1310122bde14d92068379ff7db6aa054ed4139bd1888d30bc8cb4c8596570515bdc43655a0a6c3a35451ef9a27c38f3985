import type * as ts from 'typescript/lib/tsserverlibrary';
import type { TextRange } from '../types';
export interface ScriptSetupRanges extends ReturnType<typeof parseUnuseScriptSetupRanges> {
}
interface PropTypeArg {
    name: TextRange;
    type: TextRange;
    required: boolean;
    default: TextRange | undefined;
}
interface EmitTypeArg {
    name: TextRange;
    restArgs: TextRange | undefined;
}
export declare function parseUnuseScriptSetupRanges(ts: typeof import('typescript/lib/tsserverlibrary'), ast: ts.SourceFile): {
    imports: TextRange[];
    defineProps: {
        range: TextRange;
        binding: TextRange | undefined;
        typeArgs: PropTypeArg[];
    } | {
        range: TextRange;
        binding: TextRange | undefined;
        args: TextRange;
    } | undefined;
    defineEmits: {
        range: TextRange;
        binding: TextRange | undefined;
        typeArgs: EmitTypeArg[];
    } | {
        range: TextRange;
        binding: TextRange | undefined;
        args: TextRange;
    } | undefined;
    useSlots: {
        range: TextRange;
        binding: TextRange | undefined;
    } | undefined;
    useAttrs: {
        range: TextRange;
        binding: TextRange | undefined;
    } | undefined;
    bindings: TextRange[];
};
export declare function parseUseScriptSetupRanges(ts: typeof import('typescript/lib/tsserverlibrary'), ast: ts.SourceFile): {
    imports: TextRange[];
    exportDefault: TextRange | undefined;
    propsOption: TextRange | undefined;
    emitsOption: TextRange | undefined;
    setupOption: {
        props: TextRange | undefined;
        context: TextRange | {
            emit: TextRange | undefined;
            slots: TextRange | undefined;
            attrs: TextRange | undefined;
        } | undefined;
        body: TextRange;
        bodyReturn: TextRange | undefined;
    } | undefined;
    otherOptions: TextRange[];
    otherScriptStatements: TextRange[];
};
export {};

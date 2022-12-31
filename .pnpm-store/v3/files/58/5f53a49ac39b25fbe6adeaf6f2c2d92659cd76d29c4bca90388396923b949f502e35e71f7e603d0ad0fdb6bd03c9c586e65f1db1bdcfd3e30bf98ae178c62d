import { Segment } from '@volar/source-map';
import type { FileRangeCapabilities, MirrorBehaviorCapabilities } from '@volar/language-core';
import * as SourceMaps from '@volar/source-map';
import type * as ts from 'typescript/lib/tsserverlibrary';
import type * as templateGen from '../generators/template';
import type { ScriptRanges } from '../parsers/scriptRanges';
import type { ScriptSetupRanges } from '../parsers/scriptSetupRanges';
import { collectCssVars, collectStyleCssClasses } from '../plugins/vue-tsx';
import { Sfc } from '../types';
import type { ResolvedVueCompilerOptions } from '../types';
export declare function generate(ts: typeof import('typescript/lib/tsserverlibrary'), fileName: string, sfc: Sfc, lang: string, scriptRanges: ScriptRanges | undefined, scriptSetupRanges: ScriptSetupRanges | undefined, cssVars: ReturnType<typeof collectCssVars>, cssModuleClasses: ReturnType<typeof collectStyleCssClasses>, cssScopedClasses: ReturnType<typeof collectStyleCssClasses>, htmlGen: ReturnType<typeof templateGen['generate']> | undefined, compilerOptions: ts.CompilerOptions, vueCompilerOptions: ResolvedVueCompilerOptions, codeGen?: Segment<FileRangeCapabilities>[], mirrorBehaviorMappings?: SourceMaps.Mapping<[MirrorBehaviorCapabilities, MirrorBehaviorCapabilities]>[]): {
    codeGen: SourceMaps.SegmentWithData<FileRangeCapabilities>[];
    extraMappings: SourceMaps.Mapping<any>[];
    mirrorBehaviorMappings: SourceMaps.Mapping<[MirrorBehaviorCapabilities, MirrorBehaviorCapabilities]>[];
};

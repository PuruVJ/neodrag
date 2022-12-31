import { P as Preset, I as Import, B as BuiltinPresetName, a as InlinePreset, T as TypeDeclarationOptions, S as ScanDirExportsOptions, U as UnimportOptions, b as Thenable, c as InjectImportsOptions, d as InstallGlobalOptions } from './types-e4738ae5.js';
export { l as Addon, A as AddonsOptions, B as BuiltinPresetName, I as Import, g as ImportCommon, f as ImportName, c as InjectImportsOptions, a as InlinePreset, d as InstallGlobalOptions, M as ModuleId, i as PackagePreset, k as PathFromResolver, P as Preset, h as PresetImport, S as ScanDirExportsOptions, b as Thenable, T as TypeDeclarationOptions, j as UnimportContext, U as UnimportOptions, e as builtinPresets } from './types-e4738ae5.js';
import MagicString from 'magic-string';
import * as mlly from 'mlly';

declare function resolvePreset(preset: Preset): Promise<Import[]>;
declare function resolveBuiltinPresets(presets: (BuiltinPresetName | Preset)[]): Promise<Import[]>;

declare const excludeRE: RegExp[];
declare const importAsRE: RegExp;
declare const separatorRE: RegExp;
/**                                                           |       |
 *                    destructing   case&ternary    non-call  |  id   |
 *                         ↓             ↓             ↓      |       |*/
declare const matchRE: RegExp;
declare function stripCommentsAndStrings(code: string): string;
declare function defineUnimportPreset(preset: InlinePreset): InlinePreset;
declare function toImports(imports: Import[], isCJS?: boolean): string;
declare function dedupeImports(imports: Import[], warn: (msg: string) => void): Import[];
declare function toExports(imports: Import[], fileDir?: string): string;
declare function toTypeDeclarationItems(imports: Import[], options?: TypeDeclarationOptions): string[];
declare function toTypeDeclarationFile(imports: Import[], options?: TypeDeclarationOptions): string;
declare function getString(code: string | MagicString): string;
declare function getMagicString(code: string | MagicString): MagicString;
declare function addImportToCode(code: string | MagicString, imports: Import[], isCJS?: boolean, mergeExisting?: boolean): {
    s: MagicString;
    readonly code: string;
};
declare function normalizeImports(imports: Import[]): Import[];
declare function resolveIdAbsolute(id: string, parentId?: string): Promise<any>;

declare function scanDirExports(dir: string | string[], options?: ScanDirExportsOptions): Promise<Import[]>;
declare function scanExports(filepath: string): Promise<Import[]>;

type Unimport = ReturnType<typeof createUnimport>;
declare function createUnimport(opts: Partial<UnimportOptions>): {
    clearDynamicImports: () => void;
    modifyDynamicImports: (fn: (imports: Import[]) => Thenable<void | Import[]>) => Promise<void>;
    getImports: () => Promise<Import[]>;
    detectImports: (code: string | MagicString) => Promise<{
        s: MagicString;
        strippedCode: string;
        isCJSContext: boolean;
        matchedImports: Import[];
    }>;
    injectImports: (code: string | MagicString, id?: string, options?: InjectImportsOptions) => Promise<{
        s: MagicString;
        readonly code: string;
    }>;
    toExports: (filepath?: string) => Promise<string>;
    parseVirtualImports: (code: string) => mlly.ParsedStaticImport[];
    generateTypeDeclarations: (options?: TypeDeclarationOptions) => Promise<string>;
};

declare function installGlobalAutoImports(imports: Import[] | Unimport, options?: InstallGlobalOptions): Promise<any>;

export { Unimport, addImportToCode, createUnimport, dedupeImports, defineUnimportPreset, excludeRE, getMagicString, getString, importAsRE, installGlobalAutoImports, matchRE, normalizeImports, resolveBuiltinPresets, resolveIdAbsolute, resolvePreset, scanDirExports, scanExports, separatorRE, stripCommentsAndStrings, toExports, toImports, toTypeDeclarationFile, toTypeDeclarationItems };

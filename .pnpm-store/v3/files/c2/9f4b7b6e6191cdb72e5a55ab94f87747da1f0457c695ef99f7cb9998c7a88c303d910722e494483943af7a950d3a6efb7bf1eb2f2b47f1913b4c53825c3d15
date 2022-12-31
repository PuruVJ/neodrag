import type * as postcss from 'postcss';
import type { Options as SassOptions, render, renderSync } from 'sass';
import type { Options as PugOptions } from 'pug';
import type { TransformOptions as BabelOptions } from '@babel/core';
declare type ContentModifier = {
    prependData?: string;
    stripIndent?: boolean;
};
declare type MarkupOptions = {
    markupTagName?: string;
};
export declare type Coffeescript = {
    sourceMap?: boolean;
    filename?: never;
    bare?: never;
} & ContentModifier;
export declare type Postcss = postcss.ProcessOptions & {
    plugins?: postcss.AcceptedPlugin[];
    configFilePath?: string;
} & ContentModifier;
export declare type Babel = BabelOptions & {
    sourceType?: 'module';
    minified?: false;
    ast?: false;
    code?: true;
    sourceMaps?: boolean;
} & ContentModifier;
export declare type Pug = Omit<PugOptions, 'filename' | 'doctype' | 'compileDebug'> & ContentModifier & MarkupOptions;
export declare type Sass = Omit<SassOptions, 'file' | 'data'> & {
    implementation?: {
        render: typeof render;
        renderSync: typeof renderSync;
    };
    renderSync?: boolean;
} & ContentModifier;
export declare type Less = {
    paths?: string[];
    plugins?: any[];
    strictImports?: boolean;
    maxLineLen?: number;
    dumpLineNumbers?: 'comment' | string;
    silent?: boolean;
    strictUnits?: boolean;
    globalVars?: Record<string, string>;
    modifyVars?: Record<string, string>;
} & ContentModifier;
export declare type Stylus = {
    globals?: Record<string, any>;
    functions?: Record<string, any>;
    imports?: string[];
    paths?: string[];
    sourcemap?: boolean;
} & ContentModifier;
export declare type Typescript = {
    compilerOptions?: any;
    tsconfigFile?: string | boolean;
    tsconfigDirectory?: string | boolean;
    reportDiagnostics?: boolean;
    handleMixedImports?: boolean;
} & ContentModifier;
export interface GlobalStyle {
    sourceMap: boolean;
}
export declare type Replace = Array<[string | RegExp, string] | [RegExp, (substring: string, ...args: any[]) => string]>;
export {};

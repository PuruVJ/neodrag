import * as Options from './options';
import type { Processed as SvelteProcessed, Preprocessor, PreprocessorGroup } from 'svelte/types/compiler/preprocess';
export { Options };
export { Processed as SvelteProcessed, PreprocessorGroup, Preprocessor, } from 'svelte/types/compiler/preprocess';
export declare type PreprocessorArgs = Preprocessor extends (options: infer T) => any ? T : never;
export declare type TransformerArgs<T> = {
    content: string;
    filename?: string;
    attributes?: Record<string, any>;
    map?: string | object;
    markup?: string;
    dianostics?: unknown[];
    options?: T;
};
export declare type Processed = SvelteProcessed & {
    diagnostics?: any[];
};
export declare type Transformer<T> = (args: TransformerArgs<T>) => Processed | Promise<Processed>;
export declare type TransformerOptions<T = any> = boolean | T | Transformer<T>;
export interface Transformers {
    babel?: TransformerOptions<Options.Babel>;
    typescript?: TransformerOptions<Options.Typescript>;
    scss?: TransformerOptions<Options.Sass>;
    sass?: TransformerOptions<Options.Sass>;
    less?: TransformerOptions<Options.Less>;
    stylus?: TransformerOptions<Options.Stylus>;
    postcss?: TransformerOptions<Options.Postcss>;
    coffeescript?: TransformerOptions<Options.Coffeescript>;
    pug?: TransformerOptions<Options.Pug>;
    globalStyle?: Options.GlobalStyle;
    replace?: Options.Replace;
    [language: string]: TransformerOptions;
}
export declare type AutoPreprocessGroup = PreprocessorGroup & {
    defaultLanguages: Readonly<{
        markup: string;
        style: string;
        script: string;
    }>;
};
export declare type AutoPreprocessOptions = {
    markupTagName?: string;
    aliases?: Array<[string, string]>;
    preserve?: string[];
    /** @deprecated Don't use "defaults" anymore, define the language being used explicitly instead */
    defaults?: {
        markup?: string;
        style?: string;
        script?: string;
    };
    sourceMap?: boolean;
    babel?: TransformerOptions<Options.Babel>;
    typescript?: TransformerOptions<Options.Typescript>;
    scss?: TransformerOptions<Options.Sass>;
    sass?: TransformerOptions<Options.Sass>;
    less?: TransformerOptions<Options.Less>;
    stylus?: TransformerOptions<Options.Stylus>;
    postcss?: TransformerOptions<Options.Postcss>;
    coffeescript?: TransformerOptions<Options.Coffeescript>;
    pug?: TransformerOptions<Options.Pug>;
    globalStyle?: Options.GlobalStyle | boolean;
    replace?: Options.Replace;
    [languageName: string]: TransformerOptions;
};

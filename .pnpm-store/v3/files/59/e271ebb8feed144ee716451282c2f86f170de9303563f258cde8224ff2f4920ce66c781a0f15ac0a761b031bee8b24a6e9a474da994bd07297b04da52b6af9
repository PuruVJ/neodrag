import { IRawGrammar, IOnigLib } from './types';
export * from './types';
/**
 * A single theme setting.
 */
export interface IRawThemeSetting {
    readonly name?: string;
    readonly scope?: string | string[];
    readonly settings: {
        readonly fontStyle?: string;
        readonly foreground?: string;
        readonly background?: string;
    };
}
/**
 * A TextMate theme.
 */
export interface IRawTheme {
    readonly name?: string;
    readonly settings: IRawThemeSetting[];
}
/**
 * A registry helper that can locate grammar file paths given scope names.
 */
export interface RegistryOptions {
    onigLib: Promise<IOnigLib>;
    theme?: IRawTheme;
    colorMap?: string[];
    loadGrammar(scopeName: string): Promise<IRawGrammar | undefined | null>;
    getInjections?(scopeName: string): string[] | undefined;
}
/**
 * A map from scope name to a language id. Please do not use language id 0.
 */
export interface IEmbeddedLanguagesMap {
    [scopeName: string]: number;
}
/**
 * A map from selectors to token types.
 */
export interface ITokenTypeMap {
    [selector: string]: StandardTokenType;
}
export declare const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3
}
export interface IGrammarConfiguration {
    embeddedLanguages?: IEmbeddedLanguagesMap;
    tokenTypes?: ITokenTypeMap;
}
/**
 * The registry that will hold all grammars.
 */
export declare class Registry {
    private readonly _options;
    private readonly _syncRegistry;
    private readonly _ensureGrammarCache;
    constructor(options: RegistryOptions);
    dispose(): void;
    /**
     * Change the theme. Once called, no previous `ruleStack` should be used anymore.
     */
    setTheme(theme: IRawTheme, colorMap?: string[]): void;
    /**
     * Returns a lookup array for color ids.
     */
    getColorMap(): string[];
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithEmbeddedLanguages(initialScopeName: string, initialLanguage: number, embeddedLanguages: IEmbeddedLanguagesMap): Promise<IGrammar | null>;
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithConfiguration(initialScopeName: string, initialLanguage: number, configuration: IGrammarConfiguration): Promise<IGrammar | null>;
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     */
    loadGrammar(initialScopeName: string): Promise<IGrammar | null>;
    private _doLoadSingleGrammar;
    private _loadSingleGrammar;
    private _loadGrammar;
    /**
     * Adds a rawGrammar.
     */
    addGrammar(rawGrammar: IRawGrammar, injections?: string[], initialLanguage?: number, embeddedLanguages?: IEmbeddedLanguagesMap | null): Promise<IGrammar>;
    /**
     * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `addGrammar`.
     */
    grammarForScopeName(scopeName: string, initialLanguage?: number, embeddedLanguages?: IEmbeddedLanguagesMap | null, tokenTypes?: ITokenTypeMap | null): Promise<IGrammar | null>;
}
/**
 * A grammar
 */
export interface IGrammar {
    /**
     * Tokenize `lineText` using previous line state `prevState`.
     */
    tokenizeLine(lineText: string, prevState: StackElement | null, timeLimit?: number): ITokenizeLineResult;
    /**
     * Tokenize `lineText` using previous line state `prevState`.
     * The result contains the tokens in binary format, resolved with the following information:
     *  - language
     *  - token type (regex, string, comment, other)
     *  - font style
     *  - foreground color
     *  - background color
     * e.g. for getting the languageId: `(metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET`
     */
    tokenizeLine2(lineText: string, prevState: StackElement | null, timeLimit?: number): ITokenizeLineResult2;
}
export interface ITokenizeLineResult {
    readonly tokens: IToken[];
    /**
     * The `prevState` to be passed on to the next line tokenization.
     */
    readonly ruleStack: StackElement;
    /**
     * Did tokenization stop early due to reaching the time limit.
     */
    readonly stoppedEarly: boolean;
}
/**
 * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
 * The following assumptions have been made:
 *  - languageId < 256 => needs 8 bits
 *  - unique color count < 512 => needs 9 bits
 *
 * The binary format is:
 * - -------------------------------------------
 *     3322 2222 2222 1111 1111 1100 0000 0000
 *     1098 7654 3210 9876 5432 1098 7654 3210
 * - -------------------------------------------
 *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
 *     bbbb bbbb bfff ffff ffFF FFTT LLLL LLLL
 * - -------------------------------------------
 *  - L = LanguageId (8 bits)
 *  - T = StandardTokenType (2 bits)
 *  - F = FontStyle (4 bits)
 *  - f = foreground color (9 bits)
 *  - b = background color (9 bits)
 */
export declare const enum MetadataConsts {
    LANGUAGEID_MASK = 255,
    TOKEN_TYPE_MASK = 768,
    FONT_STYLE_MASK = 15360,
    FOREGROUND_MASK = 8372224,
    BACKGROUND_MASK = 4286578688,
    LANGUAGEID_OFFSET = 0,
    TOKEN_TYPE_OFFSET = 8,
    FONT_STYLE_OFFSET = 10,
    FOREGROUND_OFFSET = 14,
    BACKGROUND_OFFSET = 23
}
export interface ITokenizeLineResult2 {
    /**
     * The tokens in binary format. Each token occupies two array indices. For token i:
     *  - at offset 2*i => startIndex
     *  - at offset 2*i + 1 => metadata
     *
     */
    readonly tokens: Uint32Array;
    /**
     * The `prevState` to be passed on to the next line tokenization.
     */
    readonly ruleStack: StackElement;
    /**
     * Did tokenization stop early due to reaching the time limit.
     */
    readonly stoppedEarly: boolean;
}
export interface IToken {
    startIndex: number;
    readonly endIndex: number;
    readonly scopes: string[];
}
/**
 * **IMPORTANT** - Immutable!
 */
export interface StackElement {
    _stackElementBrand: void;
    readonly depth: number;
    clone(): StackElement;
    equals(other: StackElement): boolean;
}
export declare const INITIAL: StackElement;
export declare const parseRawGrammar: (content: string, filePath?: string) => IRawGrammar;

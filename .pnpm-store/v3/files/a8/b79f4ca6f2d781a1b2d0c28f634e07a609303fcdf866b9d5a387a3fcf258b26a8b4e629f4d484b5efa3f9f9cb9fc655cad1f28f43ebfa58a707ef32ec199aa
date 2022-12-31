import tokenize, { getToken, AllTokens } from './tokenizer';
import parser, { CSSProperty, ParseOptions } from './parser';
export { tokenize, getToken, parser };
export * from './tokenizer/tokens';
export { CSSProperty, CSSValue, ParseOptions, FunctionCall, Value } from './parser';
export declare type CSSAbbreviation = CSSProperty[];
/**
 * Parses given abbreviation into property set
 */
export default function parse(abbr: string | AllTokens[], options?: ParseOptions): CSSAbbreviation;

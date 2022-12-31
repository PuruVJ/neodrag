import parse, { TokenGroup } from './parser';
import tokenize, { getToken, AllTokens } from './tokenizer';
import convert from './convert';
import { ParserOptions } from './types';
export { parse, tokenize, getToken, convert };
export * from './tokenizer/tokens';
export * from './types';
export declare type MarkupAbbreviation = TokenGroup;
/**
 * Parses given abbreviation into node tree
 */
export default function parseAbbreviation(abbr: string | AllTokens[], options?: ParserOptions): import("./types").Abbreviation;

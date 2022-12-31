import Scanner from '@emmetio/scanner';
import { BracketType, AllTokens } from './tokens';
export * from './tokens';
declare type Context = {
    [ctx in BracketType]: number;
} & {
    quote: number;
};
export default function tokenize(source: string): AllTokens[];
/**
 * Returns next token from given scanner, if possible
 */
export declare function getToken(scanner: Scanner, ctx: Context): AllTokens | undefined;

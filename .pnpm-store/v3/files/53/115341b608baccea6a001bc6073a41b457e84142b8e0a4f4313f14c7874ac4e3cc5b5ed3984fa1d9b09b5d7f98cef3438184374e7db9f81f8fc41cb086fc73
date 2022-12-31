import { NameToken, ValueToken, Repeater, AllTokens, BracketType, Bracket, Operator, OperatorType, Quote } from '../tokenizer';
import { ParserOptions } from '../types';
export declare type TokenStatement = TokenElement | TokenGroup;
export interface TokenAttribute {
    name?: ValueToken[];
    value?: ValueToken[];
    expression?: boolean;
}
export interface TokenElement {
    type: 'TokenElement';
    name?: NameToken[];
    attributes?: TokenAttribute[];
    value?: ValueToken[];
    repeat?: Repeater;
    selfClose: boolean;
    elements: TokenStatement[];
}
export interface TokenGroup {
    type: 'TokenGroup';
    elements: TokenStatement[];
    repeat?: Repeater;
}
export default function abbreviation(abbr: AllTokens[], options?: ParserOptions): TokenGroup;
export declare function isBracket(token: AllTokens | undefined, context?: BracketType, isOpen?: boolean): token is Bracket;
export declare function isOperator(token: AllTokens | undefined, type?: OperatorType): token is Operator;
export declare function isQuote(token: AllTokens | undefined, isSingle?: boolean): token is Quote;

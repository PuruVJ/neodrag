import { AllTokens } from '../tokenizer';
export interface TokenScanner {
    tokens: AllTokens[];
    start: number;
    pos: number;
    size: number;
}
declare type TestFn = (token?: AllTokens) => boolean;
export default function tokenScanner(tokens: AllTokens[]): TokenScanner;
export declare function peek(scanner: TokenScanner): AllTokens | undefined;
export declare function next(scanner: TokenScanner): AllTokens | undefined;
export declare function slice(scanner: TokenScanner, from?: number, to?: number): AllTokens[];
export declare function readable(scanner: TokenScanner): boolean;
export declare function consume(scanner: TokenScanner, test: TestFn): boolean;
export declare function error(scanner: TokenScanner, message: string, token?: import("../tokenizer").Bracket | import("../tokenizer").Field | import("../tokenizer").Literal | import("../tokenizer").Operator | import("../tokenizer").Quote | import("../tokenizer").Repeater | import("../tokenizer").RepeaterNumber | import("../tokenizer").RepeaterPlaceholder | import("../tokenizer").WhiteSpace | undefined): Error;
export declare function consumeWhile(scanner: TokenScanner, test: TestFn): boolean;
export {};

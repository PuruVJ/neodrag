import Scanner from '@emmetio/scanner';
import { AllTokens, Literal, NumberValue, ColorValue, WhiteSpace, Operator, Bracket, StringValue, Field } from './tokens';
export * from './tokens';
export default function tokenize(abbr: string, isValue?: boolean): AllTokens[];
/**
 * Returns next token from given scanner, if possible
 */
export declare function getToken(scanner: Scanner, short?: boolean): Bracket | Literal | Operator | WhiteSpace | ColorValue | NumberValue | StringValue | Field | undefined;

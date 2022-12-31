interface UnicodeFormattingOptions {
    prefix: string;
    separator: string;
    case: 'upper' | 'lower';
    format: 'utf-32' | 'utf-16';
    add0: boolean;
    throwOnError: boolean;
}
/**
 * Convert unicode number to string
 */
declare function getEmojiUnicodeString(code: number, options?: Partial<UnicodeFormattingOptions>): string;
/**
 * Convert unicode numbers sequence to string
 */
declare function getEmojiSequenceString(sequence: number[], options?: Partial<UnicodeFormattingOptions>): string;
/**
 * Merge unicode numbers sequence as icon keyword
 */
declare function emojiSequenceToKeyword(sequence: number[], throwOnError?: boolean): string;

export { UnicodeFormattingOptions, emojiSequenceToKeyword, getEmojiSequenceString, getEmojiUnicodeString };

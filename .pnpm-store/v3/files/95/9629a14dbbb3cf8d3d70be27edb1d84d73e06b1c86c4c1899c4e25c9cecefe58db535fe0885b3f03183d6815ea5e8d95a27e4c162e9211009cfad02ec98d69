/**
 * Get emoji sequence from string
 */
declare function getEmojiSequenceFromString(value: string): number[];
/**
 * Split sequence by joiner
 */
declare function splitEmojiSequences(sequence: number[]): number[][];
/**
 * Join emoji sequences
 */
declare function joinEmojiSequences(sequences: number[][]): number[];
/**
 * Remove variations
 */
declare function removeEmojiVariations(sequence: number[]): number[];
/**
 * Remove variations
 *
 * This function should be used with UTF-32 sequence, not UTF-16
 */
declare function removeEmojiTones(sequence: number[]): number[];
type MapCallback = (sequence: number[]) => number[];
/**
 * Run function on sequences
 *
 * Intended to be used with functions such as `removeEmojiVariations` or `removeEmojiTones`
 */
declare function mapEmojiSequences(sequences: number[][], callback: MapCallback, removeEmpty?: boolean): number[][];

export { getEmojiSequenceFromString, joinEmojiSequences, mapEmojiSequences, removeEmojiTones, removeEmojiVariations, splitEmojiSequences };

import { getEmojiCodePoint } from './convert.mjs';
import { joinerEmoji, vs16Emoji, emojiTones } from './data.mjs';

function getEmojiSequenceFromString(value) {
  return value.trim().split(/[\s-]/).map(getEmojiCodePoint);
}
function splitEmojiSequences(sequence) {
  const results = [];
  let queue = [];
  for (let i = 0; i < sequence.length; i++) {
    const code = sequence[i];
    if (code === joinerEmoji) {
      results.push(queue);
      queue = [];
    } else {
      queue.push(code);
    }
  }
  results.push(queue);
  return results;
}
function joinEmojiSequences(sequences) {
  let results = [];
  for (let i = 0; i < sequences.length; i++) {
    if (i > 0) {
      results.push(joinerEmoji);
    }
    results = results.concat(sequences[i]);
  }
  return results;
}
function removeEmojiVariations(sequence) {
  return sequence.filter((code) => code !== vs16Emoji);
}
function removeEmojiTones(sequence) {
  return sequence.filter((code) => {
    for (let i = 0; i < emojiTones.length; i++) {
      const range = emojiTones[i];
      if (code >= range[0] && code < range[1]) {
        return false;
      }
    }
    return true;
  });
}
function mapEmojiSequences(sequences, callback, removeEmpty = true) {
  const results = sequences.map((sequence) => callback(sequence));
  return removeEmpty ? results.filter((sequence) => sequence.length > 0) : results;
}

export { getEmojiSequenceFromString, joinEmojiSequences, mapEmojiSequences, removeEmojiTones, removeEmojiVariations, splitEmojiSequences };

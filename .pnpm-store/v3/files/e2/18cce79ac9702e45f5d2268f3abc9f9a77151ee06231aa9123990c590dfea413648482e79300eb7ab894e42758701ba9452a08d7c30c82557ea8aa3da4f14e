'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emoji_convert = require('./convert.cjs');
const emoji_data = require('./data.cjs');

function getEmojiSequenceFromString(value) {
  return value.trim().split(/[\s-]/).map(emoji_convert.getEmojiCodePoint);
}
function splitEmojiSequences(sequence) {
  const results = [];
  let queue = [];
  for (let i = 0; i < sequence.length; i++) {
    const code = sequence[i];
    if (code === emoji_data.joinerEmoji) {
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
      results.push(emoji_data.joinerEmoji);
    }
    results = results.concat(sequences[i]);
  }
  return results;
}
function removeEmojiVariations(sequence) {
  return sequence.filter((code) => code !== emoji_data.vs16Emoji);
}
function removeEmojiTones(sequence) {
  return sequence.filter((code) => {
    for (let i = 0; i < emoji_data.emojiTones.length; i++) {
      const range = emoji_data.emojiTones[i];
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

exports.getEmojiSequenceFromString = getEmojiSequenceFromString;
exports.joinEmojiSequences = joinEmojiSequences;
exports.mapEmojiSequences = mapEmojiSequences;
exports.removeEmojiTones = removeEmojiTones;
exports.removeEmojiVariations = removeEmojiVariations;
exports.splitEmojiSequences = splitEmojiSequences;

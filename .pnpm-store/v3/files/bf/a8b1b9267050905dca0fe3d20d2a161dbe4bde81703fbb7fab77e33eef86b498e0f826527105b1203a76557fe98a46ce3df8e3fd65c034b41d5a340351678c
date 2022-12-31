'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emoji_cleanup = require('./cleanup.cjs');
const emoji_convert = require('./convert.cjs');
const emoji_data = require('./data.cjs');
const emoji_format = require('./format.cjs');

function addOptionalEmojiVariations(sequences, testData) {
  const testDataMap = /* @__PURE__ */ Object.create(null);
  testData?.forEach((sequence) => {
    const convertedSequence = emoji_convert.convertEmojiSequenceToUTF32(sequence);
    const key = emoji_format.getEmojiSequenceString(
      emoji_cleanup.removeEmojiVariations(convertedSequence)
    );
    if (testDataMap[key]?.length > convertedSequence.length) {
      return;
    }
    testDataMap[key] = emoji_format.getEmojiSequenceString(convertedSequence);
  });
  const set = /* @__PURE__ */ new Set();
  sequences.forEach((sequence) => {
    const convertedSequence = emoji_convert.convertEmojiSequenceToUTF32(sequence);
    const cleanSequence = emoji_cleanup.removeEmojiVariations(convertedSequence);
    const mapKey = emoji_format.getEmojiSequenceString(cleanSequence);
    if (testDataMap[mapKey]) {
      set.add(testDataMap[mapKey]);
      return;
    }
    const parts = emoji_cleanup.splitEmojiSequences(convertedSequence).map((part) => {
      if (part.indexOf(emoji_data.vs16Emoji) !== -1) {
        return part;
      }
      if (part.length === 2 && part[1] === emoji_data.keycapEmoji) {
        return [part[0], emoji_data.vs16Emoji, part[1]];
      }
      return part.length === 1 ? [part[0], emoji_data.vs16Emoji] : part;
    });
    set.add(emoji_format.getEmojiSequenceString(emoji_cleanup.joinEmojiSequences(parts)));
  });
  return Array.from(set).map(emoji_cleanup.getEmojiSequenceFromString);
}

exports.addOptionalEmojiVariations = addOptionalEmojiVariations;

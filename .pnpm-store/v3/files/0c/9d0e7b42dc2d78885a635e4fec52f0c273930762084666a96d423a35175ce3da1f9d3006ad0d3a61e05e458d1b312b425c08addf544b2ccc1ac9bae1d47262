import { removeEmojiVariations, splitEmojiSequences, joinEmojiSequences, getEmojiSequenceFromString } from './cleanup.mjs';
import { convertEmojiSequenceToUTF32 } from './convert.mjs';
import { vs16Emoji, keycapEmoji } from './data.mjs';
import { getEmojiSequenceString } from './format.mjs';

function addOptionalEmojiVariations(sequences, testData) {
  const testDataMap = /* @__PURE__ */ Object.create(null);
  testData?.forEach((sequence) => {
    const convertedSequence = convertEmojiSequenceToUTF32(sequence);
    const key = getEmojiSequenceString(
      removeEmojiVariations(convertedSequence)
    );
    if (testDataMap[key]?.length > convertedSequence.length) {
      return;
    }
    testDataMap[key] = getEmojiSequenceString(convertedSequence);
  });
  const set = /* @__PURE__ */ new Set();
  sequences.forEach((sequence) => {
    const convertedSequence = convertEmojiSequenceToUTF32(sequence);
    const cleanSequence = removeEmojiVariations(convertedSequence);
    const mapKey = getEmojiSequenceString(cleanSequence);
    if (testDataMap[mapKey]) {
      set.add(testDataMap[mapKey]);
      return;
    }
    const parts = splitEmojiSequences(convertedSequence).map((part) => {
      if (part.indexOf(vs16Emoji) !== -1) {
        return part;
      }
      if (part.length === 2 && part[1] === keycapEmoji) {
        return [part[0], vs16Emoji, part[1]];
      }
      return part.length === 1 ? [part[0], vs16Emoji] : part;
    });
    set.add(getEmojiSequenceString(joinEmojiSequences(parts)));
  });
  return Array.from(set).map(getEmojiSequenceFromString);
}

export { addOptionalEmojiVariations };

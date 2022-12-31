'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emoji_convert = require('./convert.cjs');
require('./data.cjs');

const defaultUnicodeOptions = {
  prefix: "",
  separator: "",
  case: "lower",
  format: "utf-32",
  add0: false,
  throwOnError: true
};
function convert(sequence, options) {
  const prefix = options.prefix;
  const func = options.case === "upper" ? "toUpperCase" : "toLowerCase";
  const cleanSequence = options.format === "utf-16" ? emoji_convert.convertEmojiSequenceToUTF16(sequence) : emoji_convert.convertEmojiSequenceToUTF32(sequence, options.throwOnError);
  return cleanSequence.map((code) => {
    let str = code.toString(16);
    if (options.add0 && str.length < 4) {
      str = "0".repeat(4 - str.length) + str;
    }
    return prefix + str[func]();
  }).join(options.separator);
}
function getEmojiUnicodeString(code, options = {}) {
  return convert([code], {
    ...defaultUnicodeOptions,
    ...options
  });
}
const defaultSequenceOptions = {
  ...defaultUnicodeOptions,
  separator: "-"
};
function getEmojiSequenceString(sequence, options = {}) {
  return convert(sequence, {
    ...defaultSequenceOptions,
    ...options
  });
}
const keywordOptions = {
  prefix: "",
  separator: "-",
  case: "lower",
  format: "utf-32",
  add0: true,
  throwOnError: true
};
function emojiSequenceToKeyword(sequence, throwOnError = true) {
  return convert(sequence, {
    ...keywordOptions,
    throwOnError
  });
}

exports.emojiSequenceToKeyword = emojiSequenceToKeyword;
exports.getEmojiSequenceString = getEmojiSequenceString;
exports.getEmojiUnicodeString = getEmojiUnicodeString;

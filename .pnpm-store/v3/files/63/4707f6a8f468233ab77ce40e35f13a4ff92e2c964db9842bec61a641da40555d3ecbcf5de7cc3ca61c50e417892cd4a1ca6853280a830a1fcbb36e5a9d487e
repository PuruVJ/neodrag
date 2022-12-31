import { getEmojiSequenceFromString } from './cleanup.mjs';
import { convertEmojiSequenceToUTF32 } from './convert.mjs';
import './data.mjs';

const componentType = "component";
const allowedTypes = /* @__PURE__ */ new Set([
  componentType,
  "fully-qualified",
  "minimally-qualified",
  "unqualified"
]);
function parseEmojiTestFile(data) {
  const emojis = /* @__PURE__ */ new Set();
  data.split("\n").forEach((line) => {
    line = line.trim();
    const parts = line.split("#");
    if (parts.length < 2) {
      return;
    }
    const firstChunk = parts.shift().trim();
    if (!firstChunk) {
      return;
    }
    const firstChunkParts = firstChunk.split(";");
    if (firstChunkParts.length !== 2) {
      return;
    }
    const text = firstChunkParts[0].trim();
    const code = text.toLowerCase().replace(/\s+/g, "-");
    if (!code || !code.match(/^[a-f0-9]+[a-f0-9-]*[a-f0-9]+$/)) {
      return;
    }
    const type = firstChunkParts[1].trim();
    if (!allowedTypes.has(type)) {
      throw new Error(`Bad emoji type: ${type}`);
    }
    emojis.add(code);
  });
  return Array.from(emojis).map(
    (item) => convertEmojiSequenceToUTF32(getEmojiSequenceFromString(item))
  );
}

export { parseEmojiTestFile };

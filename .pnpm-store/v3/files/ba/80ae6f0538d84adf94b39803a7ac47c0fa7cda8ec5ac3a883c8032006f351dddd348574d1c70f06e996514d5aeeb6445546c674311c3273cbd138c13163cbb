import { b as resolve } from './chunk-utils-env.4afc6329.js';
import { k as notNullish } from './chunk-typecheck-constants.e478eb98.js';

const lineSplitRE = /\r?\n/;
const stackIgnorePatterns = [
  "node:internal",
  "/vitest/dist/",
  "/vitest/src/",
  "/vite-node/dist/",
  "/vite-node/src/",
  "/node_modules/chai/",
  "/node_modules/tinypool/",
  "/node_modules/tinyspy/"
];
function extractLocation(urlLike) {
  if (!urlLike.includes(":"))
    return [urlLike];
  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/[()]/g, ""));
  if (!parts)
    return [urlLike];
  return [parts[1], parts[2] || void 0, parts[3] || void 0];
}
function parseStacktrace(e, full = false) {
  if (!e)
    return [];
  if (e.stacks)
    return e.stacks;
  const stackStr = e.stack || e.stackStr || "";
  const stackFrames = stackStr.split("\n").map((raw) => {
    let line = raw.trim();
    if (line.includes("(eval "))
      line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
    let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
    const location = sanitizedLine.match(/ (\(.+\)$)/);
    sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
    const [url, lineNumber, columnNumber] = extractLocation(location ? location[1] : sanitizedLine);
    let method = location && sanitizedLine || "";
    let file = url && ["eval", "<anonymous>"].includes(url) ? void 0 : url;
    if (!file || !lineNumber || !columnNumber)
      return null;
    if (method.startsWith("async "))
      method = method.slice(6);
    if (file.startsWith("file://"))
      file = file.slice(7);
    file = resolve(file);
    if (!full && stackIgnorePatterns.some((p) => file && file.includes(p)))
      return null;
    return {
      method,
      file,
      line: parseInt(lineNumber),
      column: parseInt(columnNumber)
    };
  }).filter(notNullish);
  e.stacks = stackFrames;
  return stackFrames;
}
function posToNumber(source, pos) {
  if (typeof pos === "number")
    return pos;
  const lines = source.split(lineSplitRE);
  const { line, column } = pos;
  let start = 0;
  if (line > lines.length)
    return source.length;
  for (let i = 0; i < line - 1; i++)
    start += lines[i].length + 1;
  return start + column;
}
function numberToPos(source, offset) {
  if (typeof offset !== "number")
    return offset;
  if (offset > source.length) {
    throw new Error(
      `offset is longer than source length! offset ${offset} > length ${source.length}`
    );
  }
  const lines = source.split(lineSplitRE);
  let counted = 0;
  let line = 0;
  let column = 0;
  for (; line < lines.length; line++) {
    const lineLength = lines[line].length + 1;
    if (counted + lineLength >= offset) {
      column = offset - counted + 1;
      break;
    }
    counted += lineLength;
  }
  return { line: line + 1, column };
}

export { posToNumber as a, lineSplitRE as l, numberToPos as n, parseStacktrace as p };

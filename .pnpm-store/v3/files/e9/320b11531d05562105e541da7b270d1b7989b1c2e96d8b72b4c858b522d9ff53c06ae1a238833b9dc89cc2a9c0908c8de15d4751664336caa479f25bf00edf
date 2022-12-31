import { AstroErrorData } from "./errors-data.js";
function positionAt(offset, text) {
  const lineOffsets = getLineOffsets(text);
  offset = Math.max(0, Math.min(text.length, offset));
  let low = 0;
  let high = lineOffsets.length;
  if (high === 0) {
    return {
      line: 0,
      column: offset
    };
  }
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const lineOffset = lineOffsets[mid];
    if (lineOffset === offset) {
      return {
        line: mid,
        column: 0
      };
    } else if (offset > lineOffset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  const line = low - 1;
  return { line, column: offset - lineOffsets[line] };
}
function getLineOffsets(text) {
  const lineOffsets = [];
  let isLineStart = true;
  for (let i = 0; i < text.length; i++) {
    if (isLineStart) {
      lineOffsets.push(i);
      isLineStart = false;
    }
    const ch = text.charAt(i);
    isLineStart = ch === "\r" || ch === "\n";
    if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
      i++;
    }
  }
  if (isLineStart && text.length > 0) {
    lineOffsets.push(text.length);
  }
  return lineOffsets;
}
function createSafeError(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}
function getErrorDataByCode(code) {
  const entry = Object.entries(AstroErrorData).find((data) => data[1].code === code);
  if (entry) {
    return {
      name: entry[0],
      data: entry[1]
    };
  }
}
export {
  createSafeError,
  getErrorDataByCode,
  normalizeLF,
  positionAt
};

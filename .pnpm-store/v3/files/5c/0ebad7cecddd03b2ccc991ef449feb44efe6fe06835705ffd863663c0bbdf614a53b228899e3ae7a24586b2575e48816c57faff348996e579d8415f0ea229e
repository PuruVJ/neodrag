
import {charCodes} from "./parser/util/charcodes";











/**
 * Generate a simple source map indicating that each line maps directly to the original line.
 */
export default function computeSourceMap(
  code,
  filePath,
  {compiledFilename},
) {
  let mappings = "AAAA";
  for (let i = 0; i < code.length; i++) {
    if (code.charCodeAt(i) === charCodes.lineFeed) {
      mappings += ";AACA";
    }
  }
  return {
    version: 3,
    file: compiledFilename || "",
    sources: [filePath],
    mappings,
    names: [],
  };
}

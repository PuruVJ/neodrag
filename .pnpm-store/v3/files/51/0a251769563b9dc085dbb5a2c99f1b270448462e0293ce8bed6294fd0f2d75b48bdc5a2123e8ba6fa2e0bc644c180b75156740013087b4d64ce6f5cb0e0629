'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sourceMapSupport = require('source-map-support');

let SOURCEMAPPING_URL = "sourceMa";
SOURCEMAPPING_URL += "ppingURL";
const VITE_NODE_SOURCEMAPPING_SOURCE = "//# sourceMappingSource=vite-node";
const VITE_NODE_SOURCEMAPPING_URL = `${SOURCEMAPPING_URL}=data:application/json;charset=utf-8`;
const VITE_NODE_SOURCEMAPPING_REGEXP = new RegExp(`//# ${VITE_NODE_SOURCEMAPPING_URL};base64,(.+)`);
async function withInlineSourcemap(result) {
  const map = result.map;
  let code = result.code;
  if (!map || code.includes(VITE_NODE_SOURCEMAPPING_SOURCE))
    return result;
  const OTHER_SOURCE_MAP_REGEXP = new RegExp(`//# ${SOURCEMAPPING_URL}=data:application/json[^,]+base64,(.+)`, "g");
  while (OTHER_SOURCE_MAP_REGEXP.test(code))
    code = code.replace(OTHER_SOURCE_MAP_REGEXP, "");
  const sourceMap = Buffer.from(JSON.stringify(map), "utf-8").toString("base64");
  result.code = `${code.trimEnd()}

${VITE_NODE_SOURCEMAPPING_SOURCE}
//# ${VITE_NODE_SOURCEMAPPING_URL};base64,${sourceMap}
`;
  return result;
}
function extractSourceMap(code) {
  var _a;
  const mapString = (_a = code.match(VITE_NODE_SOURCEMAPPING_REGEXP)) == null ? void 0 : _a[1];
  if (mapString)
    return JSON.parse(Buffer.from(mapString, "base64").toString("utf-8"));
  return null;
}
function installSourcemapsSupport(options) {
  sourceMapSupport.install({
    environment: "node",
    handleUncaughtExceptions: false,
    retrieveSourceMap(source) {
      const map = options.getSourceMap(source);
      if (map) {
        return {
          url: source,
          map
        };
      }
      return null;
    }
  });
}

exports.extractSourceMap = extractSourceMap;
exports.installSourcemapsSupport = installSourcemapsSupport;
exports.withInlineSourcemap = withInlineSourcemap;

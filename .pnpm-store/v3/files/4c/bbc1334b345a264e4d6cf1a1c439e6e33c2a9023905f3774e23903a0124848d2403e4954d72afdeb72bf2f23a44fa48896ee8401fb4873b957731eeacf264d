import * as eslexer from "es-module-lexer";
import { AstroError, AstroErrorData } from "../core/errors/index.js";
const BOOLEAN_EXPORTS = /* @__PURE__ */ new Set(["prerender"]);
function includesExport(code) {
  for (const name of BOOLEAN_EXPORTS) {
    if (code.includes(name))
      return true;
  }
  return false;
}
let didInit = false;
async function scan(code, id) {
  if (!includesExport(code))
    return {};
  if (!didInit) {
    await eslexer.init;
    didInit = true;
  }
  const [_, exports] = eslexer.parse(code, id);
  let pageOptions = {};
  for (const _export of exports) {
    const { n: name, le: endOfLocalName } = _export;
    if (BOOLEAN_EXPORTS.has(name)) {
      const prefix = code.slice(0, endOfLocalName).split("export").pop().trim().replace("prerender", "").trim();
      const suffix = code.slice(endOfLocalName).trim().replace(/\=/, "").trim().split(/[;\n]/)[0];
      if (prefix !== "const" || !(suffix === "true" || suffix === "false")) {
        throw new AstroError({
          ...AstroErrorData.InvalidPrerenderExport,
          message: AstroErrorData.InvalidPrerenderExport.message(prefix, suffix),
          location: { file: id }
        });
      } else {
        pageOptions[name] = suffix === "true";
      }
    }
  }
  return pageOptions;
}
export {
  scan
};

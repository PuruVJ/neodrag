const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
const scriptRe = new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);
const isScriptRequest = (request) => scriptRe.test(request);
export {
  SCRIPT_EXTENSIONS,
  isScriptRequest
};

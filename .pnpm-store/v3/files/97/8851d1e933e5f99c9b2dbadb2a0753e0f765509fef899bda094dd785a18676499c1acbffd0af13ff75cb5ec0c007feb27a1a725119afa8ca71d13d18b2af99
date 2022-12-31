import { parseNpmName } from "../core/util.js";
async function detectImportSource(code, jsxRenderers, tsConfig) {
  var _a;
  let importSource = detectImportSourceFromComments(code);
  if (!importSource && /import/.test(code)) {
    importSource = await detectImportSourceFromImports(code, jsxRenderers);
  }
  if (!importSource && tsConfig) {
    importSource = (_a = tsConfig.compilerOptions) == null ? void 0 : _a.jsxImportSource;
  }
  return importSource;
}
const importsRE = /(?<!\/\/.*)(?<=^|;|\*\/)\s*(?:import(?!\s+type)(?:[\w*{}\n\r\t, ]+from)?\s*("[^"]+"|'[^']+')\s*(?=$|;|\/\/|\/\*)|import\s*\(\s*("[^"]+"|'[^']+')\s*\))/gm;
async function detectImportSourceFromImports(code, jsxRenderers) {
  let m;
  importsRE.lastIndex = 0;
  while ((m = importsRE.exec(code)) != null) {
    const spec = (m[1] || m[2]).slice(1, -1);
    const pkg = parseNpmName(spec);
    if (pkg && jsxRenderers.has(pkg.name)) {
      return pkg.name;
    }
  }
}
function detectImportSourceFromComments(code) {
  const multiline = code.match(/\/\*\*?[\S\s]*\*\//gm) || [];
  for (const comment of multiline) {
    const [_, lib] = comment.slice(0, -2).match(/@jsxImportSource\s*(\S+)/) || [];
    if (lib) {
      return lib.trim();
    }
  }
}
export {
  detectImportSource
};

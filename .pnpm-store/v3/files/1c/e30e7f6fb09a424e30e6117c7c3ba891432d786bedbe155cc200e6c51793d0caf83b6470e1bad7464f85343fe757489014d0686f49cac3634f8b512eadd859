import { fileURLToPath } from "url";
import { transformWithEsbuild } from "vite";
import { cachedCompilation } from "../core/compile/index.js";
import { getFileInfo } from "../vite-plugin-utils/index.js";
const FRONTMATTER_PARSE_REGEXP = /^\-\-\-(.*)^\-\-\-/ms;
async function cachedFullCompilation({
  compileProps,
  rawId,
  logging
}) {
  let transformResult;
  let esbuildResult;
  try {
    transformResult = await cachedCompilation(compileProps);
    esbuildResult = await transformWithEsbuild(transformResult.code, rawId, {
      loader: "ts",
      target: "esnext",
      sourcemap: "external",
      tsconfigRaw: {
        compilerOptions: {
          importsNotUsedAsValues: "remove"
        }
      }
    });
  } catch (err) {
    await enhanceCompileError({
      err,
      id: rawId,
      source: compileProps.source,
      config: compileProps.astroConfig,
      logging
    });
    throw err;
  }
  const { fileId: file, fileUrl: url } = getFileInfo(rawId, compileProps.astroConfig);
  let SUFFIX = "";
  SUFFIX += `
const $$file = ${JSON.stringify(file)};
const $$url = ${JSON.stringify(
    url
  )};export { $$file as file, $$url as url };
`;
  if (!compileProps.viteConfig.isProduction) {
    let i = 0;
    while (i < transformResult.scripts.length) {
      SUFFIX += `import "${rawId}?astro&type=script&index=${i}&lang.ts";`;
      i++;
    }
  }
  if (!compileProps.viteConfig.isProduction) {
    SUFFIX += `
if (import.meta.hot) { import.meta.hot.decline() }`;
  }
  return {
    ...transformResult,
    code: esbuildResult.code + SUFFIX,
    map: esbuildResult.map
  };
}
async function enhanceCompileError({
  err,
  id,
  source,
  config,
  logging
}) {
  const scannedFrontmatter = FRONTMATTER_PARSE_REGEXP.exec(source);
  if (scannedFrontmatter) {
    try {
      await transformWithEsbuild(scannedFrontmatter[1], id, {
        loader: "ts",
        target: "esnext",
        sourcemap: false
      });
    } catch (frontmatterErr) {
      if (frontmatterErr && frontmatterErr.message) {
        frontmatterErr.message = frontmatterErr.message.replace(
          "end of file",
          "end of frontmatter"
        );
      }
      throw frontmatterErr;
    }
  }
  if (err.stack && err.stack.includes("wasm-function")) {
    const search = new URLSearchParams({
      labels: "compiler",
      title: "\u{1F41B} BUG: `@astrojs/compiler` panic",
      template: "---01-bug-report.yml",
      "bug-description": `\`@astrojs/compiler\` encountered an unrecoverable error when compiling the following file.

**${id.replace(fileURLToPath(config.root), "")}**
\`\`\`astro
${source}
\`\`\``
    });
    err.url = `https://github.com/withastro/astro/issues/new?${search.toString()}`;
    err.message = `Error: Uh oh, the Astro compiler encountered an unrecoverable error!

    Please open
    a GitHub issue using the link below:
    ${err.url}`;
    if (logging.level !== "debug") {
      err.stack = `    at ${id}`;
    }
  }
  throw err;
}
export {
  cachedFullCompilation
};

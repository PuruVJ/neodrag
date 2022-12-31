import { renderMarkdown } from "@astrojs/markdown-remark";
import fs from "fs";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { transformWithEsbuild } from "vite";
import { getContentPaths } from "../content/index.js";
import { pagesVirtualModuleId } from "../core/app/index.js";
import { cachedCompilation } from "../core/compile/index.js";
import { AstroErrorData, MarkdownError } from "../core/errors/index.js";
import { isMarkdownFile } from "../core/util.js";
import { getFileInfo, normalizeFilename } from "../vite-plugin-utils/index.js";
const MARKDOWN_IMPORT_FLAG = "?mdImport";
const MARKDOWN_CONTENT_FLAG = "?content";
function safeMatter(source, id) {
  try {
    return matter(source);
  } catch (err) {
    const markdownError = new MarkdownError({
      code: AstroErrorData.UnknownMarkdownError.code,
      message: err.message,
      stack: err.stack,
      location: {
        file: id
      }
    });
    if (err.name === "YAMLException") {
      markdownError.setErrorCode(AstroErrorData.MarkdownFrontmatterParseError.code);
      markdownError.setLocation({
        file: id,
        line: err.mark.line,
        column: err.mark.column
      });
      markdownError.setMessage(err.reason);
    }
    throw markdownError;
  }
}
function markdown({ settings }) {
  const { config } = settings;
  const fakeRootImporter = fileURLToPath(new URL("index.html", config.root));
  function isRootImport(importer) {
    if (!importer) {
      return true;
    }
    if (importer === fakeRootImporter) {
      return true;
    }
    if (importer === "\0" + pagesVirtualModuleId) {
      return true;
    }
    return false;
  }
  let resolvedConfig;
  return {
    name: "astro:markdown",
    enforce: "pre",
    async resolveId(id, importer, options) {
      if (isMarkdownFile(id, { suffix: MARKDOWN_CONTENT_FLAG })) {
        const resolvedId = await this.resolve(id, importer, { skipSelf: true, ...options });
        return resolvedId == null ? void 0 : resolvedId.id.replace(MARKDOWN_CONTENT_FLAG, "");
      }
      if (isMarkdownFile(id) && !isRootImport(importer)) {
        const resolvedId = await this.resolve(id, importer, { skipSelf: true, ...options });
        if (resolvedId) {
          return resolvedId.id + MARKDOWN_IMPORT_FLAG;
        }
      }
      return void 0;
    },
    async load(id, opts) {
      if (isMarkdownFile(id, { suffix: MARKDOWN_IMPORT_FLAG })) {
        const { fileId, fileUrl } = getFileInfo(id, config);
        const source = await fs.promises.readFile(fileId, "utf8");
        const { data: frontmatter, content: rawContent } = safeMatter(source, fileId);
        return {
          code: `
						// Static
						export const frontmatter = ${escapeViteEnvReferences(JSON.stringify(frontmatter))};
						export const file = ${JSON.stringify(fileId)};
						export const url = ${JSON.stringify(fileUrl)};
						export function rawContent() {
							return ${escapeViteEnvReferences(JSON.stringify(rawContent))};
						}
						export async function compiledContent() {
							return load().then((m) => m.compiledContent());
						}

						// Deferred
						export default async function load() {
							return (await import(${JSON.stringify(fileId + MARKDOWN_CONTENT_FLAG)}));
						}
						export function Content(...args) {
							return load().then((m) => m.default(...args));
						}
						Content.isAstroComponentFactory = true;
						export function getHeadings() {
							return load().then((m) => m.metadata.headings);
						}
						export function getHeaders() {
							console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
							return load().then((m) => m.metadata.headings);
						};`,
          map: null
        };
      }
      if (isMarkdownFile(id)) {
        const filename = normalizeFilename(id, config);
        const source = await fs.promises.readFile(filename, "utf8");
        const renderOpts = config.markdown;
        const fileUrl = new URL(`file://${filename}`);
        let { data: frontmatter, content: markdownContent } = safeMatter(source, filename);
        markdownContent = markdownContent.replace(
          /<\s*!--([^-->]*)(.*?)-->/gs,
          (whole) => `{/*${whole.replace(/\*\//g, "*\u200B/")}*/}`
        );
        let renderResult = await renderMarkdown(markdownContent, {
          ...renderOpts,
          fileURL: fileUrl,
          isAstroFlavoredMd: true,
          isExperimentalContentCollections: settings.config.experimental.contentCollections,
          contentDir: getContentPaths(settings.config).contentDir
        });
        let { code: astroResult, metadata } = renderResult;
        const { layout = "", components = "", setup = "", ...content } = frontmatter;
        content.astro = metadata;
        content.url = getFileInfo(id, config).fileUrl;
        content.file = filename;
        const prelude = `---
import Slugger from 'github-slugger';
${layout ? `import Layout from ${JSON.stringify(layout)};` : ""}
${components ? `import * from ${JSON.stringify(components)};` : ""}
${setup}

const slugger = new Slugger();
function $$slug(value) {
	return slugger.slug(value);
}

const $$content = ${JSON.stringify(content)};

Object.defineProperty($$content.astro, 'headers', {
	get() {
		console.warn('[${JSON.stringify(id)}] content.astro.headers is now content.astro.headings.');
		return this.headings;
	}
});
---`;
        const imports = `${layout ? `import Layout from ${JSON.stringify(layout)};` : ""}
${setup}`.trim();
        if (/\bLayout\b/.test(imports)) {
          astroResult = `${prelude}
<Layout content={$$content}>

${astroResult}

</Layout>`;
        } else {
          astroResult = `${prelude}
<head></head>${astroResult}`;
        }
        const compileProps = {
          astroConfig: config,
          viteConfig: resolvedConfig,
          filename,
          source: astroResult,
          id
        };
        let transformResult = await cachedCompilation(compileProps);
        let { code: tsResult } = transformResult;
        tsResult = `
export const metadata = ${JSON.stringify(metadata)};
export const frontmatter = ${JSON.stringify(content)};
export function rawContent() {
	return ${JSON.stringify(markdownContent)};
}
export function compiledContent() {
		return ${JSON.stringify(renderResult.metadata.html)};
}
${tsResult}`;
        const { code } = await transformWithEsbuild(tsResult, id, {
          loader: "ts",
          sourcemap: false
        });
        const astroMetadata = {
          clientOnlyComponents: transformResult.clientOnlyComponents,
          hydratedComponents: transformResult.hydratedComponents,
          scripts: transformResult.scripts,
          propagation: "none",
          pageOptions: {}
        };
        return {
          code: escapeViteEnvReferences(code),
          map: null,
          meta: {
            astro: astroMetadata,
            vite: {
              lang: "ts"
            }
          }
        };
      }
      return null;
    }
  };
}
function escapeViteEnvReferences(code) {
  return code.replace(/import\.meta\.env/g, "import\\u002Emeta.env");
}
export {
  markdown as default
};

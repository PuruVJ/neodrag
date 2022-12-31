import { compile as mdxCompile } from "@mdx-js/mdx";
import mdxPlugin from "@mdx-js/rollup";
import { parse as parseESM } from "es-module-lexer";
import fs from "node:fs/promises";
import { VFile } from "vfile";
import {
  getRehypePlugins,
  getRemarkPlugins,
  recmaInjectImportMetaEnvPlugin,
  rehypeApplyFrontmatterExport
} from "./plugins.js";
import { getFileInfo, parseFrontmatter } from "./utils.js";
const RAW_CONTENT_ERROR = "MDX does not support rawContent()! If you need to read the Markdown contents to calculate values (ex. reading time), we suggest injecting frontmatter via remark plugins. Learn more on our docs: https://docs.astro.build/en/guides/integrations-guide/mdx/#inject-frontmatter-via-remark-or-rehype-plugins";
const COMPILED_CONTENT_ERROR = "MDX does not support compiledContent()! If you need to read the HTML contents to calculate values (ex. reading time), we suggest injecting frontmatter via rehype plugins. Learn more on our docs: https://docs.astro.build/en/guides/integrations-guide/mdx/#inject-frontmatter-via-remark-or-rehype-plugins";
function mdx(mdxOptions = {}) {
  return {
    name: "@astrojs/mdx",
    hooks: {
      "astro:config:setup": async ({ updateConfig, config, addPageExtension, command }) => {
        addPageExtension(".mdx");
        mdxOptions.extendPlugins ?? (mdxOptions.extendPlugins = "markdown");
        const remarkRehypeOptions = {
          ...mdxOptions.extendPlugins === "markdown" ? config.markdown.remarkRehype : {},
          ...mdxOptions.remarkRehype
        };
        const mdxPluginOpts = {
          remarkPlugins: await getRemarkPlugins(mdxOptions, config),
          rehypePlugins: getRehypePlugins(mdxOptions, config),
          recmaPlugins: mdxOptions.recmaPlugins,
          jsx: true,
          jsxImportSource: "astro",
          format: "mdx",
          mdExtensions: [],
          remarkRehypeOptions
        };
        let importMetaEnv = {
          SITE: config.site
        };
        updateConfig({
          vite: {
            plugins: [
              {
                enforce: "pre",
                ...mdxPlugin(mdxPluginOpts),
                configResolved(resolved) {
                  importMetaEnv = { ...importMetaEnv, ...resolved.env };
                },
                async transform(_, id) {
                  if (!id.endsWith("mdx"))
                    return;
                  const { fileId } = getFileInfo(id, config);
                  const code = await fs.readFile(fileId, "utf-8");
                  const { data: frontmatter, content: pageContent } = parseFrontmatter(code, id);
                  const compiled = await mdxCompile(new VFile({ value: pageContent, path: id }), {
                    ...mdxPluginOpts,
                    rehypePlugins: [
                      ...mdxPluginOpts.rehypePlugins ?? [],
                      () => rehypeApplyFrontmatterExport(frontmatter)
                    ],
                    recmaPlugins: [
                      ...mdxPluginOpts.recmaPlugins ?? [],
                      () => recmaInjectImportMetaEnvPlugin({ importMetaEnv })
                    ]
                  });
                  return {
                    code: escapeViteEnvReferences(String(compiled.value)),
                    map: compiled.map
                  };
                }
              },
              {
                name: "@astrojs/mdx-postprocess",
                transform(code, id) {
                  if (!id.endsWith(".mdx"))
                    return;
                  const [moduleImports, moduleExports] = parseESM(code);
                  const importsFromJSXRuntime = moduleImports.filter(({ n }) => n === "astro/jsx-runtime").map(({ ss, se }) => code.substring(ss, se));
                  const hasFragmentImport = importsFromJSXRuntime.some(
                    (statement) => /[\s,{](Fragment,|Fragment\s*})/.test(statement)
                  );
                  if (!hasFragmentImport) {
                    code = 'import { Fragment } from "astro/jsx-runtime"\n' + code;
                  }
                  const { fileUrl, fileId } = getFileInfo(id, config);
                  if (!moduleExports.includes("url")) {
                    code += `
export const url = ${JSON.stringify(fileUrl)};`;
                  }
                  if (!moduleExports.includes("file")) {
                    code += `
export const file = ${JSON.stringify(fileId)};`;
                  }
                  if (!moduleExports.includes("rawContent")) {
                    code += `
export function rawContent() { throw new Error(${JSON.stringify(
                      RAW_CONTENT_ERROR
                    )}) };`;
                  }
                  if (!moduleExports.includes("compiledContent")) {
                    code += `
export function compiledContent() { throw new Error(${JSON.stringify(
                      COMPILED_CONTENT_ERROR
                    )}) };`;
                  }
                  if (!moduleExports.includes("Content")) {
                    code = code.replace("export default MDXContent;", "");
                    code += `
export const Content = (props = {}) => MDXContent({
											...props,
											components: { Fragment, ...props.components },
										});
										export default Content;`;
                  }
                  code += `
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);`;
                  if (command === "dev") {
                    code += `
if (import.meta.hot) {
											import.meta.hot.decline();
										}`;
                  }
                  return escapeViteEnvReferences(code);
                }
              }
            ]
          }
        });
      }
    }
  };
}
function escapeViteEnvReferences(code) {
  return code.replace(/import\.meta\.env/g, "import\\u002Emeta.env");
}
export {
  mdx as default
};

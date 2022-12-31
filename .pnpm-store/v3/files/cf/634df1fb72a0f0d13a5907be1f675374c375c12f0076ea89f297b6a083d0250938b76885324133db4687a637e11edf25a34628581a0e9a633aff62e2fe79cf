import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import { nodeTypes } from "@mdx-js/mdx";
import { visit as estreeVisit } from "estree-util-visit";
import { bold, yellow } from "kleur/colors";
import { pathToFileURL } from "node:url";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import { visit } from "unist-util-visit";
import { rehypeInjectHeadingsExport } from "./rehype-collect-headings.js";
import rehypeMetaString from "./rehype-meta-string.js";
import remarkPrism from "./remark-prism.js";
import remarkShiki from "./remark-shiki.js";
import { isRelativePath, jsToTreeNode } from "./utils.js";
function recmaInjectImportMetaEnvPlugin({
  importMetaEnv
}) {
  return (tree) => {
    estreeVisit(tree, (node) => {
      if (node.type === "MemberExpression") {
        const envVarName = getImportMetaEnvVariableName(node);
        if (typeof envVarName === "string") {
          for (const key in node) {
            delete node[key];
          }
          const envVarLiteral = {
            type: "Literal",
            value: importMetaEnv[envVarName],
            raw: JSON.stringify(importMetaEnv[envVarName])
          };
          Object.assign(node, envVarLiteral);
        }
      }
    });
  };
}
function remarkInitializeAstroData() {
  return function(tree, vfile) {
    if (!vfile.data.astro) {
      vfile.data.astro = { frontmatter: {} };
    }
  };
}
function rehypeApplyFrontmatterExport(pageFrontmatter) {
  return function(tree, vfile) {
    const { frontmatter: injectedFrontmatter } = safelyGetAstroData(vfile.data);
    const frontmatter = { ...injectedFrontmatter, ...pageFrontmatter };
    const exportNodes = [
      jsToTreeNode(
        `export const frontmatter = ${JSON.stringify(
          frontmatter
        )};
export const _internal = { injectedFrontmatter: ${JSON.stringify(
          injectedFrontmatter
        )} };`
      )
    ];
    if (frontmatter.layout) {
      exportNodes.unshift(
        jsToTreeNode(
          `import { jsx as layoutJsx } from 'astro/jsx-runtime';

				export default async function ({ children }) {
					const Layout = (await import(${JSON.stringify(frontmatter.layout)})).default;
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					return layoutJsx(Layout, {
						file,
						url,
						content,
						frontmatter: content,
						headings: getHeadings(),
						'server:root': true,
						children,
					});
				};`
        )
      );
    }
    tree.children = exportNodes.concat(tree.children);
  };
}
function toRemarkContentRelImageError({ srcDir }) {
  const contentDir = new URL("content/", srcDir);
  return function remarkContentRelImageError() {
    return (tree, vfile) => {
      const isContentFile = pathToFileURL(vfile.path).href.startsWith(contentDir.href);
      if (!isContentFile)
        return;
      const relImagePaths = /* @__PURE__ */ new Set();
      visit(tree, "image", function raiseError(node) {
        if (isRelativePath(node.url)) {
          relImagePaths.add(node.url);
        }
      });
      if (relImagePaths.size === 0)
        return;
      const errorMessage = `Relative image paths are not supported in the content/ directory. Place local images in the public/ directory and use absolute paths (see https://docs.astro.build/en/guides/images/#in-markdown-files):
` + [...relImagePaths].map((path) => JSON.stringify(path)).join(",\n");
      throw new Error(errorMessage);
    };
  };
}
const DEFAULT_REMARK_PLUGINS = [remarkGfm, remarkSmartypants];
const DEFAULT_REHYPE_PLUGINS = [];
async function getRemarkPlugins(mdxOptions, config) {
  let remarkPlugins = [
    remarkInitializeAstroData
  ];
  switch (mdxOptions.extendPlugins) {
    case false:
      break;
    case "astroDefaults":
      remarkPlugins = [...remarkPlugins, ...DEFAULT_REMARK_PLUGINS];
      break;
    default:
      remarkPlugins = [
        ...remarkPlugins,
        ...markdownShouldExtendDefaultPlugins(config) ? DEFAULT_REMARK_PLUGINS : [],
        ...ignoreStringPlugins(config.markdown.remarkPlugins ?? [])
      ];
      break;
  }
  if (config.markdown.syntaxHighlight === "shiki") {
    remarkPlugins.push([await remarkShiki(config.markdown.shikiConfig)]);
  }
  if (config.markdown.syntaxHighlight === "prism") {
    remarkPlugins.push(remarkPrism);
  }
  remarkPlugins = [...remarkPlugins, ...mdxOptions.remarkPlugins ?? []];
  if (config.experimental.contentCollections) {
    remarkPlugins.push(toRemarkContentRelImageError(config));
  }
  return remarkPlugins;
}
function getRehypePlugins(mdxOptions, config) {
  let rehypePlugins = [
    rehypeMetaString,
    [rehypeRaw, { passThrough: nodeTypes }]
  ];
  switch (mdxOptions.extendPlugins) {
    case false:
      break;
    case "astroDefaults":
      rehypePlugins = [...rehypePlugins, ...DEFAULT_REHYPE_PLUGINS];
      break;
    default:
      rehypePlugins = [
        ...rehypePlugins,
        ...markdownShouldExtendDefaultPlugins(config) ? DEFAULT_REHYPE_PLUGINS : [],
        ...ignoreStringPlugins(config.markdown.rehypePlugins ?? [])
      ];
      break;
  }
  rehypePlugins = [
    ...rehypePlugins,
    ...mdxOptions.rehypePlugins ?? [],
    rehypeHeadingIds,
    rehypeInjectHeadingsExport
  ];
  return rehypePlugins;
}
function markdownShouldExtendDefaultPlugins(config) {
  return config.markdown.extendDefaultPlugins || config.markdown.remarkPlugins.length === 0 && config.markdown.rehypePlugins.length === 0;
}
function ignoreStringPlugins(plugins) {
  let validPlugins = [];
  let hasInvalidPlugin = false;
  for (const plugin of plugins) {
    if (typeof plugin === "string") {
      console.warn(yellow(`[MDX] ${bold(plugin)} not applied.`));
      hasInvalidPlugin = true;
    } else if (Array.isArray(plugin) && typeof plugin[0] === "string") {
      console.warn(yellow(`[MDX] ${bold(plugin[0])} not applied.`));
      hasInvalidPlugin = true;
    } else {
      validPlugins.push(plugin);
    }
  }
  if (hasInvalidPlugin) {
    console.warn(
      `To inherit Markdown plugins in MDX, please use explicit imports in your config instead of "strings." See Markdown docs: https://docs.astro.build/en/guides/markdown-content/#markdown-plugins`
    );
  }
  return validPlugins;
}
function isValidAstroData(obj) {
  if (typeof obj === "object" && obj !== null && obj.hasOwnProperty("frontmatter")) {
    const { frontmatter } = obj;
    try {
      JSON.stringify(frontmatter);
    } catch {
      return false;
    }
    return typeof frontmatter === "object" && frontmatter !== null;
  }
  return false;
}
function safelyGetAstroData(vfileData) {
  const { astro } = vfileData;
  if (!astro)
    return { frontmatter: {} };
  if (!isValidAstroData(astro)) {
    throw Error(
      `[MDX] A remark or rehype plugin tried to add invalid frontmatter. Ensure "astro.frontmatter" is a JSON object!`
    );
  }
  return astro;
}
function getImportMetaEnvVariableName(node) {
  try {
    if (node.object.type !== "MemberExpression" || node.property.type !== "Identifier")
      return new Error();
    const nestedExpression = node.object;
    if (nestedExpression.property.type !== "Identifier" || nestedExpression.property.name !== "env")
      return new Error();
    const envExpression = nestedExpression.object;
    if (envExpression.type !== "MetaProperty" || envExpression.property.type !== "Identifier" || envExpression.property.name !== "meta")
      return new Error();
    if (envExpression.meta.name !== "import")
      return new Error();
    return node.property.name;
  } catch (e) {
    if (e instanceof Error) {
      return e;
    }
    return new Error("Unknown parsing error");
  }
}
export {
  getRehypePlugins,
  getRemarkPlugins,
  recmaInjectImportMetaEnvPlugin,
  rehypeApplyFrontmatterExport,
  remarkInitializeAstroData
};

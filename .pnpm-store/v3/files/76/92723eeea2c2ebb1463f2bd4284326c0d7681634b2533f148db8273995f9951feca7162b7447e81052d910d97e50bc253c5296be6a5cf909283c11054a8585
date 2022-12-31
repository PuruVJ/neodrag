import { loadPlugins } from "./load-plugins.js";
import { rehypeHeadingIds } from "./rehype-collect-headings.js";
import rehypeEscape from "./rehype-escape.js";
import rehypeExpressions from "./rehype-expressions.js";
import rehypeIslands from "./rehype-islands.js";
import rehypeJsx from "./rehype-jsx.js";
import toRemarkContentRelImageError from "./remark-content-rel-image-error.js";
import remarkEscape from "./remark-escape.js";
import { remarkInitializeAstroData } from "./remark-initialize-astro-data.js";
import remarkMarkAndUnravel from "./remark-mark-and-unravel.js";
import remarkMdxish from "./remark-mdxish.js";
import remarkPrism from "./remark-prism.js";
import scopedStyles from "./remark-scoped-styles.js";
import remarkShiki from "./remark-shiki.js";
import remarkUnwrap from "./remark-unwrap.js";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import markdown from "remark-parse";
import markdownToHtml from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { rehypeHeadingIds as rehypeHeadingIds2 } from "./rehype-collect-headings.js";
export * from "./types.js";
const DEFAULT_REMARK_PLUGINS = ["remark-gfm", "remark-smartypants"];
const DEFAULT_REHYPE_PLUGINS = [];
async function renderMarkdown(content, opts) {
  var _a;
  let {
    fileURL,
    syntaxHighlight = "shiki",
    shikiConfig = {},
    remarkPlugins = [],
    rehypePlugins = [],
    remarkRehype = {},
    extendDefaultPlugins = false,
    isAstroFlavoredMd = false,
    isExperimentalContentCollections = false,
    contentDir
  } = opts;
  const input = new VFile({ value: content, path: fileURL });
  const scopedClassName = (_a = opts.$) == null ? void 0 : _a.scopedClassName;
  let parser = unified().use(markdown).use(remarkInitializeAstroData).use(isAstroFlavoredMd ? [remarkMdxish, remarkMarkAndUnravel, remarkUnwrap, remarkEscape] : []);
  if (extendDefaultPlugins || remarkPlugins.length === 0 && rehypePlugins.length === 0) {
    remarkPlugins = [...DEFAULT_REMARK_PLUGINS, ...remarkPlugins];
    rehypePlugins = [...DEFAULT_REHYPE_PLUGINS, ...rehypePlugins];
  }
  const loadedRemarkPlugins = await Promise.all(loadPlugins(remarkPlugins));
  const loadedRehypePlugins = await Promise.all(loadPlugins(rehypePlugins));
  loadedRemarkPlugins.forEach(([plugin, pluginOpts]) => {
    parser.use([[plugin, pluginOpts]]);
  });
  if (scopedClassName) {
    parser.use([scopedStyles(scopedClassName)]);
  }
  if (syntaxHighlight === "shiki") {
    parser.use([await remarkShiki(shikiConfig, scopedClassName)]);
  } else if (syntaxHighlight === "prism") {
    parser.use([remarkPrism(scopedClassName)]);
  }
  if (isExperimentalContentCollections) {
    parser.use([toRemarkContentRelImageError({ contentDir })]);
  }
  parser.use([
    [
      markdownToHtml,
      {
        allowDangerousHtml: true,
        passThrough: isAstroFlavoredMd ? [
          "raw",
          "mdxFlowExpression",
          "mdxJsxFlowElement",
          "mdxJsxTextElement",
          "mdxTextExpression"
        ] : [],
        ...remarkRehype
      }
    ]
  ]);
  loadedRehypePlugins.forEach(([plugin, pluginOpts]) => {
    parser.use([[plugin, pluginOpts]]);
  });
  parser.use(
    isAstroFlavoredMd ? [rehypeJsx, rehypeExpressions, rehypeEscape, rehypeIslands, rehypeHeadingIds] : [rehypeHeadingIds, rehypeRaw]
  ).use(rehypeStringify, { allowDangerousHtml: true });
  let vfile;
  try {
    vfile = await parser.process(input);
  } catch (err) {
    err = prefixError(err, `Failed to parse Markdown file "${input.path}"`);
    console.error(err);
    throw err;
  }
  const headings = (vfile == null ? void 0 : vfile.data.__astroHeadings) || [];
  return {
    metadata: { headings, source: content, html: String(vfile.value) },
    code: String(vfile.value),
    vfile
  };
}
function prefixError(err, prefix) {
  if (err && err.message) {
    try {
      err.message = `${prefix}:
${err.message}`;
      return err;
    } catch (error) {
    }
  }
  const wrappedError = new Error(`${prefix}${err ? `: ${err}` : ""}`);
  try {
    wrappedError.stack = err.stack;
    wrappedError.cause = err;
  } catch (error) {
  }
  return wrappedError;
}
export {
  DEFAULT_REHYPE_PLUGINS,
  DEFAULT_REMARK_PLUGINS,
  rehypeHeadingIds2 as rehypeHeadingIds,
  renderMarkdown
};

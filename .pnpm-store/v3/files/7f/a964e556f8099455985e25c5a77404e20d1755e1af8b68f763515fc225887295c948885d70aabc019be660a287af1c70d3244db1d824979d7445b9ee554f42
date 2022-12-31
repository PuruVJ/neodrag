import { getHighlighter } from "shiki";
import { visit } from "unist-util-visit";
const highlighterCacheAsync = /* @__PURE__ */ new Map();
const remarkShiki = async ({ langs = [], theme = "github-dark", wrap = false }, scopedClassName) => {
  const cacheID = typeof theme === "string" ? theme : theme.name;
  let highlighterAsync = highlighterCacheAsync.get(cacheID);
  if (!highlighterAsync) {
    highlighterAsync = getHighlighter({ theme }).then((hl) => {
      hl.setColorReplacements({
        "#000001": "var(--astro-code-color-text)",
        "#000002": "var(--astro-code-color-background)",
        "#000004": "var(--astro-code-token-constant)",
        "#000005": "var(--astro-code-token-string)",
        "#000006": "var(--astro-code-token-comment)",
        "#000007": "var(--astro-code-token-keyword)",
        "#000008": "var(--astro-code-token-parameter)",
        "#000009": "var(--astro-code-token-function)",
        "#000010": "var(--astro-code-token-string-expression)",
        "#000011": "var(--astro-code-token-punctuation)",
        "#000012": "var(--astro-code-token-link)"
      });
      return hl;
    });
    highlighterCacheAsync.set(cacheID, highlighterAsync);
  }
  const highlighter = await highlighterAsync;
  for (const lang of langs) {
    await highlighter.loadLanguage(lang);
  }
  return () => (tree) => {
    visit(tree, "code", (node) => {
      let lang;
      if (typeof node.lang === "string") {
        const langExists = highlighter.getLoadedLanguages().includes(node.lang);
        if (langExists) {
          lang = node.lang;
        } else {
          console.warn(`The language "${node.lang}" doesn't exist, falling back to plaintext.`);
          lang = "plaintext";
        }
      } else {
        lang = "plaintext";
      }
      let html = highlighter.codeToHtml(node.value, { lang });
      html = html.replace(
        '<pre class="shiki"',
        `<pre is:raw class="astro-code${scopedClassName ? " " + scopedClassName : ""}"`
      );
      if (node.lang === "diff") {
        html = html.replace(
          /<span class="line"><span style="(.*?)">([\+|\-])/g,
          '<span class="line"><span style="$1"><span style="user-select: none;">$2</span>'
        );
      }
      if (wrap === false) {
        html = html.replace(/style="(.*?)"/, 'style="$1; overflow-x: auto;"');
      } else if (wrap === true) {
        html = html.replace(
          /style="(.*?)"/,
          'style="$1; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;"'
        );
      }
      if (scopedClassName) {
        html = html.replace(/\<span class="line"\>/g, `<span class="line ${scopedClassName}"`);
      }
      node.type = "html";
      node.value = html;
      node.children = [];
    });
  };
};
var remark_shiki_default = remarkShiki;
export {
  remark_shiki_default as default
};

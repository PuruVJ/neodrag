import { runHighlighterWithAstro } from "@astrojs/prism/dist/highlighter";
import { visit } from "unist-util-visit";
const noVisit = /* @__PURE__ */ new Set(["root", "html", "text"]);
function transformer(className) {
  return function(tree) {
    const visitor = (node) => {
      let { lang, value } = node;
      node.type = "html";
      let { html, classLanguage } = runHighlighterWithAstro(lang, value);
      let classes = [classLanguage];
      if (className) {
        classes.push(className);
      }
      node.value = `<pre class="${classes.join(
        " "
      )}"><code is:raw class="${classLanguage}">${html}</code></pre>`;
      return node;
    };
    return visit(tree, "code", visitor);
  };
}
function plugin(className) {
  return transformer.bind(null, className);
}
var remark_prism_default = plugin;
export {
  remark_prism_default as default
};

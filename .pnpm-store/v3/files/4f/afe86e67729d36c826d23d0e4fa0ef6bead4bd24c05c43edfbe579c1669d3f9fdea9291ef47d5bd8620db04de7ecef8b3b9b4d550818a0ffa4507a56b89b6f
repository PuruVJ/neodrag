import { runHighlighterWithAstro } from "@astrojs/prism/dist/highlighter";
import { visit } from "unist-util-visit";
function remarkPrism() {
  return (tree) => visit(tree, "code", (node) => {
    let { lang, value } = node;
    node.type = "html";
    let { html, classLanguage } = runHighlighterWithAstro(lang, value);
    let classes = [classLanguage];
    node.value = `<pre class="${classes.join(
      " "
    )}"><code class="${classLanguage}">${html}</code></pre>`;
    return node;
  });
}
export {
  remarkPrism as default
};

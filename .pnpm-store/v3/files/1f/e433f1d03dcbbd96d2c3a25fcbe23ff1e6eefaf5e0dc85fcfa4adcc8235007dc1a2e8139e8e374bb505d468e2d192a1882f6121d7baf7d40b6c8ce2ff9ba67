import { SKIP, visit as _visit } from "unist-util-visit";
const visit = _visit;
function remarkUnwrap() {
  const astroRootNodes = /* @__PURE__ */ new Set();
  let insideAstroRoot = false;
  return (tree) => {
    insideAstroRoot = false;
    astroRootNodes.clear();
    visit(tree, "html", (node) => {
      if (node.value.indexOf("<astro-island") > -1 && !insideAstroRoot) {
        insideAstroRoot = true;
      }
      if (node.value.indexOf("</astro-island") > -1 && insideAstroRoot) {
        insideAstroRoot = false;
      }
      astroRootNodes.add(node);
    });
    visit(tree, "paragraph", (node, index, parent) => {
      if (parent && typeof index === "number" && containsAstroRootNode(node)) {
        parent.children.splice(index, 1, ...node.children);
        return [SKIP, index];
      }
    });
  };
  function containsAstroRootNode(node) {
    return node.children.map((child) => astroRootNodes.has(child)).reduce((all, v) => all ? all : v, false);
  }
}
export {
  remarkUnwrap as default
};

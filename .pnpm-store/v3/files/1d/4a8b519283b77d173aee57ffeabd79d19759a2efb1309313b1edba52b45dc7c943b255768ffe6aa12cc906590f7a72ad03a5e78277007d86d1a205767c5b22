import { visit } from "unist-util-visit";
const noVisit = /* @__PURE__ */ new Set(["root", "html", "text"]);
function scopedStyles(className) {
  const visitor = (node) => {
    var _a;
    if (noVisit.has(node.type))
      return;
    const { data } = node;
    let currentClassName = ((_a = data == null ? void 0 : data.hProperties) == null ? void 0 : _a.class) ?? "";
    node.data = node.data || {};
    node.data.hProperties = node.data.hProperties || {};
    node.data.hProperties.class = `${className} ${currentClassName}`.trim();
    return node;
  };
  return () => (tree) => visit(tree, visitor);
}
export {
  scopedStyles as default
};

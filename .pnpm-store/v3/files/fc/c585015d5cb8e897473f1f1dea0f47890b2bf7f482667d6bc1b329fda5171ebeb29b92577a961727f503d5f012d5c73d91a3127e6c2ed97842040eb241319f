import { visit } from "unist-util-visit";
function rehypeMetaString() {
  return function(tree) {
    visit(tree, (node) => {
      var _a;
      if (node.type === "element" && node.tagName === "code" && ((_a = node.data) == null ? void 0 : _a.meta)) {
        node.properties ?? (node.properties = {});
        node.properties.metastring = node.data.meta;
      }
    });
  };
}
export {
  rehypeMetaString as default
};

import { map } from "unist-util-map";
function rehypeExpressions() {
  return function(node) {
    return map(node, (child) => {
      if (child.type === "text") {
        return { ...child, type: "raw" };
      }
      if (child.type === "mdxTextExpression") {
        return { type: "raw", value: `{${child.value}}` };
      }
      if (child.type === "mdxFlowExpression") {
        return { type: "raw", value: `{${child.value}}` };
      }
      return child;
    });
  };
}
export {
  rehypeExpressions as default
};

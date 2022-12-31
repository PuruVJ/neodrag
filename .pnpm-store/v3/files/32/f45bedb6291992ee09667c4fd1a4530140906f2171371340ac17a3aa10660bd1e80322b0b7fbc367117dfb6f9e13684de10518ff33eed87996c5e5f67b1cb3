import { SKIP, visit } from "unist-util-visit";
function escapeEntities(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function rehypeEscape() {
  return function(node) {
    return visit(node, "element", (el) => {
      if (el.tagName === "code" || el.tagName === "pre") {
        el.properties["is:raw"] = true;
        visit(el, "raw", (raw) => {
          raw.value = escapeEntities(raw.value);
        });
        return SKIP;
      }
    });
  };
}
export {
  rehypeEscape as default,
  escapeEntities
};

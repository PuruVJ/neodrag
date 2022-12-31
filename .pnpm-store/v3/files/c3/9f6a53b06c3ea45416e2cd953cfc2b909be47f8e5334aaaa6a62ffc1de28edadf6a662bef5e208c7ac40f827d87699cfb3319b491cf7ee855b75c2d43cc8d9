import { SKIP, visit as _visit } from "unist-util-visit";
const visit = _visit;
function rehypeIslands() {
  return function(node) {
    return visit(node, "element", (el) => {
      if (el.tagName == "astro-island") {
        visit(el, "text", (child, index, parent) => {
          if (child.type === "text") {
            if (parent && child.value.indexOf("<!--") > -1 && index != null) {
              parent.children.splice(index, 1, {
                ...child,
                type: "comment",
                value: child.value.replace("<!--", "").replace("-->", "").trim()
              });
              return [SKIP, index];
            }
            child.value = child.value.replace(/\n+/g, "");
            return child;
          }
        });
      }
    });
  };
}
export {
  rehypeIslands as default
};

import { visit } from "unist-util-visit";
const MDX_ELEMENTS = ["mdxJsxFlowElement", "mdxJsxTextElement"];
function rehypeJsx() {
  return function(tree) {
    visit(tree, MDX_ELEMENTS, (node, index, parent) => {
      if (index === null || !Boolean(parent))
        return;
      const attrs = node.attributes.reduce((acc, entry) => {
        let attr = entry.value;
        if (attr && typeof attr === "object") {
          attr = `{${attr.value}}`;
        } else if (attr && entry.type === "mdxJsxExpressionAttribute") {
          attr = `{${attr}}`;
        } else if (attr === null) {
          attr = "";
        } else if (typeof attr === "string") {
          attr = `"${attr}"`;
        }
        if (!entry.name) {
          return acc + ` ${attr}`;
        }
        return acc + ` ${entry.name}${attr ? "=" : ""}${attr}`;
      }, "");
      if (node.children.length === 0) {
        node.type = "raw";
        node.value = `<${node.name}${attrs} />`;
        return;
      }
      if (node.name === "a") {
        visit(node, "element", (el, elIndex, elParent) => {
          const isAutolink = el.tagName === "a" && el.children.length === 1 && el.children[0].type === "text" && el.children[0].value.match(/^(https?:\/\/|www\.)/i);
          if (isAutolink) {
            elParent.children.splice(elIndex, 1, el.children[0]);
          }
        });
      }
      const openingTag = {
        type: "raw",
        value: `<${node.name}${attrs}>`
      };
      const closingTag = {
        type: "raw",
        value: `</${node.name}>`
      };
      parent.children.splice(index, 1, openingTag, ...node.children, closingTag);
    });
  };
}
export {
  rehypeJsx as default
};

import { visit } from "unist-util-visit";
function remarkMarkAndUnravel() {
  return (tree) => {
    visit(tree, (node, index, parent_) => {
      const parent = parent_;
      let offset = -1;
      let all = true;
      let oneOrMore;
      if (parent && typeof index === "number" && node.type === "paragraph") {
        const children = node.children;
        while (++offset < children.length) {
          const child = children[offset];
          if (child.type === "mdxJsxTextElement" || child.type === "mdxTextExpression") {
            oneOrMore = true;
          } else if (child.type === "text" && /^[\t\r\n ]+$/.test(String(child.value))) {
          } else {
            all = false;
            break;
          }
        }
        if (all && oneOrMore) {
          offset = -1;
          while (++offset < children.length) {
            const child = children[offset];
            if (child.type === "mdxJsxTextElement") {
              child.type = "mdxJsxFlowElement";
            }
            if (child.type === "mdxTextExpression") {
              child.type = "mdxFlowExpression";
            }
          }
          parent.children.splice(index, 1, ...children);
          return index;
        }
      }
      if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        const data = node.data || (node.data = {});
        data._mdxExplicitJsx = true;
      }
    });
  };
}
export {
  remarkMarkAndUnravel as default
};

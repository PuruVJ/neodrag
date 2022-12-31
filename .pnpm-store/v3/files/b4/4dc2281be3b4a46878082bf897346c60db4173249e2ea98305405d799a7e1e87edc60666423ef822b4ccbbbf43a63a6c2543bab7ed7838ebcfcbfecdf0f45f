import { visit } from "unist-util-visit";
function remarkEscape() {
  return (tree) => {
    visit(tree, "code", removeCommentWrapper);
    visit(tree, "inlineCode", removeCommentWrapper);
  };
  function removeCommentWrapper(node) {
    node.value = node.value.replace(/{\/\*<!--/gs, "<!--").replace(/-->\*\/}/gs, "-->");
  }
}
export {
  remarkEscape as default
};

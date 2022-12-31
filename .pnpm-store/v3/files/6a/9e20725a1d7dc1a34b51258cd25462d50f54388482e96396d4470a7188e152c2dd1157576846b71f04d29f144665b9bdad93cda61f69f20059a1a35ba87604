import { jsToTreeNode } from "./utils.js";
function rehypeInjectHeadingsExport() {
  return function(tree, file) {
    const headings = file.data.__astroHeadings || [];
    tree.children.unshift(
      jsToTreeNode(`export function getHeadings() { return ${JSON.stringify(headings)} }`)
    );
  };
}
export {
  rehypeInjectHeadingsExport
};

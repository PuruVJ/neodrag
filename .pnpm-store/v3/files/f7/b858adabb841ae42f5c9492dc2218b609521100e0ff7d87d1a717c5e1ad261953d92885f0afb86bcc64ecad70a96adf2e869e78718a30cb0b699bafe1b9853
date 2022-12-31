import { mdxExpressionFromMarkdown, mdxExpressionToMarkdown } from "mdast-util-mdx-expression";
import { mdxJsxFromMarkdown, mdxJsxToMarkdown } from "mdast-util-mdx-jsx";
function mdxFromMarkdown() {
  return [mdxExpressionFromMarkdown, mdxJsxFromMarkdown];
}
function mdxToMarkdown() {
  return {
    extensions: [mdxExpressionToMarkdown, mdxJsxToMarkdown]
  };
}
export {
  mdxFromMarkdown,
  mdxToMarkdown
};

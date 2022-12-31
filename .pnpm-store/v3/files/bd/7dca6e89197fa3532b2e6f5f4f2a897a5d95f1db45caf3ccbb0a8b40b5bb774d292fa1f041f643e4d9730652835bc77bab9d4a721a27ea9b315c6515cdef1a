import { mdxJsx } from "@astrojs/micromark-extension-mdx-jsx";
import { Parser } from "acorn";
import acornJsx from "acorn-jsx";
import { mdxExpression } from "micromark-extension-mdx-expression";
import { mdxMd } from "micromark-extension-mdx-md";
import { combineExtensions } from "micromark-util-combine-extensions";
function mdxjs(options) {
  const settings = Object.assign(
    {
      acorn: Parser.extend(acornJsx()),
      acornOptions: { ecmaVersion: 2020, sourceType: "module" },
      addResult: true
    },
    options
  );
  return combineExtensions([mdxExpression(settings), mdxJsx(settings), mdxMd]);
}
export {
  mdxjs
};

import generator from "@babel/generator";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
const visit = traverse.default;
async function generate(ast) {
  const astToText = generator.default;
  const { code } = astToText(ast);
  return code;
}
const parse = (code) => parser.parse(code, { sourceType: "unambiguous", plugins: ["typescript"] });
export {
  generate,
  parse,
  t,
  visit
};

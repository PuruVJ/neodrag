import { mdxFromMarkdown, mdxToMarkdown } from "./mdast-util-mdxish.js";
import { mdxjs } from "./mdxjs.js";
const extMdxJs = mdxjs({});
const extMdxFromMarkdown = makeFromMarkdownLessStrict(mdxFromMarkdown());
const extMdxToMarkdown = mdxToMarkdown();
function remarkMdxish() {
  const data = this.data();
  add("micromarkExtensions", extMdxJs);
  add("fromMarkdownExtensions", extMdxFromMarkdown);
  add("toMarkdownExtensions", extMdxToMarkdown);
  function add(field, value) {
    const list = data[field] ? data[field] : data[field] = [];
    list.push(value);
  }
}
function makeFromMarkdownLessStrict(extensions) {
  extensions.forEach((extension) => {
    ["mdxJsxFlowTag", "mdxJsxTextTag"].forEach((exitHandler) => {
      if (!extension.exit || !extension.exit[exitHandler])
        return;
      extension.exit[exitHandler] = chainHandlers(fixSelfClosing, extension.exit[exitHandler]);
    });
  });
  return extensions;
}
const selfClosingTags = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr"
]);
function fixSelfClosing() {
  const tag = this.getData("mdxJsxTag");
  if (tag.name && selfClosingTags.has(tag.name))
    tag.selfClosing = true;
}
function chainHandlers(...handlers) {
  return function handlerChain(token) {
    handlers.forEach((handler) => handler.call(this, token));
  };
}
export {
  remarkMdxish as default
};

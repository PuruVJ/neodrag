import { renderElement } from "./util.js";
const stylesheetRel = "stylesheet";
function renderStyleElement(children) {
  return renderElement("style", {
    props: {},
    children
  });
}
function renderStylesheet({ href }) {
  return renderElement(
    "link",
    {
      props: {
        rel: stylesheetRel,
        href
      },
      children: ""
    },
    false
  );
}
function renderUniqueStylesheet(result, link) {
  for (const existingLink of result.links) {
    if (existingLink.props.rel === stylesheetRel && existingLink.props.href === link.href) {
      return "";
    }
  }
  return renderStylesheet(link);
}
export {
  renderStyleElement,
  renderStylesheet,
  renderUniqueStylesheet
};

import { createComponent } from "./astro-component.js";
import { createAstro } from "./astro-global.js";
import { renderEndpoint } from "./endpoint.js";
import { escapeHTML, HTMLBytes, HTMLString, markHTMLString, unescapeHTML } from "./escape.js";
import { renderJSX } from "./jsx.js";
import {
  addAttribute,
  createHeadAndContent,
  defineScriptVars,
  Fragment,
  maybeRenderHead,
  renderAstroTemplateResult,
  renderComponent,
  renderComponentToIterable,
  Renderer,
  renderHead,
  renderHTMLElement,
  renderPage,
  renderSlot,
  renderStyleElement,
  renderTemplate,
  renderTemplate as renderTemplate2,
  renderToString,
  renderUniqueStylesheet,
  stringifyChunk,
  voidElementNames
} from "./render/index.js";
import { markHTMLString as markHTMLString2 } from "./escape.js";
import { addAttribute as addAttribute2, Renderer as Renderer2 } from "./render/index.js";
function mergeSlots(...slotted) {
  const slots = {};
  for (const slot of slotted) {
    if (!slot)
      continue;
    if (typeof slot === "object") {
      Object.assign(slots, slot);
    } else if (typeof slot === "function") {
      Object.assign(slots, mergeSlots(slot()));
    }
  }
  return slots;
}
function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer2, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute2(value, key, true);
  }
  return markHTMLString2(output);
}
function defineStyleVars(defs) {
  let output = "";
  let arr = !Array.isArray(defs) ? [defs] : defs;
  for (const vars of arr) {
    for (const [key, value] of Object.entries(vars)) {
      if (value || value === 0) {
        output += `--${key}: ${value};`;
      }
    }
  }
  return markHTMLString2(output);
}
export {
  Fragment,
  HTMLBytes,
  HTMLString,
  Renderer,
  __astro_tag_component__,
  addAttribute,
  createAstro,
  createComponent,
  createHeadAndContent,
  defineScriptVars,
  defineStyleVars,
  escapeHTML,
  markHTMLString,
  maybeRenderHead,
  mergeSlots,
  renderTemplate as render,
  renderAstroTemplateResult as renderAstroComponent,
  renderComponent,
  renderComponentToIterable,
  renderEndpoint,
  renderHTMLElement,
  renderHead,
  renderJSX,
  renderPage,
  renderSlot,
  renderStyleElement,
  renderTemplate2 as renderTemplate,
  renderToString,
  renderUniqueStylesheet,
  spreadAttributes,
  stringifyChunk,
  unescapeHTML,
  voidElementNames
};

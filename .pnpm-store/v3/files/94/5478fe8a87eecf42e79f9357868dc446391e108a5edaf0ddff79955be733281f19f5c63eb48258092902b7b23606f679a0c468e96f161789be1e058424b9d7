import npath from "path-browserify";
import { appendForwardSlash } from "../../core/path.js";
function getRootPath(base) {
  return appendForwardSlash(new URL(base || "/", "http://localhost/").pathname);
}
function joinToRoot(href, base) {
  return npath.posix.join(getRootPath(base), href);
}
function createLinkStylesheetElement(href, base) {
  return {
    props: {
      rel: "stylesheet",
      href: joinToRoot(href, base)
    },
    children: ""
  };
}
function createLinkStylesheetElementSet(hrefs, base) {
  return new Set(hrefs.map((href) => createLinkStylesheetElement(href, base)));
}
function createModuleScriptElement(script, base) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, site) {
  return {
    props: {
      type: "module",
      src: joinToRoot(src, site)
    },
    children: ""
  };
}
function createModuleScriptElementWithSrcSet(srces, site) {
  return new Set(srces.map((src) => createModuleScriptElementWithSrc(src, site)));
}
function createModuleScriptsSet(scripts, base) {
  return new Set(scripts.map((script) => createModuleScriptElement(script, base)));
}
export {
  createLinkStylesheetElement,
  createLinkStylesheetElementSet,
  createModuleScriptElement,
  createModuleScriptElementWithSrc,
  createModuleScriptElementWithSrcSet,
  createModuleScriptsSet
};

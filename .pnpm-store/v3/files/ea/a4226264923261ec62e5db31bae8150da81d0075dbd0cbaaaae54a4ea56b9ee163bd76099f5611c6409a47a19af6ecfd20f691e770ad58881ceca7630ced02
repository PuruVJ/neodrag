import { visit } from "unist-util-visit";
import { pathToFileURL } from "url";
function toRemarkContentRelImageError({ contentDir }) {
  return function remarkContentRelImageError() {
    return (tree, vfile) => {
      const isContentFile = pathToFileURL(vfile.path).href.startsWith(contentDir.href);
      if (!isContentFile)
        return;
      const relImagePaths = /* @__PURE__ */ new Set();
      visit(tree, "image", function raiseError(node) {
        if (isRelativePath(node.url)) {
          relImagePaths.add(node.url);
        }
      });
      if (relImagePaths.size === 0)
        return;
      const errorMessage = `Relative image paths are not supported in the content/ directory. Place local images in the public/ directory and use absolute paths (see https://docs.astro.build/en/guides/images/#in-markdown-files)
` + [...relImagePaths].map((path) => JSON.stringify(path)).join(",\n");
      throw errorMessage;
    };
  };
}
function isRelativePath(path) {
  return startsWithDotDotSlash(path) || startsWithDotSlash(path);
}
function startsWithDotDotSlash(path) {
  const c1 = path[0];
  const c2 = path[1];
  const c3 = path[2];
  return c1 === "." && c2 === "." && c3 === "/";
}
function startsWithDotSlash(path) {
  const c1 = path[0];
  const c2 = path[1];
  return c1 === "." && c2 === "/";
}
export {
  toRemarkContentRelImageError as default
};

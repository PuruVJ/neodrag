import { transform } from "./transform/index.js";
function html() {
  return {
    name: "astro:html",
    options(options) {
      var _a;
      options.plugins = (_a = options.plugins) == null ? void 0 : _a.filter((p) => p.name !== "vite:build-html");
    },
    async transform(source, id) {
      if (!id.endsWith(".html"))
        return;
      return await transform(source, id);
    }
  };
}
export {
  html as default
};

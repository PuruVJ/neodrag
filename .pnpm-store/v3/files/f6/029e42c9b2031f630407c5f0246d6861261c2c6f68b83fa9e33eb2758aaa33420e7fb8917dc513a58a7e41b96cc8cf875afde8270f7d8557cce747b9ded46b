function src_default(options = {}) {
  return {
    name: "@astrojs/prefetch",
    hooks: {
      "astro:config:setup": ({ injectScript }) => {
        injectScript(
          "page",
          `import prefetch from "@astrojs/prefetch/client.js"; prefetch(${JSON.stringify(
            options
          )});`
        );
      }
    }
  };
}
export {
  src_default as default
};

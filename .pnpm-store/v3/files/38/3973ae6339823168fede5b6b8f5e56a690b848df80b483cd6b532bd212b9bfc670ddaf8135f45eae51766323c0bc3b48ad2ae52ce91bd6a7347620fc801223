import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
function getRenderer() {
  return {
    name: "@astrojs/svelte",
    clientEntrypoint: "@astrojs/svelte/client.js",
    serverEntrypoint: "@astrojs/svelte/server.js"
  };
}
function getViteConfiguration({
  options,
  postcssConfig,
  isDev
}) {
  const defaultOptions = {
    emitCss: true,
    compilerOptions: { dev: isDev, hydratable: true },
    preprocess: [
      preprocess({
        less: true,
        postcss: postcssConfig,
        sass: { renderSync: true },
        scss: { renderSync: true },
        stylus: true,
        typescript: true
      })
    ]
  };
  if (!isDev) {
    defaultOptions.hot = false;
  }
  let resolvedOptions;
  if (!options) {
    resolvedOptions = defaultOptions;
  } else if (typeof options === "function") {
    resolvedOptions = options(defaultOptions);
  } else {
    resolvedOptions = {
      ...options,
      ...defaultOptions,
      compilerOptions: {
        ...options.compilerOptions,
        ...defaultOptions.compilerOptions
      },
      preprocess: options.preprocess ?? defaultOptions.preprocess
    };
  }
  return {
    optimizeDeps: {
      include: ["@astrojs/svelte/client.js", "svelte", "svelte/internal"],
      exclude: ["@astrojs/svelte/server.js"]
    },
    plugins: [svelte(resolvedOptions)]
  };
}
function src_default(options) {
  return {
    name: "@astrojs/svelte",
    hooks: {
      "astro:config:setup": ({ command, updateConfig, addRenderer, config }) => {
        addRenderer(getRenderer());
        updateConfig({
          vite: getViteConfiguration({
            options,
            isDev: command === "dev",
            postcssConfig: config.style.postcss
          })
        });
      }
    }
  };
}
export {
  src_default as default
};

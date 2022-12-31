import MagicString from "magic-string";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";
function getPrivateEnv(viteConfig, astroConfig) {
  let envPrefixes = ["PUBLIC_"];
  if (viteConfig.envPrefix) {
    envPrefixes = Array.isArray(viteConfig.envPrefix) ? viteConfig.envPrefix : [viteConfig.envPrefix];
  }
  const fullEnv = loadEnv(
    viteConfig.mode,
    viteConfig.envDir ?? fileURLToPath(astroConfig.root),
    ""
  );
  const privateEnv = {};
  for (const key in fullEnv) {
    if (envPrefixes.every((prefix) => !key.startsWith(prefix))) {
      if (typeof process.env[key] !== "undefined") {
        privateEnv[key] = `process.env.${key}`;
      } else {
        privateEnv[key] = JSON.stringify(fullEnv[key]);
      }
    }
  }
  privateEnv.SITE = astroConfig.site ? JSON.stringify(astroConfig.site) : "undefined";
  privateEnv.SSR = JSON.stringify(true);
  privateEnv.BASE_URL = astroConfig.base ? JSON.stringify(astroConfig.base) : "undefined";
  return privateEnv;
}
function getReferencedPrivateKeys(source, privateEnv) {
  const references = /* @__PURE__ */ new Set();
  for (const key in privateEnv) {
    if (source.includes(key)) {
      references.add(key);
    }
  }
  return references;
}
function envVitePlugin({ settings }) {
  let privateEnv;
  let viteConfig;
  const { config: astroConfig } = settings;
  return {
    name: "astro:vite-plugin-env",
    enforce: "pre",
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    async transform(source, id, options) {
      if (!(options == null ? void 0 : options.ssr) || !source.includes("import.meta.env")) {
        return;
      }
      let s;
      const pattern = new RegExp(
        `(?<!(?<!\\.\\.)\\.)\\b(import\\.meta\\.env\\.(.+?)|import\\.meta\\.env)\\b(?!\\s*?=[^=])`,
        "g"
      );
      let references;
      let match;
      while (match = pattern.exec(source)) {
        let replacement;
        if (match[0] === "import.meta.env") {
          privateEnv ?? (privateEnv = getPrivateEnv(viteConfig, astroConfig));
          references ?? (references = getReferencedPrivateKeys(source, privateEnv));
          replacement = `(Object.assign(import.meta.env,{`;
          for (const key of references.values()) {
            replacement += `${key}:${privateEnv[key]},`;
          }
          replacement += "}))";
        } else if (match[2]) {
          privateEnv ?? (privateEnv = getPrivateEnv(viteConfig, astroConfig));
          replacement = privateEnv[match[2]];
        }
        if (replacement) {
          const start = match.index;
          const end = start + match[0].length;
          s ?? (s = new MagicString(source));
          s.overwrite(start, end, replacement);
        }
      }
      if (s) {
        return {
          code: s.toString(),
          map: s.generateMap()
        };
      }
    }
  };
}
export {
  envVitePlugin as default
};

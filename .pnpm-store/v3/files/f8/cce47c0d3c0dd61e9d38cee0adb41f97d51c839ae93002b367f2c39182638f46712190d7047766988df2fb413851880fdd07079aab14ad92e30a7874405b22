const EVENT_SESSION = "ASTRO_CLI_SESSION_STARTED";
const multiLevelKeys = /* @__PURE__ */ new Set([
  "build",
  "markdown",
  "markdown.shikiConfig",
  "server",
  "vite",
  "vite.resolve",
  "vite.css",
  "vite.json",
  "vite.server",
  "vite.server.fs",
  "vite.build",
  "vite.preview",
  "vite.optimizeDeps",
  "vite.ssr",
  "vite.worker"
]);
function configKeys(obj, parentKey) {
  if (!obj) {
    return [];
  }
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      const localKey = parentKey ? parentKey + "." + key : key;
      if (multiLevelKeys.has(localKey)) {
        let keys = configKeys(value, localKey).map((subkey) => key + "." + subkey);
        keys.unshift(key);
        return keys;
      }
    }
    return key;
  }).flat(1);
}
function eventCliSession(cliCommand, userConfig, flags) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const configValues = userConfig ? {
    markdownPlugins: [
      ...((_b = (_a = userConfig == null ? void 0 : userConfig.markdown) == null ? void 0 : _a.remarkPlugins) == null ? void 0 : _b.map(
        (p) => typeof p === "string" ? p : typeof p
      )) ?? [],
      ...((_d = (_c = userConfig == null ? void 0 : userConfig.markdown) == null ? void 0 : _c.rehypePlugins) == null ? void 0 : _d.map(
        (p) => typeof p === "string" ? p : typeof p
      )) ?? []
    ],
    adapter: ((_e = userConfig == null ? void 0 : userConfig.adapter) == null ? void 0 : _e.name) ?? null,
    integrations: ((userConfig == null ? void 0 : userConfig.integrations) ?? []).filter(Boolean).map((i) => i == null ? void 0 : i.name),
    trailingSlash: userConfig == null ? void 0 : userConfig.trailingSlash,
    build: (userConfig == null ? void 0 : userConfig.build) ? {
      format: (_f = userConfig == null ? void 0 : userConfig.build) == null ? void 0 : _f.format
    } : void 0,
    markdown: (userConfig == null ? void 0 : userConfig.markdown) ? {
      drafts: (_g = userConfig.markdown) == null ? void 0 : _g.drafts,
      syntaxHighlight: (_h = userConfig.markdown) == null ? void 0 : _h.syntaxHighlight
    } : void 0
  } : void 0;
  const cliFlags = flags ? Object.keys(flags).filter((name) => name != "_") : void 0;
  const payload = {
    cliCommand,
    configKeys: userConfig ? configKeys(userConfig, "") : void 0,
    config: configValues,
    flags: cliFlags
  };
  return [{ eventName: EVENT_SESSION, payload }];
}
export {
  eventCliSession
};

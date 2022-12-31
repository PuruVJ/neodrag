import * as path from "path";
const normalize = (pathname) => String(pathname).split(path.sep).join(path.posix.sep);
const getConfigAlias = (settings) => {
  const config = settings.tsConfig;
  const configPath = settings.tsConfigPath;
  if (!config || !configPath)
    return null;
  const compilerOptions = Object(config.compilerOptions);
  if (!compilerOptions.baseUrl)
    return null;
  const baseUrl = path.posix.resolve(
    path.posix.dirname(normalize(configPath).replace(/^\/?/, "/")),
    normalize(compilerOptions.baseUrl)
  );
  const aliases = [];
  for (let [alias, values] of Object.entries(
    Object(compilerOptions.paths)
  )) {
    values = [].concat(values);
    const find = new RegExp(
      `^${[...alias].map(
        (segment) => segment === "*" ? "(.+)" : segment.replace(/[\\^$*+?.()|[\]{}]/, "\\$&")
      ).join("")}$`
    );
    let matchId = 0;
    for (let value of values) {
      const replacement = [...path.posix.resolve(baseUrl, value)].map((segment) => segment === "*" ? `$${++matchId}` : segment === "$" ? "$$" : segment).join("");
      aliases.push({ find, replacement });
    }
  }
  aliases.push({
    find: /^(?!\.*\/)(.+)$/,
    replacement: `${[...baseUrl].map((segment) => segment === "$" ? "$$" : segment).join("")}/$1`
  });
  return aliases;
};
function configAliasVitePlugin({
  settings
}) {
  const { config } = settings;
  const configAlias = getConfigAlias(settings);
  if (!configAlias)
    return {};
  return {
    name: "astro:tsconfig-alias",
    enforce: "pre",
    async resolveId(sourceId, importer, options) {
      const resolvedId = await this.resolve(sourceId, importer, { skipSelf: true, ...options });
      if (resolvedId)
        return resolvedId;
      for (const alias of configAlias) {
        if (alias.find.test(sourceId)) {
          const aliasedSourceId = sourceId.replace(alias.find, alias.replacement);
          const resolvedAliasedId = await this.resolve(aliasedSourceId, importer, {
            skipSelf: true,
            ...options
          });
          if (resolvedAliasedId)
            return resolvedAliasedId;
        }
      }
    }
  };
}
export {
  configAliasVitePlugin as default
};

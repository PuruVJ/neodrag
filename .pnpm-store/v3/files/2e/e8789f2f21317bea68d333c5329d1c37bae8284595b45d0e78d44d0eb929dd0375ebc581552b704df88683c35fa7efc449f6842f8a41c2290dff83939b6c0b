import nodeFs from "fs";
import npath from "path";
import slashify from "slash";
function loadFallbackPlugin({
  fs,
  root
}) {
  if (!fs || fs === nodeFs) {
    return false;
  }
  const tryLoadModule = async (id) => {
    try {
      return await fs.promises.readFile(cleanUrl(id), "utf-8");
    } catch (e) {
      try {
        return await fs.promises.readFile(id, "utf-8");
      } catch (e2) {
        try {
          const fullpath = new URL("." + id, root);
          return await fs.promises.readFile(fullpath, "utf-8");
        } catch (e3) {
        }
      }
    }
  };
  return [
    {
      name: "astro:load-fallback",
      enforce: "post",
      async resolveId(id, parent) {
        if (parent) {
          const candidateId = npath.posix.join(npath.posix.dirname(slashify(parent)), id);
          try {
            const stats = await fs.promises.stat(candidateId);
            if (!stats.isDirectory()) {
              return candidateId;
            }
          } catch {
          }
        }
        let resolved = await this.resolve(id, parent, { skipSelf: true });
        if (resolved) {
          return resolved.id;
        }
        return slashify(id);
      },
      async load(id) {
        const source = await tryLoadModule(id);
        return source;
      }
    },
    {
      name: "astro:load-fallback-hmr",
      enforce: "pre",
      handleHotUpdate(context) {
        const read = context.read;
        context.read = async () => {
          const source = await tryLoadModule(context.file);
          if (source)
            return source;
          return read.call(context);
        };
      }
    }
  ];
}
const queryRE = /\?.*$/s;
const hashRE = /#.*$/s;
const cleanUrl = (url) => url.replace(hashRE, "").replace(queryRE, "");
export {
  loadFallbackPlugin as default
};

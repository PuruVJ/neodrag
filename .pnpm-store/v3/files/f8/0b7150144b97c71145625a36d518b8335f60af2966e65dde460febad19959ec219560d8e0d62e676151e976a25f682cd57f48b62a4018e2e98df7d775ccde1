import { prependForwardSlash } from "../core/path.js";
import {
  createComponent,
  createHeadAndContent,
  renderComponent,
  renderStyleElement,
  renderTemplate,
  renderUniqueStylesheet,
  unescapeHTML
} from "../runtime/server/index.js";
function createCollectionToGlobResultMap({
  globResult,
  contentDir
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1)
      continue;
    const collection = segments[0];
    const entryId = segments.slice(1).join("/");
    collectionToGlobResultMap[collection] ?? (collectionToGlobResultMap[collection] = {});
    collectionToGlobResultMap[collection][entryId] = globResult[key];
  }
  return collectionToGlobResultMap;
}
function createGetCollection({
  collectionToEntryMap,
  collectionToRenderEntryMap
}) {
  return async function getCollection(collection, filter) {
    const lazyImports = Object.values(collectionToEntryMap[collection] ?? {});
    const entries = Promise.all(
      lazyImports.map(async (lazyImport) => {
        const entry = await lazyImport();
        return {
          id: entry.id,
          slug: entry.slug,
          body: entry.body,
          collection: entry.collection,
          data: entry.data,
          async render() {
            return render({
              collection: entry.collection,
              id: entry.id,
              collectionToRenderEntryMap
            });
          }
        };
      })
    );
    if (typeof filter === "function") {
      return (await entries).filter(filter);
    } else {
      return entries;
    }
  };
}
function createGetEntry({
  collectionToEntryMap,
  collectionToRenderEntryMap
}) {
  return async function getEntry(collection, entryId) {
    var _a;
    const lazyImport = (_a = collectionToEntryMap[collection]) == null ? void 0 : _a[entryId];
    if (!lazyImport)
      throw new Error(`Failed to import ${JSON.stringify(entryId)}.`);
    const entry = await lazyImport();
    return {
      id: entry.id,
      slug: entry.slug,
      body: entry.body,
      collection: entry.collection,
      data: entry.data,
      async render() {
        return render({
          collection: entry.collection,
          id: entry.id,
          collectionToRenderEntryMap
        });
      }
    };
  };
}
async function render({
  collection,
  id,
  collectionToRenderEntryMap
}) {
  var _a;
  const lazyImport = (_a = collectionToRenderEntryMap[collection]) == null ? void 0 : _a[id];
  if (!lazyImport)
    throw new Error(`${String(collection)} \u2192 ${String(id)} does not exist.`);
  const mod = await lazyImport();
  const Content = createComponent({
    factory(result, props, slots) {
      let styles = "", links = "";
      if (Array.isArray(mod == null ? void 0 : mod.collectedStyles)) {
        styles = mod.collectedStyles.map((style) => renderStyleElement(style)).join("");
      }
      if (Array.isArray(mod == null ? void 0 : mod.collectedLinks)) {
        links = mod.collectedLinks.map((link) => {
          return renderUniqueStylesheet(result, {
            href: prependForwardSlash(link)
          });
        }).join("");
      }
      return createHeadAndContent(
        unescapeHTML(styles + links),
        renderTemplate`${renderComponent(result, "Content", mod.Content, props, slots)}`
      );
    },
    propagation: "self"
  });
  if (!mod._internal && id.endsWith(".mdx")) {
    throw new Error(`[Content] Failed to render MDX entry. Try installing @astrojs/mdx@latest`);
  }
  return {
    Content,
    headings: mod.getHeadings(),
    injectedFrontmatter: mod._internal.injectedFrontmatter
  };
}
export {
  createCollectionToGlobResultMap,
  createGetCollection,
  createGetEntry
};

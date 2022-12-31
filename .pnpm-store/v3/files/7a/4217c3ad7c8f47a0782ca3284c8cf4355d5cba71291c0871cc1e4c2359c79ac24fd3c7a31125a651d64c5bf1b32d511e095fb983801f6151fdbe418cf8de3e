async function loadRenderer(renderer, loader) {
  const mod = await loader(renderer.serverEntrypoint);
  if (typeof mod.default !== "undefined") {
    return createLoadedRenderer(renderer, mod);
  }
  return void 0;
}
function filterFoundRenderers(renderers) {
  return renderers.filter((renderer) => {
    return !!renderer;
  });
}
function createLoadedRenderer(renderer, mod) {
  return {
    ...renderer,
    ssr: mod.default
  };
}
export {
  createLoadedRenderer,
  filterFoundRenderers,
  loadRenderer
};

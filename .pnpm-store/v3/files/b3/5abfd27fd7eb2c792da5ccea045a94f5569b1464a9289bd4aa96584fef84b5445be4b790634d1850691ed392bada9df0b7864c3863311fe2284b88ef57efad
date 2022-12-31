function matchRoute(pathname, manifest) {
  return manifest.routes.find((route) => route.pattern.test(pathname));
}
function matchAssets(route, assets) {
  for (const asset of assets) {
    if (!asset.endsWith(".html"))
      continue;
    if (route.pattern.test(asset)) {
      return asset;
    }
    if (route.pattern.test(asset.replace(/index\.html$/, ""))) {
      return asset;
    }
  }
}
function matchAllRoutes(pathname, manifest) {
  return manifest.routes.filter((route) => route.pattern.test(pathname));
}
export {
  matchAllRoutes,
  matchAssets,
  matchRoute
};

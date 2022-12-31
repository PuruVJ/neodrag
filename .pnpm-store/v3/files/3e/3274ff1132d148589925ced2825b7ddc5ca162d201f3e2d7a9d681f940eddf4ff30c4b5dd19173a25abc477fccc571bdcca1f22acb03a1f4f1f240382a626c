import { getRouteGenerator } from "./generator.js";
function serializeRouteData(routeData, trailingSlash) {
  return {
    ...routeData,
    generate: void 0,
    pattern: routeData.pattern.source,
    _meta: { trailingSlash }
  };
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}
export {
  deserializeRouteData,
  serializeRouteData
};

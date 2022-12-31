import { resolveIdToUrl } from "../../util.js";
function createResolve(loader) {
  return async function(s) {
    const url = await resolveIdToUrl(loader, s);
    if (url.startsWith("/@fs") && url.endsWith(".jsx")) {
      return url.slice(0, -4);
    } else {
      return url;
    }
  };
}
export {
  createResolve
};

import { warn } from "./logger/core.js";
const clientAddressSymbol = Symbol.for("astro.clientAddress");
function createRequest({
  url,
  headers,
  clientAddress,
  method = "GET",
  body = void 0,
  logging,
  ssr
}) {
  let headersObj = headers instanceof Headers ? headers : new Headers(Object.entries(headers));
  const request = new Request(url.toString(), {
    method,
    headers: headersObj,
    body
  });
  Object.defineProperties(request, {
    params: {
      get() {
        warn(logging, "deprecation", `Astro.request.params has been moved to Astro.params`);
        return void 0;
      }
    }
  });
  if (!ssr) {
    const _headers = request.headers;
    const headersDesc = Object.getOwnPropertyDescriptor(request, "headers") || {};
    Object.defineProperty(request, "headers", {
      ...headersDesc,
      get() {
        warn(
          logging,
          "ssg",
          `Headers are not exposed in static (SSG) output mode. To enable headers: set \`output: "server"\` in your config file.`
        );
        return _headers;
      }
    });
  } else if (clientAddress) {
    Reflect.set(request, clientAddressSymbol, clientAddress);
  }
  return request;
}
export {
  createRequest
};

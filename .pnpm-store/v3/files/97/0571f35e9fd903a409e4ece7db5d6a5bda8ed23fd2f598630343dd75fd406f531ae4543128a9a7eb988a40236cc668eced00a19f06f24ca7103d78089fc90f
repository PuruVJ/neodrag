import { createRenderContext } from "../../render/index.js";
import { call as callEndpoint } from "../index.js";
async function call(options) {
  const {
    env,
    preload: [, mod]
  } = options;
  const endpointHandler = mod;
  const ctx = createRenderContext({
    request: options.request,
    origin: options.origin,
    pathname: options.pathname,
    route: options.route
  });
  return await callEndpoint(endpointHandler, env, ctx);
}
export {
  call
};

import {
  clearRouteError,
  createServerState,
  setRouteError,
  setServerError
} from "./server-state.js";
function createController(params) {
  if ("loader" in params) {
    return createLoaderController(params.loader);
  } else {
    return createBaseController(params);
  }
}
function createBaseController({ reload }) {
  const serverState = createServerState();
  const onFileChange = () => {
    if (serverState.state === "error") {
      reload();
    }
  };
  const onHMRError = (payload) => {
    var _a, _b;
    let msg = ((_a = payload == null ? void 0 : payload.err) == null ? void 0 : _a.message) ?? "Unknown error";
    let stack = ((_b = payload == null ? void 0 : payload.err) == null ? void 0 : _b.stack) ?? "Unknown stack";
    let error = new Error(msg);
    Object.defineProperty(error, "stack", {
      value: stack
    });
    setServerError(serverState, error);
  };
  return {
    state: serverState,
    onFileChange,
    onHMRError
  };
}
function createLoaderController(loader) {
  const controller = createBaseController({
    reload() {
      loader.clientReload();
    }
  });
  const baseOnFileChange = controller.onFileChange;
  controller.onFileChange = (...args) => {
    if (controller.state.state === "error") {
      loader.eachModule((mod) => {
        if (mod.ssrError) {
          loader.invalidateModule(mod);
        }
      });
    }
    baseOnFileChange(...args);
  };
  loader.events.on("file-change", controller.onFileChange);
  loader.events.on("hmr-error", controller.onHMRError);
  return controller;
}
async function runWithErrorHandling({
  controller: { state },
  pathname,
  run,
  onError
}) {
  try {
    await run();
    clearRouteError(state, pathname);
  } catch (err) {
    const error = onError(err);
    setRouteError(state, pathname, error);
  }
}
export {
  createBaseController,
  createController,
  createLoaderController,
  runWithErrorHandling
};

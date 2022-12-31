import { EventEmitter } from "events";
function createViteLoader(viteServer) {
  const events = new EventEmitter();
  viteServer.watcher.on("add", (...args) => events.emit("file-add", args));
  viteServer.watcher.on("unlink", (...args) => events.emit("file-unlink", args));
  viteServer.watcher.on("change", (...args) => events.emit("file-change", args));
  wrapMethod(viteServer.ws, "send", (msg) => {
    if ((msg == null ? void 0 : msg.type) === "error") {
      events.emit("hmr-error", msg);
    }
  });
  return {
    import(src) {
      return viteServer.ssrLoadModule(src);
    },
    async resolveId(spec, parent) {
      const ret = await viteServer.pluginContainer.resolveId(spec, parent);
      return ret == null ? void 0 : ret.id;
    },
    getModuleById(id) {
      return viteServer.moduleGraph.getModuleById(id);
    },
    getModulesByFile(file) {
      return viteServer.moduleGraph.getModulesByFile(file);
    },
    getModuleInfo(id) {
      return viteServer.pluginContainer.getModuleInfo(id);
    },
    eachModule(cb) {
      return viteServer.moduleGraph.idToModuleMap.forEach(cb);
    },
    invalidateModule(mod) {
      viteServer.moduleGraph.invalidateModule(mod);
    },
    fixStacktrace(err) {
      return viteServer.ssrFixStacktrace(err);
    },
    clientReload() {
      viteServer.ws.send({
        type: "full-reload",
        path: "*"
      });
    },
    webSocketSend(msg) {
      return viteServer.ws.send(msg);
    },
    isHttps() {
      return !!viteServer.config.server.https;
    },
    events
  };
}
function wrapMethod(object, method, newFn) {
  const orig = object[method];
  object[method] = function(...args) {
    newFn.apply(this, args);
    return orig.apply(this, args);
  };
}
export {
  createViteLoader
};

function shim(callback, options) {
  const timeout = (options == null ? void 0 : options.timeout) ?? 50;
  const start = Date.now();
  return setTimeout(function() {
    callback({
      didTimeout: false,
      timeRemaining: function() {
        return Math.max(0, timeout - (Date.now() - start));
      }
    });
  }, 1);
}
const requestIdleCallback = window.requestIdleCallback || shim;
var requestIdleCallback_default = requestIdleCallback;
export {
  requestIdleCallback_default as default
};

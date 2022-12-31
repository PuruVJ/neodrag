import { c as commonjsGlobal } from './vendor-_commonjsHelpers.addc3445.js';

function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

var eventTargetPolyfill = {};

const root =
  (typeof globalThis !== "undefined" && globalThis) ||
  (typeof self !== "undefined" && self) ||
  (typeof commonjsGlobal !== "undefined" && commonjsGlobal);

function isConstructor(fn) {
  try {
    new fn();
  } catch (error) {
    return false;
  }
  return true;
}

if (typeof root.Event !== "function" || !isConstructor(root.Event)) {
  root.Event = (function () {
    function Event(type, options) {
        this.bubbles = !!options && !!options.bubbles;
        this.cancelable = !!options && !!options.cancelable;
        this.composed = !!options && !!options.composed;
      this.type = type;
    }

    return Event;
  })();
}

if (typeof root.EventTarget === "undefined" || !isConstructor(root.Event)) {
  root.EventTarget = (function () {
    function EventTarget() {
      this.__listeners = new Map();
    }

    EventTarget.prototype = Object.create(Object.prototype);

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      if (arguments.length < 2) {
        throw new TypeError(
          `TypeError: Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      const __listeners = this.__listeners;
      const actualType = type.toString();
      if (!__listeners.has(actualType)) {
        __listeners.set(actualType, new Map());
      }
      const listenersForType = __listeners.get(actualType);
      if (!listenersForType.has(listener)) {
        // Any given listener is only registered once
        listenersForType.set(listener, options);
      }
    };

    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      _options
    ) {
      if (arguments.length < 2) {
        throw new TypeError(
          `TypeError: Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      const __listeners = this.__listeners;
      const actualType = type.toString();
      if (__listeners.has(actualType)) {
        const listenersForType = __listeners.get(actualType);
        if (listenersForType.has(listener)) {
          listenersForType.delete(listener);
        }
      }
    };

    EventTarget.prototype.dispatchEvent = function (event) {
      if (!(event instanceof Event)) {
        throw new TypeError(
          `Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'.`
        );
      }
      const type = event.type;
      const __listeners = this.__listeners;
      const listenersForType = __listeners.get(type);
      if (listenersForType) {
        for (const [listener, options] of listenersForType.entries()) {
          try {
            if (typeof listener === "function") {
              // Listener functions must be executed with the EventTarget as the `this` context.
              listener.call(this, event);
            } else if (listener && typeof listener.handleEvent === "function") {
              // Listener objects have their handleEvent method called, if they have one
              listener.handleEvent(event);
            }
          } catch (err) {
            // We need to report the error to the global error handling event,
            // but we do not want to break the loop that is executing the events.
            // Unfortunately, this is the best we can do, which isn't great, because the
            // native EventTarget will actually do this synchronously before moving to the next
            // event in the loop.
            setTimeout(() => {
              throw err;
            });
          }
          if (options && options.once) {
            // If this was registered with { once: true }, we need
            // to remove it now.
            listenersForType.delete(listener);
          }
        }
      }
      // Since there are no cancellable events on a base EventTarget,
      // this should always return true.
      return true;
    };

    return EventTarget;
  })();
}

var index = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  'default': eventTargetPolyfill
}, [eventTargetPolyfill]);

export { index as i };

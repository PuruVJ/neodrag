(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Inview = {}));
}(this, (function (exports) { 'use strict';

  const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0,
      unobserveOnEnter: false,
  };
  const createEvent = (name, detail) => new CustomEvent(name, { detail });
  function inview(node, options = {}) {
      const { root, rootMargin, threshold, unobserveOnEnter } = Object.assign(Object.assign({}, defaultOptions), options);
      let prevPos = {
          x: undefined,
          y: undefined,
      };
      let scrollDirection = {
          vertical: undefined,
          horizontal: undefined,
      };
      if (typeof IntersectionObserver !== 'undefined' && node) {
          const observer = new IntersectionObserver((entries, _observer) => {
              entries.forEach((singleEntry) => {
                  if (prevPos.y > singleEntry.boundingClientRect.y) {
                      scrollDirection.vertical = 'up';
                  }
                  else {
                      scrollDirection.vertical = 'down';
                  }
                  if (prevPos.x > singleEntry.boundingClientRect.x) {
                      scrollDirection.horizontal = 'left';
                  }
                  else {
                      scrollDirection.horizontal = 'right';
                  }
                  prevPos = {
                      y: singleEntry.boundingClientRect.y,
                      x: singleEntry.boundingClientRect.x,
                  };
                  const detail = {
                      inView: singleEntry.isIntersecting,
                      entry: singleEntry,
                      scrollDirection,
                      node,
                      observer: _observer,
                  };
                  node.dispatchEvent(createEvent('change', detail));
                  if (singleEntry.isIntersecting) {
                      node.dispatchEvent(createEvent('enter', detail));
                      unobserveOnEnter && _observer.unobserve(node);
                  }
                  else {
                      node.dispatchEvent(createEvent('leave', detail));
                  }
              });
          }, {
              root,
              rootMargin,
              threshold,
          });
          // This dispatcher has to be wrapped in setTimeout, as it won't work otherwise.
          // Not sure why is it happening, maybe a callstack has to pass between the listeners?
          // Definitely something to investigate to understand better.
          setTimeout(() => {
              node.dispatchEvent(createEvent('init', { observer, node }));
          }, 0);
          observer.observe(node);
          return {
              destroy() {
                  observer.unobserve(node);
              },
          };
      }
  }

  exports.inview = inview;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

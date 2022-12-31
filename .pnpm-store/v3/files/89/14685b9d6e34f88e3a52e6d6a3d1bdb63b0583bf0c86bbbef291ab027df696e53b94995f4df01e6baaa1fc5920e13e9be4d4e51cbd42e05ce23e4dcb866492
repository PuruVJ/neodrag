"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  render: true,
  cleanup: true,
  fireEvent: true,
  act: true
};
exports.render = exports.fireEvent = exports.cleanup = exports.act = void 0;

var _dom = require("@testing-library/dom");

Object.keys(_dom).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _dom[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dom[key];
    }
  });
});

var _svelte = require("svelte");

const _excluded = ["target"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const containerCache = new Set();
const componentCache = new Set();
const svelteComponentOptions = ['accessors', 'anchor', 'props', 'hydrate', 'intro', 'context'];

const render = (Component, _ref = {}, {
  container,
  queries
} = {}) => {
  let {
    target
  } = _ref,
      options = _objectWithoutProperties(_ref, _excluded);

  container = container || document.body;
  target = target || container.appendChild(document.createElement('div'));
  const ComponentConstructor = Component.default || Component;

  const checkProps = options => {
    const isProps = !Object.keys(options).some(option => svelteComponentOptions.includes(option)); // Check if any props and Svelte options were accidentally mixed.

    if (!isProps) {
      const unrecognizedOptions = Object.keys(options).filter(option => !svelteComponentOptions.includes(option));

      if (unrecognizedOptions.length > 0) {
        throw Error(`
          Unknown options were found [${unrecognizedOptions}]. This might happen if you've mixed
          passing in props with Svelte options into the render function. Valid Svelte options
          are [${svelteComponentOptions}]. You can either change the prop names, or pass in your
          props for that component via the \`props\` option.\n\n
          Eg: const { /** Results **/ } = render(MyComponent, { props: { /** props here **/ } })\n\n
        `);
      }

      return options;
    }

    return {
      props: options
    };
  };

  let component = new ComponentConstructor(_objectSpread({
    target
  }, checkProps(options)));
  containerCache.add({
    container,
    target,
    component
  });
  componentCache.add(component);
  component.$$.on_destroy.push(() => {
    componentCache.delete(component);
  });
  return _objectSpread({
    container,
    component,
    debug: (el = container) => console.log((0, _dom.prettyDOM)(el)),
    rerender: options => {
      if (componentCache.has(component)) component.$destroy(); // eslint-disable-next-line no-new

      component = new ComponentConstructor(_objectSpread({
        target
      }, checkProps(options)));
      containerCache.add({
        container,
        target,
        component
      });
      componentCache.add(component);
      component.$$.on_destroy.push(() => {
        componentCache.delete(component);
      });
    },
    unmount: () => {
      if (componentCache.has(component)) component.$destroy();
    }
  }, (0, _dom.getQueriesForElement)(container, queries));
};

exports.render = render;

const cleanupAtContainer = cached => {
  const {
    target,
    component
  } = cached;
  if (componentCache.has(component)) component.$destroy();

  if (target.parentNode === document.body) {
    document.body.removeChild(target);
  }

  containerCache.delete(cached);
};

const cleanup = () => {
  Array.from(containerCache.keys()).forEach(cleanupAtContainer);
};

exports.cleanup = cleanup;

const act = fn => {
  const value = fn && fn();

  if (value !== undefined && typeof value.then === 'function') {
    return value.then(() => (0, _svelte.tick)());
  }

  return (0, _svelte.tick)();
};

exports.act = act;

const fireEvent = async (...args) => {
  const event = (0, _dom.fireEvent)(...args);
  await (0, _svelte.tick)();
  return event;
};

exports.fireEvent = fireEvent;
Object.keys(_dom.fireEvent).forEach(key => {
  fireEvent[key] = async (...args) => {
    const event = _dom.fireEvent[key](...args);

    await (0, _svelte.tick)();
    return event;
  };
});
/* eslint-disable import/export */
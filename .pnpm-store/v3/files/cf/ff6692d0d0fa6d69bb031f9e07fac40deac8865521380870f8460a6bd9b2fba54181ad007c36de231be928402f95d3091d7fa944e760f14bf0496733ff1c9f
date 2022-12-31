'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const svg_build = require('../svg/build.cjs');
const iconSet_getIcon = require('../icon-set/get-icon.cjs');
const loader_utils = require('./utils.cjs');
const createDebugger = require('debug');
const customisations_defaults = require('../customisations/defaults.cjs');
require('../icon/defaults.cjs');
require('../svg/size.cjs');
require('../icon/merge.cjs');
require('../icon/transformations.cjs');
require('../icon-set/tree.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

const createDebugger__default = /*#__PURE__*/_interopDefaultLegacy(createDebugger);

const debug = createDebugger__default("@iconify-loader:icon");
async function searchForIcon(iconSet, collection, ids, options) {
  let iconData;
  const { customize } = options?.customizations ?? {};
  for (const id of ids) {
    iconData = iconSet_getIcon.getIconData(iconSet, id);
    if (iconData) {
      debug(`${collection}:${id}`);
      let defaultCustomizations = { ...customisations_defaults.defaultIconCustomisations };
      if (typeof customize === "function")
        defaultCustomizations = customize(defaultCustomizations);
      const {
        attributes: { width, height, ...restAttributes },
        body
      } = svg_build.iconToSVG(iconData, defaultCustomizations);
      const scale = options?.scale;
      return await loader_utils.mergeIconProps(
        `<svg >${body}</svg>`,
        collection,
        id,
        options,
        () => {
          return { ...restAttributes };
        },
        (props) => {
          if (typeof props.width === "undefined" || props.width === null) {
            if (typeof scale === "number") {
              props.width = `${scale}em`;
            } else {
              props.width = width;
            }
          }
          if (typeof props.height === "undefined" || props.height === null) {
            if (typeof scale === "number") {
              props.height = `${scale}em`;
            } else {
              props.height = height;
            }
          }
        }
      );
    }
  }
}

exports.searchForIcon = searchForIcon;

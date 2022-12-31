'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const icon_defaults = require('../icon/defaults.cjs');
const css_common = require('./common.cjs');
const css_format = require('./format.cjs');
require('../svg/html.cjs');
require('../svg/size.cjs');
require('../svg/url.cjs');

function getIconCSS(icon, options) {
  const mode = options.mode || (icon.body.indexOf("currentColor") === -1 ? "background" : "mask");
  let varName = options.varName;
  if (varName === void 0 && mode === "mask") {
    varName = "svg";
  }
  const newOptions = {
    ...options,
    mode,
    varName
  };
  if (mode === "background") {
    delete newOptions.varName;
  }
  const rules = {
    ...css_common.getCommonCSSRules(newOptions),
    ...css_common.generateItemCSSRules({ ...icon_defaults.defaultIconProps, ...icon }, newOptions)
  };
  const selector = options.iconSelector || ".icon";
  return css_format.formatCSS(
    [
      {
        selector,
        rules
      }
    ],
    newOptions.format
  );
}

exports.getIconCSS = getIconCSS;

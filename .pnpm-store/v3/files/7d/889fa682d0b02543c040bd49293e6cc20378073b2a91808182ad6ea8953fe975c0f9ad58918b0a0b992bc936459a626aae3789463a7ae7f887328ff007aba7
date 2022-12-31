'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const iconSet_getIcon = require('../icon-set/get-icon.cjs');
const icon_defaults = require('../icon/defaults.cjs');
const css_common = require('./common.cjs');
const css_format = require('./format.cjs');
require('../icon/merge.cjs');
require('../icon/transformations.cjs');
require('../icon-set/tree.cjs');
require('../svg/html.cjs');
require('../svg/size.cjs');
require('../svg/url.cjs');

const commonSelector = ".icon--{prefix}";
const iconSelector = ".icon--{prefix}--{name}";
const defaultSelectors = {
  commonSelector,
  iconSelector,
  overrideSelector: commonSelector + iconSelector
};
function getIconsCSS(iconSet, names, options) {
  const css = [];
  const errors = [];
  const palette = iconSet.info?.palette;
  let mode = options.mode || typeof palette === "boolean" && (palette ? "background" : "mask");
  if (!mode) {
    mode = "mask";
    errors.push(
      "/* cannot detect icon mode: not set in options and icon set is missing info, rendering as " + mode + " */"
    );
  }
  let varName = options.varName;
  if (varName === void 0 && mode === "mask") {
    varName = "svg";
  }
  const newOptions = {
    ...options,
    mode,
    varName
  };
  const { commonSelector: commonSelector2, iconSelector: iconSelector2, overrideSelector } = newOptions.iconSelector ? newOptions : defaultSelectors;
  const iconSelectorWithPrefix = iconSelector2.replace(
    /{prefix}/g,
    iconSet.prefix
  );
  const commonRules = css_common.getCommonCSSRules(newOptions);
  const hasCommonRules = commonSelector2 && commonSelector2 !== iconSelector2;
  const commonSelectors = /* @__PURE__ */ new Set();
  if (hasCommonRules) {
    css.push({
      selector: commonSelector2.replace(/{prefix}/g, iconSet.prefix),
      rules: commonRules
    });
  }
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const iconData = iconSet_getIcon.getIconData(iconSet, name);
    if (!iconData) {
      errors.push("/* Could not find icon: " + name + " */");
      continue;
    }
    const rules = css_common.generateItemCSSRules(
      { ...icon_defaults.defaultIconProps, ...iconData },
      newOptions
    );
    let requiresOverride = false;
    if (hasCommonRules && overrideSelector) {
      for (const key in rules) {
        if (key in commonRules) {
          requiresOverride = true;
        }
      }
    }
    const selector = (requiresOverride && overrideSelector ? overrideSelector.replace(/{prefix}/g, iconSet.prefix) : iconSelectorWithPrefix).replace(/{name}/g, name);
    css.push({
      selector,
      rules
    });
    if (!hasCommonRules) {
      commonSelectors.add(selector);
    }
  }
  if (!hasCommonRules && commonSelectors.size) {
    const selector = Array.from(commonSelectors).join(
      newOptions.format === "compressed" ? "," : ", "
    );
    css.unshift({
      selector,
      rules: commonRules
    });
  }
  return css_format.formatCSS(css, newOptions.format) + (errors.length ? "\n" + errors.join("\n") + "\n" : "");
}

exports.getIconsCSS = getIconsCSS;

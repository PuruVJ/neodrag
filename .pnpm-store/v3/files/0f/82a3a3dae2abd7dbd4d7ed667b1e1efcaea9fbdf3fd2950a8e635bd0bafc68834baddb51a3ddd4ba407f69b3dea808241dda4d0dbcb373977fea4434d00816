import { getIconData } from '../icon-set/get-icon.mjs';
import { defaultIconProps } from '../icon/defaults.mjs';
import { getCommonCSSRules, generateItemCSSRules } from './common.mjs';
import { formatCSS } from './format.mjs';
import '../icon/merge.mjs';
import '../icon/transformations.mjs';
import '../icon-set/tree.mjs';
import '../svg/html.mjs';
import '../svg/size.mjs';
import '../svg/url.mjs';

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
  const commonRules = getCommonCSSRules(newOptions);
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
    const iconData = getIconData(iconSet, name);
    if (!iconData) {
      errors.push("/* Could not find icon: " + name + " */");
      continue;
    }
    const rules = generateItemCSSRules(
      { ...defaultIconProps, ...iconData },
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
  return formatCSS(css, newOptions.format) + (errors.length ? "\n" + errors.join("\n") + "\n" : "");
}

export { getIconsCSS };

import { defaultIconProps } from '../icon/defaults.mjs';
import { getCommonCSSRules, generateItemCSSRules } from './common.mjs';
import { formatCSS } from './format.mjs';
import '../svg/html.mjs';
import '../svg/size.mjs';
import '../svg/url.mjs';

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
    ...getCommonCSSRules(newOptions),
    ...generateItemCSSRules({ ...defaultIconProps, ...icon }, newOptions)
  };
  const selector = options.iconSelector || ".icon";
  return formatCSS(
    [
      {
        selector,
        rules
      }
    ],
    newOptions.format
  );
}

export { getIconCSS };

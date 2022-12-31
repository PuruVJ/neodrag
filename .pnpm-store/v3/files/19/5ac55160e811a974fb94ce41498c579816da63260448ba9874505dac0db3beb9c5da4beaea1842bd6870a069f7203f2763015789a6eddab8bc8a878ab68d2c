import { iconToHTML } from '../svg/html.mjs';
import { calculateSize } from '../svg/size.mjs';
import { svgToURL } from '../svg/url.mjs';

function getCommonCSSRules(options) {
  const result = {
    display: "inline-block",
    width: "1em",
    height: "1em"
  };
  const varName = options.varName;
  if (options.pseudoSelector) {
    result["content"] = "''";
  }
  switch (options.mode) {
    case "background":
      result["background"] = "no-repeat center / 100%";
      if (varName) {
        result["background-image"] = "var(--" + varName + ")";
      }
      break;
    case "mask":
      result["background-color"] = "currentColor";
      result["mask"] = result["-webkit-mask"] = "no-repeat center / 100%";
      if (varName) {
        result["mask-image"] = result["-webkit-mask-image"] = "var(--" + varName + ")";
      }
      break;
  }
  return result;
}
function generateItemCSSRules(icon, options) {
  const result = {};
  const varName = options.varName;
  if (!options.forceSquare && icon.width !== icon.height) {
    result["width"] = calculateSize("1em", icon.width / icon.height);
  }
  const svg = iconToHTML(icon.body.replace(/currentColor/g, "#000"), {
    viewBox: `${icon.left} ${icon.top} ${icon.width} ${icon.height}`,
    width: icon.width.toString(),
    height: icon.height.toString()
  });
  const url = svgToURL(svg);
  if (varName) {
    result["--" + varName] = url;
  } else {
    switch (options.mode) {
      case "background":
        result["background-image"] = url;
        break;
      case "mask":
        result["mask-image"] = result["-webkit-mask-image"] = url;
        break;
    }
  }
  return result;
}

export { generateItemCSSRules, getCommonCSSRules };

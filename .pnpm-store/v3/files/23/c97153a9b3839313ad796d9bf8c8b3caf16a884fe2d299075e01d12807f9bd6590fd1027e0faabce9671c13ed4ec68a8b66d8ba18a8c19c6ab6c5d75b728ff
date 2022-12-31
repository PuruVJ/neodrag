'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const svgWidthRegex = /width\s*=\s*["'](\w+)["']/;
const svgHeightRegex = /height\s*=\s*["'](\w+)["']/;
function configureSvgSize(svg, props, scale) {
  const svgNode = svg.slice(0, svg.indexOf(">"));
  let result = svgWidthRegex.exec(svgNode);
  const w = result != null;
  if (typeof props.width === "undefined" || props.width === null) {
    if (typeof scale === "number") {
      props.width = `${scale}em`;
    } else if (result) {
      props.width = result[1];
    }
  }
  result = svgHeightRegex.exec(svgNode);
  const h = result != null;
  if (typeof props.height === "undefined" || props.height === null) {
    if (typeof scale === "number") {
      props.height = `${scale}em`;
    } else if (result) {
      props.height = result[1];
    }
  }
  return [w, h];
}
async function mergeIconProps(svg, collection, icon, options, propsProvider, afterCustomizations) {
  const { scale, addXmlNs = false } = options ?? {};
  const { additionalProps = {}, iconCustomizer } = options?.customizations ?? {};
  const props = await propsProvider?.() ?? {};
  await iconCustomizer?.(collection, icon, props);
  Object.keys(additionalProps).forEach((p) => {
    const v = additionalProps[p];
    if (v !== void 0 && v !== null)
      props[p] = v;
  });
  afterCustomizations?.(props);
  const [widthOnSvg, heightOnSvg] = configureSvgSize(svg, props, scale);
  if (addXmlNs) {
    if (!svg.includes(" xmlns=") && !props["xmlns"]) {
      props["xmlns"] = "http://www.w3.org/2000/svg";
    }
    if (!svg.includes(" xmlns:xlink=") && svg.includes("xlink:") && !props["xmlns:xlink"]) {
      props["xmlns:xlink"] = "http://www.w3.org/1999/xlink";
    }
  }
  const propsToAdd = Object.keys(props).map(
    (p) => p === "width" && widthOnSvg || p === "height" && heightOnSvg ? null : `${p}="${props[p]}"`
  ).filter((p) => p != null);
  if (propsToAdd.length) {
    svg = svg.replace("<svg ", `<svg ${propsToAdd.join(" ")} `);
  }
  if (options) {
    const { defaultStyle, defaultClass } = options;
    if (defaultClass && !svg.includes(" class=")) {
      svg = svg.replace("<svg ", `<svg class="${defaultClass}" `);
    }
    if (defaultStyle && !svg.includes(" style=")) {
      svg = svg.replace("<svg ", `<svg style="${defaultStyle}" `);
    }
  }
  const usedProps = options?.usedProps;
  if (usedProps) {
    Object.keys(additionalProps).forEach((p) => {
      const v = props[p];
      if (v !== void 0 && v !== null)
        usedProps[p] = v;
    });
    if (typeof props.width !== "undefined" && props.width !== null) {
      usedProps.width = props.width;
    }
    if (typeof props.height !== "undefined" && props.height !== null) {
      usedProps.height = props.height;
    }
  }
  return svg;
}

exports.mergeIconProps = mergeIconProps;

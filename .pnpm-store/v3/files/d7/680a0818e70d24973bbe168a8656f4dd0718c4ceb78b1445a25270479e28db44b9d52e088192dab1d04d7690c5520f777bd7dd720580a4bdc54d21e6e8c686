'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function encodeSVGforURL(svg) {
  return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function svgToURL(svg) {
  return 'url("data:image/svg+xml,' + encodeSVGforURL(svg) + '")';
}

exports.encodeSVGforURL = encodeSVGforURL;
exports.svgToURL = svgToURL;

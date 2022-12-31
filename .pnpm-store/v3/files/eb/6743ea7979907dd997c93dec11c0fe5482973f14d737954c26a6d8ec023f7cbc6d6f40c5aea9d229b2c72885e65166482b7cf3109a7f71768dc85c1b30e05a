"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/resolver.ts
var _utils = require('@antfu/utils');
var _strings = require('@iconify/utils/lib/misc/strings');

// src/core/icon-sets.json
var icon_sets_default = [
  "academicons",
  "akar-icons",
  "ant-design",
  "arcticons",
  "bi",
  "bpmn",
  "brandico",
  "bx",
  "bxl",
  "bxs",
  "bytesize",
  "carbon",
  "charm",
  "ci",
  "cib",
  "cif",
  "cil",
  "circle-flags",
  "circum",
  "clarity",
  "codicon",
  "cryptocurrency",
  "cryptocurrency-color",
  "dashicons",
  "ei",
  "el",
  "emojione",
  "emojione-monotone",
  "emojione-v1",
  "entypo",
  "entypo-social",
  "eos-icons",
  "ep",
  "et",
  "eva",
  "fa",
  "fa-brands",
  "fa-regular",
  "fa-solid",
  "fa6-brands",
  "fa6-regular",
  "fa6-solid",
  "fad",
  "fe",
  "feather",
  "file-icons",
  "flag",
  "flagpack",
  "flat-color-icons",
  "flat-ui",
  "fluent",
  "fluent-emoji",
  "fluent-emoji-flat",
  "fluent-emoji-high-contrast",
  "fluent-mdl2",
  "fontelico",
  "fontisto",
  "foundation",
  "fxemoji",
  "gala",
  "game-icons",
  "geo",
  "gg",
  "gis",
  "gridicons",
  "grommet-icons",
  "healthicons",
  "heroicons",
  "heroicons-outline",
  "heroicons-solid",
  "humbleicons",
  "ic",
  "icomoon-free",
  "icon-park",
  "icon-park-outline",
  "icon-park-solid",
  "icon-park-twotone",
  "iconoir",
  "icons8",
  "il",
  "ion",
  "iwwa",
  "jam",
  "la",
  "line-md",
  "logos",
  "ls",
  "lucide",
  "majesticons",
  "maki",
  "map",
  "material-symbols",
  "mdi",
  "mdi-light",
  "medical-icon",
  "mi",
  "mingcute",
  "mono-icons",
  "nimbus",
  "noto",
  "noto-v1",
  "octicon",
  "oi",
  "ooui",
  "openmoji",
  "pajamas",
  "pepicons",
  "ph",
  "pixelarticons",
  "prime",
  "ps",
  "quill",
  "radix-icons",
  "raphael",
  "ri",
  "si-glyph",
  "simple-icons",
  "simple-line-icons",
  "subway",
  "system-uicons",
  "tabler",
  "teenyicons",
  "topcoat",
  "twemoji",
  "typcn",
  "uil",
  "uim",
  "uis",
  "uit",
  "uiw",
  "vaadin",
  "vs",
  "vscode-icons",
  "websymbol",
  "whh",
  "wi",
  "wpf",
  "zmdi",
  "zondicons"
];

// src/resolver.ts
function ComponentsResolver(options = {}) {
  var _a;
  const {
    prefix: rawPrefix = (_a = options.componentPrefix) != null ? _a : "i",
    enabledCollections = icon_sets_default,
    alias = {},
    customCollections = [],
    extension
  } = options;
  const prefix = rawPrefix ? `${_strings.camelToKebab.call(void 0, rawPrefix)}-` : "";
  const ext = extension ? extension.startsWith(".") ? extension : `.${extension}` : "";
  const collections = _utils.uniq.call(void 0, [
    ..._utils.toArray.call(void 0, enabledCollections),
    ..._utils.toArray.call(void 0, customCollections),
    ..._utils.toArray.call(void 0, Object.keys(alias))
  ]);
  collections.sort((a, b) => b.length - a.length);
  return (name) => {
    const kebab = _strings.camelToKebab.call(void 0, name);
    if (!kebab.startsWith(prefix))
      return;
    const slice = kebab.slice(prefix.length);
    const collection = collections.find((i) => slice.startsWith(`${i}-`)) || collections.find((i) => slice.startsWith(i));
    if (!collection)
      return;
    let icon = slice.slice(collection.length);
    if (icon[0] === "-")
      icon = icon.slice(1);
    if (!icon)
      return;
    const resolvedCollection = alias[collection] || collection;
    if (collections.includes(resolvedCollection))
      return `~icons/${resolvedCollection}/${icon}${ext}`;
  };
}


module.exports = ComponentsResolver;
exports.default = module.exports;
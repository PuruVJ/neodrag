const splitAttrsTokenizer = /([\$\{\}\@a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim;
function replaceAttribute(s, node, key, newValue) {
  var _a, _b;
  splitAttrsTokenizer.lastIndex = 0;
  const text = s.original.slice(((_a = node.position) == null ? void 0 : _a.start.offset) ?? 0, ((_b = node.position) == null ? void 0 : _b.end.offset) ?? 0).toString();
  const offset = text.indexOf(key);
  if (offset === -1)
    return;
  const start = node.position.start.offset + offset;
  const tokens = text.slice(offset).split(splitAttrsTokenizer);
  const token = tokens[0].replace(/([^>])(\>[\s\S]*$)/gim, "$1");
  if (token.trim() === key) {
    const end = start + key.length;
    s.overwrite(start, end, newValue);
  } else {
    const end = start + `${key}=${tokens[2]}${tokens[3]}${tokens[2]}`.length;
    s.overwrite(start, end, newValue);
  }
}
function needsEscape(value) {
  return typeof value === "string" && (value.includes("`") || value.includes("${"));
}
function escape(value) {
  return value.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
export {
  escape,
  needsEscape,
  replaceAttribute
};

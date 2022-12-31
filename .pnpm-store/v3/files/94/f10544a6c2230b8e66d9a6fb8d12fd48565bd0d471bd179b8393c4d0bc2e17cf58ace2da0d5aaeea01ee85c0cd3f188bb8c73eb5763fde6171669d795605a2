import { visit } from "unist-util-visit";
import { escape } from "./utils.js";
const rehypeSlots = ({ s }) => {
  return (tree, file) => {
    visit(tree, (node, index, parent) => {
      var _a, _b, _c, _d, _e, _f;
      if (node.type === "element" && node.tagName === "slot") {
        if (typeof ((_a = node.properties) == null ? void 0 : _a["is:inline"]) !== "undefined")
          return;
        const name = ((_b = node.properties) == null ? void 0 : _b["name"]) ?? "default";
        const start = ((_c = node.position) == null ? void 0 : _c.start.offset) ?? 0;
        const end = ((_d = node.position) == null ? void 0 : _d.end.offset) ?? 0;
        const first = node.children.at(0) ?? node;
        const last = node.children.at(-1) ?? node;
        const text = file.value.slice(((_e = first.position) == null ? void 0 : _e.start.offset) ?? 0, ((_f = last.position) == null ? void 0 : _f.end.offset) ?? 0).toString();
        s.overwrite(start, end, `\${${SLOT_PREFIX}["${name}"] ?? \`${escape(text).trim()}\`}`);
      }
    });
  };
};
var slots_default = rehypeSlots;
const SLOT_PREFIX = `___SLOTS___`;
export {
  SLOT_PREFIX,
  slots_default as default
};

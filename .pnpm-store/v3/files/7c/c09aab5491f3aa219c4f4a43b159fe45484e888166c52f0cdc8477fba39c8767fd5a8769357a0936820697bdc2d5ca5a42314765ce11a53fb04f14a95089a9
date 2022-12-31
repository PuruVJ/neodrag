import { visit } from "unist-util-visit";
import { escape, needsEscape, replaceAttribute } from "./utils.js";
const rehypeEscape = ({ s }) => {
  return (tree, file) => {
    visit(tree, (node, index, parent) => {
      if (node.type === "text" || node.type === "comment") {
        if (needsEscape(node.value)) {
          s.overwrite(node.position.start.offset, node.position.end.offset, escape(node.value));
        }
      } else if (node.type === "element") {
        for (const [key, value] of Object.entries(node.properties ?? {})) {
          const newKey = needsEscape(key) ? escape(key) : key;
          const newValue = needsEscape(value) ? escape(value) : value;
          if (newKey === key && newValue === value)
            continue;
          replaceAttribute(s, node, key, value === "" ? newKey : `${newKey}="${newValue}"`);
        }
      }
    });
  };
};
var escape_default = rehypeEscape;
export {
  escape_default as default
};

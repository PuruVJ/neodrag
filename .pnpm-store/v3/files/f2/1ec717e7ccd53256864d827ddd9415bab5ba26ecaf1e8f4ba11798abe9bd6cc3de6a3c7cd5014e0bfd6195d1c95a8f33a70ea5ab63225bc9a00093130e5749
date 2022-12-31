Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCssClassNames = void 0;
const parseCssVars_1 = require("./parseCssVars");
function* parseCssClassNames(styleContent) {
    styleContent = (0, parseCssVars_1.clearComments)(styleContent);
    const cssClassNameRegex = /(?=([\.]{1}[a-zA-Z_]+[\w\_\-]*)[\s\.\+\{\>#\:]{1})/g;
    const matchs = styleContent.matchAll(cssClassNameRegex);
    for (const match of matchs) {
        if (match.index !== undefined) {
            const matchText = match[1];
            if (matchText !== undefined) {
                yield { start: match.index, end: match.index + matchText.length };
            }
        }
    }
}
exports.parseCssClassNames = parseCssClassNames;
//# sourceMappingURL=parseCssClassNames.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitTarget = void 0;
function splitTarget(s) {
    const parts = [];
    let currentPart = '';
    for (let i = 0; i < s.length; ++i) {
        if (s[i] === ':') {
            parts.push(currentPart);
            currentPart = '';
        }
        else if (s[i] === '"') {
            i++;
            for (; i < s.length && s[i] != '"'; ++i) {
                currentPart += s[i];
            }
        }
        else {
            currentPart += s[i];
        }
    }
    parts.push(currentPart);
    return parts;
}
exports.splitTarget = splitTarget;
//# sourceMappingURL=split-target.js.map
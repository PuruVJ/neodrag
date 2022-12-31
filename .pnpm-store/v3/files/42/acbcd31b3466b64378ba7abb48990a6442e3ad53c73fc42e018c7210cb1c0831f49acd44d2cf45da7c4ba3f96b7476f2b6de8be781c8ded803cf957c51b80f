"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDataAttrCompletion = void 0;
/**
 * The VS Code HTML language service provides a completion for data attributes that is independent from
 * data providers, which mean that you can't disable it, so this function removes them from completions
 */
function removeDataAttrCompletion(items) {
    return items.filter((item) => !item.label.startsWith('data-'));
}
exports.removeDataAttrCompletion = removeDataAttrCompletion;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toString = exports.getLength = void 0;
function getLength(segments) {
    let length = 0;
    for (const segment of segments) {
        length += typeof segment == 'string' ? segment.length : segment[0].length;
    }
    return length;
}
exports.getLength = getLength;
function toString(segments) {
    return segments.map(s => typeof s === 'string' ? s : s[0]).join('');
}
exports.toString = toString;

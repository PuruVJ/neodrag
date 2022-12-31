"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultHashing = exports.HashingImpl = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
class HashingImpl {
    hashArray(input) {
        const hasher = (0, crypto_1.createHash)('sha256');
        for (const part of input) {
            hasher.update(part);
        }
        return hasher.digest('hex');
    }
    hashFile(path) {
        const hasher = (0, crypto_1.createHash)('sha256');
        const file = (0, fs_1.readFileSync)(path);
        hasher.update(file);
        return hasher.digest('hex');
    }
}
exports.HashingImpl = HashingImpl;
exports.defaultHashing = new HashingImpl();
//# sourceMappingURL=hashing-impl.js.map
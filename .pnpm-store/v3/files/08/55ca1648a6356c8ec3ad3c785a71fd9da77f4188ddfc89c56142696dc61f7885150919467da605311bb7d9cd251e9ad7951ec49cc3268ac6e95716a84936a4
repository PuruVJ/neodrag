"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromisedBasedQueue = void 0;
const tslib_1 = require("tslib");
class PromisedBasedQueue {
    constructor() {
        this.counter = 0;
        this.promise = Promise.resolve(null);
    }
    sendToQueue(fn) {
        this.counter++;
        let res, rej;
        const r = new Promise((_res, _rej) => {
            res = _res;
            rej = _rej;
        });
        this.promise = this.promise
            .then(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                res(yield fn());
                this.counter--;
            }
            catch (e) {
                rej(e);
                this.counter--;
            }
        }))
            .catch(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                res(yield fn());
                this.counter--;
            }
            catch (e) {
                rej(e);
                this.counter--;
            }
        }));
        return r;
    }
    isEmpty() {
        return this.counter === 0;
    }
}
exports.PromisedBasedQueue = PromisedBasedQueue;
//# sourceMappingURL=promised-based-queue.js.map
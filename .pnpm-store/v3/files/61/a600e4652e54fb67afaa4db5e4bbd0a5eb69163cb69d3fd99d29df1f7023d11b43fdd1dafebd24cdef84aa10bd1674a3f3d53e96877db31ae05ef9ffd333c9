"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discriminatedUnion_1 = __importDefault(require("./discriminatedUnion"));
const object_1 = __importDefault(require("./object"));
const primitives_1 = __importDefault(require("./primitives"));
const realworld_1 = __importDefault(require("./realworld"));
const string_1 = __importDefault(require("./string"));
const union_1 = __importDefault(require("./union"));
for (const suite of [
    ...realworld_1.default.suites,
    ...primitives_1.default.suites,
    ...string_1.default.suites,
    ...object_1.default.suites,
    ...union_1.default.suites,
    ...discriminatedUnion_1.default.suites,
]) {
    suite.run();
}

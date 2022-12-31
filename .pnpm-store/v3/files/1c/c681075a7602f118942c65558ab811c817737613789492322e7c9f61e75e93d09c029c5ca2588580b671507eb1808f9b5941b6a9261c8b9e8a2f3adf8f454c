"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const benchmark_1 = __importDefault(require("benchmark"));
const index_1 = require("../index");
const enumSuite = new benchmark_1.default.Suite("z.enum");
const enumSchema = index_1.z.enum(["a", "b", "c"]);
enumSuite
    .add("valid", () => {
    enumSchema.parse("a");
})
    .add("invalid", () => {
    try {
        enumSchema.parse("x");
    }
    catch (e) { }
})
    .on("cycle", (e) => {
    console.log(`z.enum: ${e.target}`);
});
const undefinedSuite = new benchmark_1.default.Suite("z.undefined");
const undefinedSchema = index_1.z.undefined();
undefinedSuite
    .add("valid", () => {
    undefinedSchema.parse(undefined);
})
    .add("invalid", () => {
    try {
        undefinedSchema.parse(1);
    }
    catch (e) { }
})
    .on("cycle", (e) => {
    console.log(`z.undefined: ${e.target}`);
});
const literalSuite = new benchmark_1.default.Suite("z.literal");
const short = "short";
const bad = "bad";
const literalSchema = index_1.z.literal("short");
literalSuite
    .add("valid", () => {
    literalSchema.parse(short);
})
    .add("invalid", () => {
    try {
        literalSchema.parse(bad);
    }
    catch (e) { }
})
    .on("cycle", (e) => {
    console.log(`z.literal: ${e.target}`);
});
const numberSuite = new benchmark_1.default.Suite("z.number");
const numberSchema = index_1.z.number().int();
numberSuite
    .add("valid", () => {
    numberSchema.parse(1);
})
    .add("invalid type", () => {
    try {
        numberSchema.parse("bad");
    }
    catch (e) { }
})
    .add("invalid number", () => {
    try {
        numberSchema.parse(0.5);
    }
    catch (e) { }
})
    .on("cycle", (e) => {
    console.log(`z.number: ${e.target}`);
});
exports.default = {
    suites: [enumSuite, undefinedSuite, literalSuite, numberSuite],
};

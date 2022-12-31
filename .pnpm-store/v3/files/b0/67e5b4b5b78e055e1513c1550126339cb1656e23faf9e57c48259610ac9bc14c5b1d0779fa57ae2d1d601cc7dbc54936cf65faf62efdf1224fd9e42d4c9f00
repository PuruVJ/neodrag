"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("vscode-languageserver/browser");
const server_1 = require("./server");
const messageReader = new browser_1.BrowserMessageReader(self);
const messageWriter = new browser_1.BrowserMessageWriter(self);
const connection = (0, browser_1.createConnection)(messageReader, messageWriter);
(0, server_1.startLanguageServer)(connection, {
    loadTypescript(options) {
        return undefined; // TODO: Full browser support
    },
    loadTypescriptLocalized(options) {
        return undefined;
    },
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroDocument = void 0;
const utils_1 = require("../../utils");
const DocumentBase_1 = require("./DocumentBase");
const parseAstro_1 = require("./parseAstro");
const parseHtml_1 = require("./parseHtml");
const utils_2 = require("./utils");
class AstroDocument extends DocumentBase_1.WritableDocument {
    constructor(url, content) {
        super();
        this.url = url;
        this.content = content;
        this.languageId = 'astro';
        this.updateDocInfo();
    }
    updateDocInfo() {
        this.astroMeta = (0, parseAstro_1.parseAstro)(this.content);
        this.html = (0, parseHtml_1.parseHtml)(this.content, this.astroMeta);
        this.styleTags = (0, utils_2.extractStyleTags)(this.content, this.html);
        this.scriptTags = (0, utils_2.extractScriptTags)(this.content, this.html);
    }
    setText(text) {
        this.content = text;
        this.version++;
        this.updateDocInfo();
    }
    getText(range) {
        if (range) {
            const start = this.offsetAt(range.start);
            const end = this.offsetAt(range.end);
            return this.content.substring(start, end);
        }
        return this.content;
    }
    getURL() {
        return this.url;
    }
    getFilePath() {
        return (0, utils_1.urlToPath)(this.url);
    }
}
exports.AstroDocument = AstroDocument;

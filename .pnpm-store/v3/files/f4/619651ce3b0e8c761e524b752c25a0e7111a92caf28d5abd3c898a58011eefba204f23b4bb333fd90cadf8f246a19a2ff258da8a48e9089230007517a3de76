"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSPlugin = void 0;
const emmet_helper_1 = require("@vscode/emmet-helper");
const vscode_languageserver_1 = require("vscode-languageserver");
const documents_1 = require("../../core/documents");
const parseHtml_1 = require("../../core/documents/parseHtml");
const CSSDocument_1 = require("./CSSDocument");
const getIdClassCompletions_1 = require("./features/getIdClassCompletions");
const language_service_1 = require("./language-service");
const StyleAttributeDocument_1 = require("./StyleAttributeDocument");
class CSSPlugin {
    constructor(configManager) {
        this.__name = 'css';
        this.cssDocuments = new WeakMap();
        this.triggerCharacters = new Set(['.', ':', '-', '/']);
        this.configManager = configManager;
    }
    async doHover(document, position) {
        if (!(await this.featureEnabled(document, 'hover'))) {
            return null;
        }
        if ((0, documents_1.isInsideFrontmatter)(document.getText(), document.offsetAt(position))) {
            return null;
        }
        const styleTag = this.getStyleTagForPosition(document, position);
        // We technically can return results even for open tags, however, a lot of the info returned is not valid
        // Since most editors will automatically close the tag before the user start working in them, this shouldn't be a problem
        if (styleTag && !styleTag.closed) {
            return null;
        }
        // If we don't have a style tag at this position, we might be in a style property instead, let's check
        if (!styleTag) {
            const attributeContext = (0, parseHtml_1.getAttributeContextAtPosition)(document, position);
            if (!attributeContext) {
                return null;
            }
            if (this.inStyleAttributeWithoutInterpolation(attributeContext, document.getText())) {
                const [start, end] = attributeContext.valueRange;
                return this.doHoverInternal(new StyleAttributeDocument_1.StyleAttributeDocument(document, start, end), position);
            }
            return null;
        }
        const cssDocument = this.getCSSDocumentForStyleTag(styleTag, document);
        const cssLang = extractLanguage(cssDocument);
        if (!isSupportedByLangService(cssLang)) {
            return null;
        }
        return this.doHoverInternal(cssDocument, position);
    }
    doHoverInternal(cssDocument, position) {
        const hoverInfo = (0, language_service_1.getLanguageService)(extractLanguage(cssDocument)).doHover(cssDocument, cssDocument.getGeneratedPosition(position), cssDocument.stylesheet);
        return hoverInfo ? (0, documents_1.mapHoverToParent)(cssDocument, hoverInfo) : hoverInfo;
    }
    async getCompletions(document, position, completionContext) {
        if (!(await this.featureEnabled(document, 'completions'))) {
            return null;
        }
        if ((0, documents_1.isInsideFrontmatter)(document.getText(), document.offsetAt(position))) {
            return null;
        }
        const triggerCharacter = completionContext?.triggerCharacter;
        const triggerKind = completionContext?.triggerKind;
        const isCustomTriggerCharacter = triggerKind === vscode_languageserver_1.CompletionTriggerKind.TriggerCharacter;
        if (isCustomTriggerCharacter && triggerCharacter && !this.triggerCharacters.has(triggerCharacter)) {
            return null;
        }
        const styleTag = this.getStyleTagForPosition(document, position);
        if (styleTag && !styleTag.closed) {
            return null;
        }
        if (!styleTag) {
            const attributeContext = (0, parseHtml_1.getAttributeContextAtPosition)(document, position);
            if (!attributeContext) {
                return null;
            }
            if (this.inStyleAttributeWithoutInterpolation(attributeContext, document.getText())) {
                const [start, end] = attributeContext.valueRange;
                return await this.getCompletionsInternal(document, position, new StyleAttributeDocument_1.StyleAttributeDocument(document, start, end));
            }
            // If we're not in a style attribute, instead give completions for ids and classes used in the current document
            else if ((attributeContext.name == 'id' || attributeContext.name == 'class') && attributeContext.inValue) {
                const stylesheets = this.getStylesheetsForDocument(document);
                return (0, getIdClassCompletions_1.getIdClassCompletion)(stylesheets, attributeContext);
            }
            return null;
        }
        const cssDocument = this.getCSSDocumentForStyleTag(styleTag, document);
        return await this.getCompletionsInternal(document, position, cssDocument);
    }
    async getCompletionsInternal(document, position, cssDocument) {
        const emmetConfig = await this.configManager.getEmmetConfig(document);
        if (isSASS(cssDocument)) {
            // The CSS language service does not support SASS (not to be confused with SCSS)
            // however we can at least still at least provide Emmet completions in SASS blocks
            return (0, emmet_helper_1.doComplete)(document, position, 'sass', emmetConfig) || null;
        }
        const cssLang = extractLanguage(cssDocument);
        const langService = (0, language_service_1.getLanguageService)(cssLang);
        let emmetResults = {
            isIncomplete: false,
            items: [],
        };
        const extensionConfig = await this.configManager.getConfig('astro', document.uri);
        if (extensionConfig?.css?.completions?.emmet ?? true) {
            langService.setCompletionParticipants([
                {
                    onCssProperty: (context) => {
                        if (context?.propertyName) {
                            emmetResults =
                                (0, emmet_helper_1.doComplete)(cssDocument, cssDocument.getGeneratedPosition(position), (0, language_service_1.getLanguage)(cssLang), emmetConfig) || emmetResults;
                        }
                    },
                    onCssPropertyValue: (context) => {
                        if (context?.propertyValue) {
                            emmetResults =
                                (0, emmet_helper_1.doComplete)(cssDocument, cssDocument.getGeneratedPosition(position), (0, language_service_1.getLanguage)(cssLang), emmetConfig) || emmetResults;
                        }
                    },
                },
            ]);
        }
        const results = langService.doComplete(cssDocument, cssDocument.getGeneratedPosition(position), cssDocument.stylesheet);
        return vscode_languageserver_1.CompletionList.create([...(results ? results.items : []), ...emmetResults.items].map((completionItem) => (0, documents_1.mapCompletionItemToOriginal)(cssDocument, completionItem)), 
        // Emmet completions change on every keystroke, so they are never complete
        emmetResults.items.length > 0);
    }
    async getDocumentColors(document) {
        if (!(await this.featureEnabled(document, 'documentColors'))) {
            return [];
        }
        const allColorInfo = this.getCSSDocumentsForDocument(document).flatMap((cssDoc) => {
            const cssLang = extractLanguage(cssDoc);
            const langService = (0, language_service_1.getLanguageService)(cssLang);
            if (!isSupportedByLangService(cssLang)) {
                return [];
            }
            return langService
                .findDocumentColors(cssDoc, cssDoc.stylesheet)
                .map((colorInfo) => (0, documents_1.mapObjWithRangeToOriginal)(cssDoc, colorInfo));
        });
        return allColorInfo;
    }
    async getColorPresentations(document, range, color) {
        if (!(await this.featureEnabled(document, 'documentColors'))) {
            return [];
        }
        const allColorPres = this.getCSSDocumentsForDocument(document).flatMap((cssDoc) => {
            const cssLang = extractLanguage(cssDoc);
            const langService = (0, language_service_1.getLanguageService)(cssLang);
            if ((!cssDoc.isInGenerated(range.start) && !cssDoc.isInGenerated(range.end)) ||
                !isSupportedByLangService(cssLang)) {
                return [];
            }
            return langService
                .getColorPresentations(cssDoc, cssDoc.stylesheet, color, (0, documents_1.mapRangeToGenerated)(cssDoc, range))
                .map((colorPres) => (0, documents_1.mapColorPresentationToOriginal)(cssDoc, colorPres));
        });
        return allColorPres;
    }
    getFoldingRanges(document) {
        const allFoldingRanges = this.getCSSDocumentsForDocument(document).flatMap((cssDoc) => {
            const cssLang = extractLanguage(cssDoc);
            const langService = (0, language_service_1.getLanguageService)(cssLang);
            return langService.getFoldingRanges(cssDoc).map((foldingRange) => (0, documents_1.mapFoldingRangeToParent)(cssDoc, foldingRange));
        });
        return allFoldingRanges;
    }
    async getDocumentSymbols(document) {
        if (!(await this.featureEnabled(document, 'documentSymbols'))) {
            return [];
        }
        const allDocumentSymbols = this.getCSSDocumentsForDocument(document).flatMap((cssDoc) => {
            return (0, language_service_1.getLanguageService)(extractLanguage(cssDoc))
                .findDocumentSymbols(cssDoc, cssDoc.stylesheet)
                .map((symbol) => (0, documents_1.mapSymbolInformationToOriginal)(cssDoc, symbol));
        });
        return allDocumentSymbols;
    }
    inStyleAttributeWithoutInterpolation(attrContext, text) {
        return (attrContext.name === 'style' &&
            !!attrContext.valueRange &&
            !text.substring(attrContext.valueRange[0], attrContext.valueRange[1]).includes('{'));
    }
    /**
     * Get the associated CSS Document for a style tag
     */
    getCSSDocumentForStyleTag(tag, document) {
        let cssDoc = this.cssDocuments.get(tag);
        if (!cssDoc || cssDoc.version < document.version) {
            cssDoc = new CSSDocument_1.CSSDocument(document, tag);
            this.cssDocuments.set(tag, cssDoc);
        }
        return cssDoc;
    }
    /**
     * Get all the CSSDocuments in a document
     */
    getCSSDocumentsForDocument(document) {
        return document.styleTags.map((tag) => this.getCSSDocumentForStyleTag(tag, document));
    }
    /**
     * Get all the stylesheets (Stylesheet type) in a document
     */
    getStylesheetsForDocument(document) {
        return this.getCSSDocumentsForDocument(document).map((cssDoc) => cssDoc.stylesheet);
    }
    /**
     * Get style tag at position for a document
     */
    getStyleTagForPosition(document, position) {
        return document.styleTags.find((styleTag) => {
            return (0, documents_1.isInTag)(position, styleTag);
        });
    }
    async featureEnabled(document, feature) {
        return ((await this.configManager.isEnabled(document, 'css')) &&
            (await this.configManager.isEnabled(document, 'css', feature)));
    }
}
exports.CSSPlugin = CSSPlugin;
/**
 * Check is a CSSDocument's language is supported by the CSS language service
 */
function isSupportedByLangService(language) {
    switch (language) {
        case 'css':
        case 'scss':
        case 'less':
            return true;
        default:
            return false;
    }
}
function isSASS(document) {
    switch (extractLanguage(document)) {
        case 'sass':
            return true;
        default:
            return false;
    }
}
function extractLanguage(document) {
    const lang = document.languageId;
    return lang.replace(/^text\//, '');
}

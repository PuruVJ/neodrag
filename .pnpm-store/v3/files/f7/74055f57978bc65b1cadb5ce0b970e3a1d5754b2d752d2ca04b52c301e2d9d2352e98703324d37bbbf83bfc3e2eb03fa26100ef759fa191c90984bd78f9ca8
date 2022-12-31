"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLPlugin = void 0;
const emmet_helper_1 = require("@vscode/emmet-helper");
const vscode_html_languageservice_1 = require("vscode-html-languageservice");
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("../../core/documents/utils");
const astro_attributes_1 = require("./features/astro-attributes");
const utils_2 = require("./utils");
class HTMLPlugin {
    constructor(configManager) {
        this.__name = 'html';
        this.lang = (0, vscode_html_languageservice_1.getLanguageService)({
            customDataProviders: [astro_attributes_1.astroAttributes, astro_attributes_1.astroElements, astro_attributes_1.classListAttribute],
        });
        this.attributeOnlyLang = (0, vscode_html_languageservice_1.getLanguageService)({
            customDataProviders: [astro_attributes_1.astroAttributes],
            useDefaultDataProvider: false,
        });
        this.componentLang = (0, vscode_html_languageservice_1.getLanguageService)({
            customDataProviders: [astro_attributes_1.astroAttributes, astro_attributes_1.astroDirectives],
            useDefaultDataProvider: false,
        });
        this.styleScriptTemplate = new Set(['style']);
        this.configManager = configManager;
    }
    async doHover(document, position) {
        if (!(await this.featureEnabled(document, 'hover'))) {
            return null;
        }
        const html = document.html;
        if (!html) {
            return null;
        }
        const node = html.findNodeAt(document.offsetAt(position));
        if (!node) {
            return null;
        }
        // If the node we're hovering on is a component, instead only provide astro-specific hover info
        if ((0, utils_1.isPossibleComponent)(node) && node.tag !== 'Fragment') {
            return this.componentLang.doHover(document, position, html);
        }
        return this.lang.doHover(document, position, html);
    }
    /**
     * Get HTML completions
     */
    async getCompletions(document, position) {
        if (!(await this.featureEnabled(document, 'completions'))) {
            return null;
        }
        const html = document.html;
        const offset = document.offsetAt(position);
        if (!html ||
            (0, utils_1.isInsideFrontmatter)(document.getText(), offset) ||
            (0, utils_1.isInsideExpression)(document.getText(), html.findNodeAt(offset).start, offset)) {
            return null;
        }
        // Get Emmet completions
        let emmetResults = {
            isIncomplete: true,
            items: [],
        };
        const emmetConfig = await this.configManager.getEmmetConfig(document);
        const extensionConfig = (await this.configManager.getConfig('astro', document.uri)) ?? {};
        if (extensionConfig?.html?.completions?.emmet ?? true) {
            this.lang.setCompletionParticipants([
                {
                    onHtmlContent: () => (emmetResults = (0, emmet_helper_1.doComplete)(document, position, 'html', emmetConfig) || emmetResults),
                },
            ]);
        }
        // If we're in a component starting tag, we do not want HTML language completions
        // as HTML attributes are not valid for components
        const inComponentTag = (0, utils_1.isInComponentStartTag)(html, offset);
        const inTagName = (0, utils_1.isInTagName)(html, offset);
        const results = inComponentTag && !inTagName
            ? (0, utils_2.removeDataAttrCompletion)(this.attributeOnlyLang.doComplete(document, position, html).items)
            : this.lang.doComplete(document, position, html).items.filter(isNoAddedTagWithNoDocumentation);
        const langCompletions = inComponentTag ? [] : this.getLangCompletions(results);
        return vscode_languageserver_1.CompletionList.create([...results, ...langCompletions, ...emmetResults.items], 
        // Emmet completions change on every keystroke, so they are never complete
        emmetResults.items.length > 0);
        // Filter script and style completions with no documentation to prevent duplicates
        // due to our added definitions for those tags
        function isNoAddedTagWithNoDocumentation(item) {
            return !(['script', 'style'].includes(item.label) && item.documentation === undefined);
        }
    }
    getFoldingRanges(document) {
        const html = document.html;
        if (!html) {
            return null;
        }
        return this.lang.getFoldingRanges(document);
    }
    getLinkedEditingRanges(document, position) {
        const html = document.html;
        if (!html) {
            return null;
        }
        const ranges = this.lang.findLinkedEditingRanges(document, position, html);
        if (!ranges) {
            return null;
        }
        return { ranges };
    }
    async doTagComplete(document, position) {
        if (!(await this.featureEnabled(document, 'tagComplete'))) {
            return null;
        }
        const html = document.html;
        const offset = document.offsetAt(position);
        if (!html ||
            (0, utils_1.isInsideFrontmatter)(document.getText(), offset) ||
            (0, utils_1.isInsideExpression)(document.getText(), html.findNodeAt(offset).start, offset)) {
            return null;
        }
        return this.lang.doTagComplete(document, position, html);
    }
    async getDocumentSymbols(document) {
        if (!(await this.featureEnabled(document, 'documentSymbols'))) {
            return [];
        }
        const html = document.html;
        if (!html) {
            return [];
        }
        return this.lang.findDocumentSymbols(document, html);
    }
    /**
     * Get lang completions for style tags (ex: `<style lang="scss">`)
     */
    getLangCompletions(completions) {
        const styleScriptTemplateCompletions = completions.filter((completion) => completion.kind === vscode_languageserver_1.CompletionItemKind.Property && this.styleScriptTemplate.has(completion.label));
        const langCompletions = [];
        addLangCompletion('style', ['scss', 'sass', 'less', 'styl', 'stylus']);
        return langCompletions;
        /** Add language completions */
        function addLangCompletion(tag, languages) {
            const existingCompletion = styleScriptTemplateCompletions.find((completion) => completion.label === tag);
            if (!existingCompletion) {
                return;
            }
            languages.forEach((lang) => langCompletions.push({
                ...existingCompletion,
                label: `${tag} (lang="${lang}")`,
                insertText: existingCompletion.insertText && `${existingCompletion.insertText} lang="${lang}"`,
                textEdit: existingCompletion.textEdit && vscode_languageserver_1.TextEdit.is(existingCompletion.textEdit)
                    ? {
                        range: existingCompletion.textEdit.range,
                        newText: `${existingCompletion.textEdit.newText} lang="${lang}"`,
                    }
                    : undefined,
            }));
        }
    }
    async featureEnabled(document, feature) {
        return ((await this.configManager.isEnabled(document, 'html')) &&
            (await this.configManager.isEnabled(document, 'html', feature)));
    }
}
exports.HTMLPlugin = HTMLPlugin;

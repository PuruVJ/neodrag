"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = exports.defaultLSConfig = void 0;
const utils_1 = require("../../utils");
// The default language server configuration is used only in two cases:
// 1. When the client does not support `workspace/configuration` requests and as such, needs a global config
// 2. Inside tests, where we don't have a client connection because.. well.. we don't have a client
// Additionally, the default config is used to set default settings for some settings (ex: formatting settings)
exports.defaultLSConfig = {
    typescript: {
        enabled: true,
        allowArbitraryAttributes: false,
        diagnostics: { enabled: true },
        hover: { enabled: true },
        completions: { enabled: true },
        definitions: { enabled: true },
        documentSymbols: { enabled: true },
        codeActions: { enabled: true },
        rename: { enabled: true },
        signatureHelp: { enabled: true },
        semanticTokens: { enabled: true },
    },
    css: {
        enabled: true,
        hover: { enabled: true },
        completions: { enabled: true, emmet: true },
        documentColors: { enabled: true },
        documentSymbols: { enabled: true },
    },
    html: {
        enabled: true,
        hover: { enabled: true },
        completions: { enabled: true, emmet: true },
        tagComplete: { enabled: true },
        documentSymbols: { enabled: true },
    },
    format: {
        indentFrontmatter: false,
        newLineAfterFrontmatter: true,
    },
};
/**
 * Manager class to facilitate accessing and updating the user's config
 * Not to be confused with other kind of configurations (such as the Astro project configuration and the TypeScript/Javascript one)
 * For more info on this, see the [internal docs](../../../../../docs/internal/language-server/config.md)
 */
class ConfigManager {
    constructor(connection, hasConfigurationCapability) {
        this.connection = connection;
        this.hasConfigurationCapability = hasConfigurationCapability;
        this.globalConfig = { astro: exports.defaultLSConfig };
        this.documentSettings = {};
        // If set to true, the next time we need a TypeScript language service, we'll rebuild it so it gets the new config
        this.shouldRefreshTSServices = false;
        this.isTrusted = true;
    }
    updateConfig() {
        // Reset all cached document settings
        this.documentSettings = {};
        this.shouldRefreshTSServices = true;
    }
    removeDocument(scopeUri) {
        delete this.documentSettings[scopeUri];
    }
    async getConfig(section, scopeUri) {
        if (!this.connection || !this.hasConfigurationCapability) {
            return (0, utils_1.get)(this.globalConfig, section) ?? {};
        }
        if (!this.documentSettings[scopeUri]) {
            this.documentSettings[scopeUri] = {};
        }
        if (!this.documentSettings[scopeUri][section]) {
            this.documentSettings[scopeUri][section] = await this.connection.workspace.getConfiguration({
                scopeUri,
                section,
            });
        }
        return this.documentSettings[scopeUri][section];
    }
    async getEmmetConfig(document) {
        const emmetConfig = (await this.getConfig('emmet', document.uri)) ?? {};
        return {
            ...emmetConfig,
            preferences: emmetConfig.preferences ?? {},
            showExpandedAbbreviation: emmetConfig.showExpandedAbbreviation ?? 'always',
            showAbbreviationSuggestions: emmetConfig.showAbbreviationSuggestions ?? true,
            syntaxProfiles: emmetConfig.syntaxProfiles ?? {},
            variables: emmetConfig.variables ?? {},
            excludeLanguages: emmetConfig.excludeLanguages ?? [],
            showSuggestionsAsSnippets: emmetConfig.showSuggestionsAsSnippets ?? false,
        };
    }
    async getPrettierVSConfig(document) {
        const prettierVSConfig = (await this.getConfig('prettier', document.uri)) ?? {};
        return prettierVSConfig;
    }
    async getTSFormatConfig(document, vscodeOptions) {
        const formatConfig = (await this.getConfig('typescript.format', document.uri)) ?? {};
        return {
            tabSize: vscodeOptions?.tabSize,
            indentSize: vscodeOptions?.tabSize,
            convertTabsToSpaces: vscodeOptions?.insertSpaces,
            // We can use \n here since the editor normalizes later on to its line endings.
            newLineCharacter: '\n',
            insertSpaceAfterCommaDelimiter: formatConfig.insertSpaceAfterCommaDelimiter ?? true,
            insertSpaceAfterConstructor: formatConfig.insertSpaceAfterConstructor ?? false,
            insertSpaceAfterSemicolonInForStatements: formatConfig.insertSpaceAfterSemicolonInForStatements ?? true,
            insertSpaceBeforeAndAfterBinaryOperators: formatConfig.insertSpaceBeforeAndAfterBinaryOperators ?? true,
            insertSpaceAfterKeywordsInControlFlowStatements: formatConfig.insertSpaceAfterKeywordsInControlFlowStatements ?? true,
            insertSpaceAfterFunctionKeywordForAnonymousFunctions: formatConfig.insertSpaceAfterFunctionKeywordForAnonymousFunctions ?? true,
            insertSpaceBeforeFunctionParenthesis: formatConfig.insertSpaceBeforeFunctionParenthesis ?? false,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: formatConfig.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis ?? false,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: formatConfig.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets ?? false,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: formatConfig.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces ?? true,
            insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: formatConfig.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces ?? true,
            insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: formatConfig.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces ?? false,
            insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: formatConfig.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces ?? false,
            insertSpaceAfterTypeAssertion: formatConfig.insertSpaceAfterTypeAssertion ?? false,
            placeOpenBraceOnNewLineForFunctions: formatConfig.placeOpenBraceOnNewLineForFunctions ?? false,
            placeOpenBraceOnNewLineForControlBlocks: formatConfig.placeOpenBraceOnNewLineForControlBlocks ?? false,
            semicolons: formatConfig.semicolons ?? 'ignore',
        };
    }
    async getTSPreferences(document) {
        const config = (await this.getConfig('typescript', document.uri)) ?? {};
        const preferences = (await this.getConfig('typescript.preferences', document.uri)) ?? {};
        return {
            quotePreference: getQuoteStylePreference(preferences),
            importModuleSpecifierPreference: getImportModuleSpecifierPreference(preferences),
            importModuleSpecifierEnding: getImportModuleSpecifierEndingPreference(preferences),
            allowTextChangesInNewFiles: document.uri.startsWith('file://'),
            providePrefixAndSuffixTextForRename: (preferences.renameShorthandProperties ?? true) === false ? false : preferences.useAliasesForRenames ?? true,
            includeAutomaticOptionalChainCompletions: config.suggest?.includeAutomaticOptionalChainCompletions ?? true,
            includeCompletionsForImportStatements: config.suggest?.includeCompletionsForImportStatements ?? true,
            includeCompletionsWithSnippetText: config.suggest?.includeCompletionsWithSnippetText ?? true,
            includeCompletionsForModuleExports: config.suggest?.autoImports ?? true,
            allowIncompleteCompletions: true,
            includeCompletionsWithInsertText: true,
            // Inlay Hints
            includeInlayParameterNameHints: getInlayParameterNameHintsPreference(config),
            includeInlayParameterNameHintsWhenArgumentMatchesName: !(config.inlayHints?.parameterNames?.suppressWhenArgumentMatchesName ?? true),
            includeInlayFunctionParameterTypeHints: config.inlayHints?.parameterTypes?.enabled ?? false,
            includeInlayVariableTypeHints: config.inlayHints?.variableTypes?.enabled ?? false,
            includeInlayPropertyDeclarationTypeHints: config.inlayHints?.propertyDeclarationTypes?.enabled ?? false,
            includeInlayFunctionLikeReturnTypeHints: config.inlayHints?.functionLikeReturnTypes?.enabled ?? false,
            includeInlayEnumMemberValueHints: config.inlayHints?.enumMemberValues?.enabled ?? false,
        };
    }
    /**
     * Return true if a plugin and an optional feature is enabled
     */
    async isEnabled(document, plugin, feature) {
        const config = (await this.getConfig('astro', document.uri)) ?? {};
        if (config[plugin]) {
            let res = config[plugin].enabled ?? true;
            if (feature && config[plugin][feature]) {
                res = (res && config[plugin][feature].enabled) ?? true;
            }
            return res;
        }
        return true;
    }
    /**
     * Updating the global config should only be done in cases where the client doesn't support `workspace/configuration`
     * or inside of tests.
     *
     * The `outsideAstro` parameter can be set to true to change configurations in the global scope.
     * For example, to change TypeScript settings
     */
    updateGlobalConfig(config, outsideAstro) {
        if (outsideAstro) {
            this.globalConfig = (0, utils_1.mergeDeep)({}, this.globalConfig, config);
        }
        else {
            this.globalConfig.astro = (0, utils_1.mergeDeep)({}, exports.defaultLSConfig, this.globalConfig.astro, config);
        }
        this.shouldRefreshTSServices = true;
    }
}
exports.ConfigManager = ConfigManager;
function getQuoteStylePreference(config) {
    switch (config.quoteStyle) {
        case 'single':
            return 'single';
        case 'double':
            return 'double';
        default:
            return 'auto';
    }
}
function getImportModuleSpecifierPreference(config) {
    switch (config.importModuleSpecifier) {
        case 'project-relative':
            return 'project-relative';
        case 'relative':
            return 'relative';
        case 'non-relative':
            return 'non-relative';
        default:
            return undefined;
    }
}
function getImportModuleSpecifierEndingPreference(config) {
    switch (config.importModuleSpecifierEnding) {
        case 'minimal':
            return 'minimal';
        case 'index':
            return 'index';
        case 'js':
            return 'js';
        default:
            return 'auto';
    }
}
function getInlayParameterNameHintsPreference(config) {
    switch (config.inlayHints?.parameterNames?.enabled) {
        case 'none':
            return 'none';
        case 'literals':
            return 'literals';
        case 'all':
            return 'all';
        default:
            return undefined;
    }
}

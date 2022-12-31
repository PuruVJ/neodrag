"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroPlugin = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const importPackage_1 = require("../../importPackage");
const CompletionsProvider_1 = require("./features/CompletionsProvider");
class AstroPlugin {
    constructor(configManager, languageServiceManager) {
        this.__name = 'astro';
        this.configManager = configManager;
        this.languageServiceManager = languageServiceManager;
        this.ts = languageServiceManager.docContext.ts;
        this.completionProvider = new CompletionsProvider_1.CompletionsProviderImpl(this.languageServiceManager);
    }
    async getCompletions(document, position, completionContext) {
        const completions = this.completionProvider.getCompletions(document, position, completionContext);
        return completions;
    }
    async formatDocument(document, options) {
        const filePath = document.getFilePath();
        if (!filePath) {
            return [];
        }
        const prettier = (0, importPackage_1.importPrettier)(filePath);
        const prettierConfig = (await prettier.resolveConfig(filePath, { editorconfig: true, useCache: false })) ?? {};
        const prettierVSConfig = await this.configManager.getPrettierVSConfig(document);
        const editorFormatConfig = options !== undefined // We need to check for options existing here because some editors might not have it
            ? {
                tabWidth: options.tabSize,
                useTabs: !options.insertSpaces,
            }
            : {};
        // Return a config with the following cascade:
        // - Prettier config file should always win if it exists, if it doesn't:
        // - Prettier config from the VS Code extension is used, if it doesn't exist:
        // - Use the editor's basic configuration settings
        const resultConfig = returnObjectIfHasKeys(prettierConfig) || returnObjectIfHasKeys(prettierVSConfig) || editorFormatConfig;
        const fileInfo = await prettier.getFileInfo(filePath, { ignorePath: '.prettierignore' });
        if (fileInfo.ignored) {
            return [];
        }
        const result = prettier.format(document.getText(), {
            ...resultConfig,
            plugins: getAstroPrettierPlugin(),
            parser: 'astro',
        });
        return document.getText() === result
            ? []
            : [vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(document.positionAt(0), document.positionAt(document.getTextLength())), result)];
        function getAstroPrettierPlugin() {
            const hasPluginLoadedAlready = prettier.getSupportInfo().languages.some((l) => l.name === 'astro');
            return hasPluginLoadedAlready ? [] : [(0, importPackage_1.getPrettierPluginPath)(filePath)];
        }
    }
    getFoldingRanges(document) {
        const foldingRanges = [];
        const { frontmatter } = document.astroMeta;
        // Currently editing frontmatter, don't fold
        if (frontmatter.state !== 'closed')
            return foldingRanges;
        // The way folding ranges work is by folding anything between the starting position and the ending one, as such
        // the start in this case should be after the frontmatter start (after the starting ---) until the last character
        // of the last line of the frontmatter before its ending (before the closing ---)
        // ---
        //		^ -- start
        // console.log("Astro")
        // ---								^ -- end
        const start = document.positionAt(frontmatter.startOffset + 3);
        const end = document.positionAt(frontmatter.endOffset - 1);
        return [
            {
                startLine: start.line,
                startCharacter: start.character,
                endLine: end.line,
                endCharacter: end.character,
                kind: vscode_languageserver_1.FoldingRangeKind.Imports,
            },
        ];
    }
}
exports.AstroPlugin = AstroPlugin;
function returnObjectIfHasKeys(obj) {
    if (Object.keys(obj || {}).length > 0) {
        return obj;
    }
}

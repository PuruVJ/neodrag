"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionsProviderImpl = void 0;
const vscode_html_languageservice_1 = require("vscode-html-languageservice");
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("../../../core/documents/utils");
const astro_attributes_1 = require("../../html/features/astro-attributes");
const utils_2 = require("../../html/utils");
const utils_3 = require("../../typescript/utils");
class CompletionsProviderImpl {
    constructor(languageServiceManager) {
        this.lastCompletion = null;
        this.directivesHTMLLang = (0, vscode_html_languageservice_1.getLanguageService)({
            customDataProviders: [astro_attributes_1.astroDirectives],
            useDefaultDataProvider: false,
        });
        this.languageServiceManager = languageServiceManager;
        this.ts = languageServiceManager.docContext.ts;
    }
    async getCompletions(document, position, completionContext) {
        let items = [];
        const html = document.html;
        const offset = document.offsetAt(position);
        const node = html.findNodeAt(offset);
        const insideExpression = (0, utils_1.isInsideExpression)(document.getText(), node.start, offset);
        if (completionContext?.triggerCharacter === '-' && node.parent === undefined && !insideExpression) {
            const frontmatter = this.getComponentScriptCompletion(document, position);
            if (frontmatter)
                items.push(frontmatter);
        }
        if ((0, utils_1.isInComponentStartTag)(html, offset) && !insideExpression) {
            const { completions: props, componentFilePath } = await this.getPropCompletionsAndFilePath(document, position, completionContext);
            if (props.length) {
                items.push(...props);
            }
            const isAstro = componentFilePath?.endsWith('.astro');
            if (!isAstro && node.tag !== 'Fragment') {
                const directives = (0, utils_2.removeDataAttrCompletion)(this.directivesHTMLLang.doComplete(document, position, html).items);
                items.push(...directives);
            }
        }
        return vscode_languageserver_1.CompletionList.create(items, true);
    }
    getComponentScriptCompletion(document, position) {
        const base = {
            kind: vscode_languageserver_1.CompletionItemKind.Snippet,
            label: '---',
            sortText: '\0',
            preselect: true,
            detail: 'Create component script block',
            insertTextFormat: vscode_languageserver_1.InsertTextFormat.Snippet,
            commitCharacters: [],
        };
        const prefix = document.getLineUntilOffset(document.offsetAt(position));
        if (document.astroMeta.frontmatter.state === null) {
            return {
                ...base,
                insertText: '---\n$0\n---',
                textEdit: prefix.match(/^\s*\-+/)
                    ? vscode_languageserver_1.TextEdit.replace({ start: { ...position, character: 0 }, end: position }, '---\n$0\n---')
                    : undefined,
            };
        }
        if (document.astroMeta.frontmatter.state === 'open') {
            let insertText = '---';
            // If the current line is a full component script starter/ender, the user expects a full frontmatter
            // completion and not just a completion for "---"  on the same line (which result in, well, nothing)
            if (prefix === '---') {
                insertText = '---\n$0\n---';
            }
            return {
                ...base,
                insertText,
                detail: insertText === '---' ? 'Close component script block' : 'Create component script block',
                textEdit: prefix.match(/^\s*\-+/)
                    ? vscode_languageserver_1.TextEdit.replace({ start: { ...position, character: 0 }, end: position }, insertText)
                    : undefined,
            };
        }
        return null;
    }
    async getPropCompletionsAndFilePath(document, position, completionContext) {
        const offset = document.offsetAt(position);
        const html = document.html;
        const node = html.findNodeAt(offset);
        if (!(0, utils_1.isPossibleComponent)(node)) {
            return { completions: [], componentFilePath: null };
        }
        const inAttribute = node.start + node.tag.length < offset;
        if (!inAttribute) {
            return { completions: [], componentFilePath: null };
        }
        if (completionContext?.triggerCharacter === '/' || completionContext?.triggerCharacter === '>') {
            return { completions: [], componentFilePath: null };
        }
        // If inside of attribute value, skip.
        if (completionContext &&
            completionContext.triggerKind === vscode_languageserver_1.CompletionTriggerKind.TriggerCharacter &&
            completionContext.triggerCharacter === '"') {
            return { completions: [], componentFilePath: null };
        }
        const componentName = node.tag;
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        // Get the source file
        const tsFilePath = tsDoc.filePath;
        const program = lang.getProgram();
        const sourceFile = program?.getSourceFile(tsFilePath);
        const typeChecker = program?.getTypeChecker();
        if (!sourceFile || !typeChecker) {
            return { completions: [], componentFilePath: null };
        }
        // Get the import statement
        const imp = this.getImportedSymbol(sourceFile, componentName);
        const importType = imp && typeChecker.getTypeAtLocation(imp);
        if (!importType) {
            return { completions: [], componentFilePath: null };
        }
        const symbol = importType.getSymbol();
        if (!symbol) {
            return { completions: [], componentFilePath: null };
        }
        const symbolDeclaration = symbol.declarations;
        if (!symbolDeclaration) {
            return { completions: [], componentFilePath: null };
        }
        const filePath = symbolDeclaration[0].getSourceFile().fileName;
        const componentSnapshot = await this.languageServiceManager.getSnapshot(filePath);
        if (this.lastCompletion) {
            if (this.lastCompletion.tag === componentName &&
                this.lastCompletion.documentVersion == componentSnapshot.version) {
                return { completions: this.lastCompletion.completions, componentFilePath: filePath };
            }
        }
        // Get the component's props type
        const componentType = this.getPropType(symbolDeclaration, typeChecker);
        if (!componentType) {
            return { completions: [], componentFilePath: null };
        }
        let completionItems = [];
        // Add completions for this component's props type properties
        const properties = componentType.getProperties().filter((property) => property.name !== 'children') || [];
        properties.forEach((property) => {
            const type = typeChecker.getTypeOfSymbolAtLocation(property, imp);
            let completionItem = this.getCompletionItemForProperty(property, typeChecker, type);
            completionItems.push(completionItem);
        });
        this.lastCompletion = {
            tag: componentName,
            documentVersion: componentSnapshot.version,
            completions: completionItems,
        };
        return { completions: completionItems, componentFilePath: filePath };
    }
    getImportedSymbol(sourceFile, identifier) {
        for (let list of sourceFile.getChildren()) {
            for (let node of list.getChildren()) {
                if (this.ts.isImportDeclaration(node)) {
                    let clauses = node.importClause;
                    if (!clauses)
                        continue;
                    let namedImport = clauses.getChildAt(0);
                    if (this.ts.isNamedImports(namedImport)) {
                        for (let imp of namedImport.elements) {
                            // Iterate the named imports
                            if (imp.name.getText() === identifier) {
                                return imp;
                            }
                        }
                    }
                    else if (this.ts.isIdentifier(namedImport)) {
                        if (namedImport.getText() === identifier) {
                            return namedImport;
                        }
                    }
                }
            }
        }
        return null;
    }
    getPropType(declarations, typeChecker) {
        for (const decl of declarations) {
            const fileName = (0, utils_3.toVirtualFilePath)(decl.getSourceFile().fileName);
            if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx') || fileName.endsWith('.d.ts')) {
                if (!this.ts.isFunctionDeclaration(decl) && !this.ts.isFunctionTypeNode(decl)) {
                    console.error(`We only support functions declarations at the moment`);
                    continue;
                }
                const fn = decl;
                if (!fn.parameters.length)
                    continue;
                const param1 = fn.parameters[0];
                const propType = typeChecker.getTypeAtLocation(param1);
                return propType;
            }
        }
        return null;
    }
    getCompletionItemForProperty(mem, typeChecker, type) {
        const typeString = typeChecker.typeToString(type);
        let insertText = mem.name;
        switch (typeString) {
            case 'string':
                insertText = `${mem.name}="$1"`;
                break;
            case 'boolean':
                insertText = mem.name;
                break;
            default:
                insertText = `${mem.name}={$1}`;
                break;
        }
        let item = {
            label: mem.name,
            detail: typeString,
            insertText: insertText,
            insertTextFormat: vscode_languageserver_1.InsertTextFormat.Snippet,
            commitCharacters: [],
            // Ensure that props shows up first as a completion, despite this plugin being ran after the HTML one
            sortText: '\0',
        };
        if (mem.flags & this.ts.SymbolFlags.Optional) {
            item.filterText = item.label;
            item.label += '?';
            // Put optional props at a lower priority
            item.sortText = '_';
        }
        mem.getDocumentationComment(typeChecker);
        let description = mem
            .getDocumentationComment(typeChecker)
            .map((val) => val.text)
            .join('\n');
        if (description) {
            let docs = {
                kind: vscode_languageserver_1.MarkupKind.Markdown,
                value: description,
            };
            item.documentation = docs;
        }
        return item;
    }
}
exports.CompletionsProviderImpl = CompletionsProviderImpl;

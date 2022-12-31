Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageService = void 0;
const getProgram_1 = require("./getProgram");
const embedded = require("@volar/language-core");
function createLanguageService(host, mods) {
    const core = embedded.createLanguageContext(host, mods);
    const ts = host.getTypeScriptModule();
    const ls = ts.createLanguageService(core.typescript.languageServiceHost);
    return new Proxy({
        organizeImports,
        // only support for .ts for now, not support for .vue
        getCompletionsAtPosition,
        getDefinitionAtPosition,
        getDefinitionAndBoundSpan,
        getTypeDefinitionAtPosition,
        getImplementationAtPosition,
        findRenameLocations,
        getReferencesAtPosition,
        findReferences,
        // TODO: now is handled by vue server
        // prepareCallHierarchy: tsLanguageService.rawLs.prepareCallHierarchy,
        // provideCallHierarchyIncomingCalls: tsLanguageService.rawLs.provideCallHierarchyIncomingCalls,
        // provideCallHierarchyOutgoingCalls: tsLanguageService.rawLs.provideCallHierarchyOutgoingCalls,
        // getEditsForFileRename: tsLanguageService.rawLs.getEditsForFileRename,
        // TODO
        // getCodeFixesAtPosition: tsLanguageService.rawLs.getCodeFixesAtPosition,
        // getCombinedCodeFix: tsLanguageService.rawLs.getCombinedCodeFix,
        // applyCodeActionCommand: tsLanguageService.rawLs.applyCodeActionCommand,
        // getApplicableRefactors: tsLanguageService.rawLs.getApplicableRefactors,
        // getEditsForRefactor: tsLanguageService.rawLs.getEditsForRefactor,
        getProgram: () => (0, getProgram_1.getProgram)(ts, core, ls),
        __internal__: {
            context: core,
            languageService: ls,
        },
    }, {
        get: (target, property) => {
            if (property in target) {
                return target[property];
            }
            return ls[property];
        },
    });
    // apis
    function organizeImports(args, formatOptions, preferences) {
        var _a;
        let edits = [];
        const file = (_a = core.virtualFiles.get(args.fileName)) === null || _a === void 0 ? void 0 : _a[1];
        if (file) {
            embedded.forEachEmbeddedFile(file, embedded => {
                if (embedded.kind && embedded.capabilities.codeAction) {
                    edits = edits.concat(ls.organizeImports(Object.assign(Object.assign({}, args), { fileName: embedded.fileName }), formatOptions, preferences));
                }
            });
        }
        else {
            return ls.organizeImports(args, formatOptions, preferences);
        }
        return edits.map(transformFileTextChanges).filter(notEmpty);
    }
    function getCompletionsAtPosition(fileName, position, options) {
        const finalResult = ls.getCompletionsAtPosition(fileName, position, options);
        if (finalResult) {
            finalResult.entries = finalResult.entries.filter(entry => entry.name.indexOf('__VLS_') === -1);
        }
        return finalResult;
    }
    function getReferencesAtPosition(fileName, position) {
        return findLocations(fileName, position, 'references');
    }
    function getDefinitionAtPosition(fileName, position) {
        return findLocations(fileName, position, 'definition');
    }
    function getTypeDefinitionAtPosition(fileName, position) {
        return findLocations(fileName, position, 'typeDefinition');
    }
    function getImplementationAtPosition(fileName, position) {
        return findLocations(fileName, position, 'implementation');
    }
    function findRenameLocations(fileName, position, findInStrings, findInComments, providePrefixAndSuffixTextForRename) {
        return findLocations(fileName, position, 'rename', findInStrings, findInComments, providePrefixAndSuffixTextForRename);
    }
    function findLocations(fileName, position, mode, findInStrings = false, findInComments = false, providePrefixAndSuffixTextForRename) {
        const loopChecker = new Set();
        let symbols = [];
        withMirrors(fileName, position);
        return symbols.map(s => transformDocumentSpanLike(s)).filter(notEmpty);
        function withMirrors(fileName, position) {
            var _a;
            if (loopChecker.has(fileName + ':' + position))
                return;
            loopChecker.add(fileName + ':' + position);
            const _symbols = mode === 'definition' ? ls.getDefinitionAtPosition(fileName, position)
                : mode === 'typeDefinition' ? ls.getTypeDefinitionAtPosition(fileName, position)
                    : mode === 'references' ? ls.getReferencesAtPosition(fileName, position)
                        : mode === 'implementation' ? ls.getImplementationAtPosition(fileName, position)
                            : mode === 'rename' ? ls.findRenameLocations(fileName, position, findInStrings, findInComments, providePrefixAndSuffixTextForRename)
                                : undefined;
            if (!_symbols)
                return;
            symbols = symbols.concat(_symbols);
            for (const ref of _symbols) {
                loopChecker.add(ref.fileName + ':' + ref.textSpan.start);
                const virtualFile = (_a = core.virtualFiles.getSourceByVirtualFileName(ref.fileName)) === null || _a === void 0 ? void 0 : _a[2];
                if (!virtualFile)
                    continue;
                const mirrorMap = core.virtualFiles.getMirrorMap(virtualFile);
                if (!mirrorMap)
                    continue;
                for (const [mirrorOffset, data] of mirrorMap.findMirrorOffsets(ref.textSpan.start)) {
                    if ((mode === 'definition' || mode === 'typeDefinition' || mode === 'implementation') && !data.definition)
                        continue;
                    if ((mode === 'references') && !data.references)
                        continue;
                    if ((mode === 'rename') && !data.rename)
                        continue;
                    if (loopChecker.has(ref.fileName + ':' + mirrorOffset))
                        continue;
                    withMirrors(ref.fileName, mirrorOffset);
                }
            }
        }
    }
    function getDefinitionAndBoundSpan(fileName, position) {
        const loopChecker = new Set();
        let textSpan;
        let symbols = [];
        withMirrors(fileName, position);
        if (!textSpan)
            return;
        return {
            textSpan: textSpan,
            definitions: symbols === null || symbols === void 0 ? void 0 : symbols.map(s => transformDocumentSpanLike(s)).filter(notEmpty),
        };
        function withMirrors(fileName, position) {
            var _a;
            if (loopChecker.has(fileName + ':' + position))
                return;
            loopChecker.add(fileName + ':' + position);
            const _symbols = ls.getDefinitionAndBoundSpan(fileName, position);
            if (!_symbols)
                return;
            if (!textSpan) {
                textSpan = _symbols.textSpan;
            }
            if (!_symbols.definitions)
                return;
            symbols = symbols.concat(_symbols.definitions);
            for (const ref of _symbols.definitions) {
                loopChecker.add(ref.fileName + ':' + ref.textSpan.start);
                const virtualFile = (_a = core.virtualFiles.getSourceByVirtualFileName(ref.fileName)) === null || _a === void 0 ? void 0 : _a[2];
                if (!virtualFile)
                    continue;
                const mirrorMap = core.virtualFiles.getMirrorMap(virtualFile);
                if (!mirrorMap)
                    continue;
                for (const [mirrorOffset, data] of mirrorMap.findMirrorOffsets(ref.textSpan.start)) {
                    if (!data.definition)
                        continue;
                    if (loopChecker.has(ref.fileName + ':' + mirrorOffset))
                        continue;
                    withMirrors(ref.fileName, mirrorOffset);
                }
            }
        }
    }
    function findReferences(fileName, position) {
        const loopChecker = new Set();
        let symbols = [];
        withMirrors(fileName, position);
        return symbols.map(s => transformReferencedSymbol(s)).filter(notEmpty);
        function withMirrors(fileName, position) {
            var _a;
            if (loopChecker.has(fileName + ':' + position))
                return;
            loopChecker.add(fileName + ':' + position);
            const _symbols = ls.findReferences(fileName, position);
            if (!_symbols)
                return;
            symbols = symbols.concat(_symbols);
            for (const symbol of _symbols) {
                for (const ref of symbol.references) {
                    loopChecker.add(ref.fileName + ':' + ref.textSpan.start);
                    const virtualFile = (_a = core.virtualFiles.getSourceByVirtualFileName(ref.fileName)) === null || _a === void 0 ? void 0 : _a[2];
                    if (!virtualFile)
                        continue;
                    const mirrorMap = core.virtualFiles.getMirrorMap(virtualFile);
                    if (!mirrorMap)
                        continue;
                    for (const [mirrorOffset, data] of mirrorMap.findMirrorOffsets(ref.textSpan.start)) {
                        if (!data.references)
                            continue;
                        if (loopChecker.has(ref.fileName + ':' + mirrorOffset))
                            continue;
                        withMirrors(ref.fileName, mirrorOffset);
                    }
                }
            }
        }
    }
    // transforms
    function transformFileTextChanges(changes) {
        const source = core.virtualFiles.getSourceByVirtualFileName(changes.fileName);
        if (source) {
            return Object.assign(Object.assign({}, changes), { fileName: source[0], textChanges: changes.textChanges.map(c => {
                    const span = transformSpan(changes.fileName, c.span);
                    if (span) {
                        return Object.assign(Object.assign({}, c), { span: span.textSpan });
                    }
                }).filter(notEmpty) });
        }
        else {
            return changes;
        }
    }
    function transformReferencedSymbol(symbol) {
        const definition = transformDocumentSpanLike(symbol.definition);
        const references = symbol.references.map(r => transformDocumentSpanLike(r)).filter(notEmpty);
        if (definition) {
            return {
                definition,
                references,
            };
        }
        else if (references.length) { // TODO: remove patching
            return {
                definition: Object.assign(Object.assign({}, symbol.definition), { fileName: references[0].fileName, textSpan: references[0].textSpan }),
                references,
            };
        }
    }
    function transformDocumentSpanLike(documentSpan) {
        const textSpan = transformSpan(documentSpan.fileName, documentSpan.textSpan);
        if (!textSpan)
            return;
        const contextSpan = transformSpan(documentSpan.fileName, documentSpan.contextSpan);
        const originalTextSpan = transformSpan(documentSpan.originalFileName, documentSpan.originalTextSpan);
        const originalContextSpan = transformSpan(documentSpan.originalFileName, documentSpan.originalContextSpan);
        return Object.assign(Object.assign({}, documentSpan), { fileName: textSpan.fileName, textSpan: textSpan.textSpan, contextSpan: contextSpan === null || contextSpan === void 0 ? void 0 : contextSpan.textSpan, originalFileName: originalTextSpan === null || originalTextSpan === void 0 ? void 0 : originalTextSpan.fileName, originalTextSpan: originalTextSpan === null || originalTextSpan === void 0 ? void 0 : originalTextSpan.textSpan, originalContextSpan: originalContextSpan === null || originalContextSpan === void 0 ? void 0 : originalContextSpan.textSpan });
    }
    function transformSpan(fileName, textSpan) {
        if (!fileName)
            return;
        if (!textSpan)
            return;
        const source = core.virtualFiles.getSourceByVirtualFileName(fileName);
        if (source) {
            for (const [sourceFileName, map] of core.virtualFiles.getMaps(source[2])) {
                if (source[0] !== sourceFileName)
                    continue;
                const sourceLoc = map.toSourceOffset(textSpan.start);
                if (sourceLoc) {
                    return {
                        fileName: source[0],
                        textSpan: {
                            start: sourceLoc[0],
                            length: textSpan.length,
                        },
                    };
                }
            }
        }
        else {
            return {
                fileName,
                textSpan,
            };
        }
    }
}
exports.createLanguageService = createLanguageService;
function notEmpty(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=index.js.map
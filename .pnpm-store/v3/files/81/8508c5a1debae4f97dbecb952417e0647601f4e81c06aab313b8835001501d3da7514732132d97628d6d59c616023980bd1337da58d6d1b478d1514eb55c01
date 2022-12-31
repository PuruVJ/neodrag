Object.defineProperty(exports, "__esModule", { value: true });
exports.VueFile = exports.VueEmbeddedFile = void 0;
const language_core_1 = require("@volar/language-core");
const source_map_1 = require("@volar/source-map");
const reactivity_1 = require("@vue/reactivity");
class VueEmbeddedFile {
    constructor(fileName) {
        this.fileName = fileName;
        this.kind = language_core_1.FileKind.TextFile;
        this.capabilities = {};
        this.content = [];
        this.extraMappings = [];
        this.mirrorBehaviorMappings = [];
    }
}
exports.VueEmbeddedFile = VueEmbeddedFile;
class VueFile {
    get compiledSFCTemplate() {
        return this._compiledSfcTemplate.value;
    }
    get mainScriptName() {
        var _a, _b;
        return (_b = (_a = this._allEmbeddedFiles.value.find(e => e.file.fileName.replace(this.fileName, '').match(/^\.(js|ts)x?$/))) === null || _a === void 0 ? void 0 : _a.file.fileName) !== null && _b !== void 0 ? _b : '';
    }
    get embeddedFiles() {
        return this._embeddedFiles.value;
    }
    // functions
    constructor(fileName, snapshot, ts, plugins) {
        this.fileName = fileName;
        this.snapshot = snapshot;
        this.ts = ts;
        this.plugins = plugins;
        this.capabilities = {
            diagnostic: true,
            foldingRange: true,
            documentFormatting: true,
            documentSymbol: true,
            codeAction: true,
            inlayHint: true,
        };
        this.kind = language_core_1.FileKind.TextFile;
        this.mappings = [];
        // refs
        this.sfc = (0, reactivity_1.reactive)(Object.assign({ template: null, script: null, scriptSetup: null, styles: [], customBlocks: [], templateAst: (0, reactivity_1.computed)(() => {
                var _a;
                return (_a = this._compiledSfcTemplate.value) === null || _a === void 0 ? void 0 : _a.ast;
            }), scriptAst: (0, reactivity_1.computed)(() => {
                if (this.sfc.script) {
                    return this.ts.createSourceFile(this.fileName + '.' + this.sfc.script.lang, this.sfc.script.content, this.ts.ScriptTarget.Latest);
                }
            }), scriptSetupAst: (0, reactivity_1.computed)(() => {
                if (this.sfc.scriptSetup) {
                    return this.ts.createSourceFile(this.fileName + '.' + this.sfc.scriptSetup.lang, this.sfc.scriptSetup.content, this.ts.ScriptTarget.Latest);
                }
            }) }, {
            // backward compatible
            getTemplateAst: () => {
                var _a;
                return (_a = this.compiledSFCTemplate) === null || _a === void 0 ? void 0 : _a.ast;
            },
        })) /* avoid Sfc unwrap in .d.ts by reactive */;
        // computed
        this._sfcBlocks = (0, reactivity_1.computed)(() => {
            const blocks = {};
            if (this.sfc.template) {
                blocks[this.sfc.template.name] = this.sfc.template;
            }
            if (this.sfc.script) {
                blocks[this.sfc.script.name] = this.sfc.script;
            }
            if (this.sfc.scriptSetup) {
                blocks[this.sfc.scriptSetup.name] = this.sfc.scriptSetup;
            }
            for (const block of this.sfc.styles) {
                blocks[block.name] = block;
            }
            for (const block of this.sfc.customBlocks) {
                blocks[block.name] = block;
            }
            return blocks;
        });
        this._compiledSfcTemplate = (0, reactivity_1.computed)(() => {
            var _a, _b, _c, _d, _e;
            if (((_a = this.compiledSFCTemplateCache) === null || _a === void 0 ? void 0 : _a.template) === ((_b = this.sfc.template) === null || _b === void 0 ? void 0 : _b.content)) {
                return {
                    errors: [],
                    warnings: [],
                    ast: (_c = this.compiledSFCTemplateCache) === null || _c === void 0 ? void 0 : _c.result.ast,
                };
            }
            if (this.sfc.template) {
                // incremental update
                if ((_d = this.compiledSFCTemplateCache) === null || _d === void 0 ? void 0 : _d.plugin.updateSFCTemplate) {
                    const change = this.snapshot.getChangeRange(this.compiledSFCTemplateCache.snapshot);
                    if (change) {
                        (0, reactivity_1.pauseTracking)();
                        const templateOffset = this.sfc.template.startTagEnd;
                        (0, reactivity_1.resetTracking)();
                        const newText = this.snapshot.getText(change.span.start, change.span.start + change.newLength);
                        const newResult = this.compiledSFCTemplateCache.plugin.updateSFCTemplate(this.compiledSFCTemplateCache.result, {
                            start: change.span.start - templateOffset,
                            end: change.span.start + change.span.length - templateOffset,
                            newText,
                        });
                        if (newResult) {
                            this.compiledSFCTemplateCache.template = this.sfc.template.content;
                            this.compiledSFCTemplateCache.snapshot = this.snapshot;
                            this.compiledSFCTemplateCache.result = newResult;
                            return {
                                errors: [],
                                warnings: [],
                                ast: newResult.ast,
                            };
                        }
                    }
                }
                const errors = [];
                const warnings = [];
                let options = {
                    onError: (err) => errors.push(err),
                    onWarn: (err) => warnings.push(err),
                    expressionPlugins: ['typescript'],
                };
                for (const plugin of this.plugins) {
                    if (plugin.resolveTemplateCompilerOptions) {
                        options = plugin.resolveTemplateCompilerOptions(options);
                    }
                }
                for (const plugin of this.plugins) {
                    let result;
                    try {
                        result = (_e = plugin.compileSFCTemplate) === null || _e === void 0 ? void 0 : _e.call(plugin, this.sfc.template.lang, this.sfc.template.content, options);
                    }
                    catch (e) {
                        const err = e;
                        errors.push(err);
                    }
                    if (result || errors.length) {
                        if (result && !errors.length && !warnings.length) {
                            this.compiledSFCTemplateCache = {
                                template: this.sfc.template.content,
                                snapshot: this.snapshot,
                                result: result,
                                plugin,
                            };
                        }
                        else {
                            this.compiledSFCTemplateCache = undefined;
                        }
                        return {
                            errors,
                            warnings,
                            ast: result === null || result === void 0 ? void 0 : result.ast,
                        };
                    }
                }
            }
        });
        this._pluginEmbeddedFiles = this.plugins.map((plugin) => {
            const embeddedFiles = {};
            const files = (0, reactivity_1.computed)(() => {
                if (plugin.getEmbeddedFileNames) {
                    const embeddedFileNames = plugin.getEmbeddedFileNames(this.fileName, this.sfc);
                    for (const oldFileName of Object.keys(embeddedFiles)) {
                        if (!embeddedFileNames.includes(oldFileName)) {
                            delete embeddedFiles[oldFileName];
                        }
                    }
                    for (const embeddedFileName of embeddedFileNames) {
                        if (!embeddedFiles[embeddedFileName]) {
                            embeddedFiles[embeddedFileName] = (0, reactivity_1.computed)(() => {
                                const file = new VueEmbeddedFile(embeddedFileName);
                                for (const plugin of this.plugins) {
                                    if (plugin.resolveEmbeddedFile) {
                                        plugin.resolveEmbeddedFile(this.fileName, this.sfc, file);
                                    }
                                }
                                return file;
                            });
                        }
                    }
                }
                return Object.values(embeddedFiles);
            });
            return (0, reactivity_1.computed)(() => {
                return files.value.map(_file => {
                    const file = _file.value;
                    const mappings = [...(0, source_map_1.buildMappings)(file.content), ...file.extraMappings];
                    for (const mapping of mappings) {
                        if (mapping.source !== undefined) {
                            const block = this._sfcBlocks.value[mapping.source];
                            if (block) {
                                mapping.sourceRange = [
                                    mapping.sourceRange[0] + block.startTagEnd,
                                    mapping.sourceRange[1] + block.startTagEnd,
                                ];
                                mapping.source = undefined;
                            }
                        }
                    }
                    return {
                        file,
                        snapshot: this.ts.ScriptSnapshot.fromString((0, source_map_1.toString)(file.content)),
                        mappings,
                    };
                });
            });
        });
        this._allEmbeddedFiles = (0, reactivity_1.computed)(() => {
            const all = [];
            for (const embeddedFiles of this._pluginEmbeddedFiles) {
                for (const embedded of embeddedFiles.value) {
                    all.push(embedded);
                }
            }
            return all;
        });
        this._embeddedFiles = (0, reactivity_1.computed)(() => {
            const embeddedFiles = [];
            let remain = [...this._allEmbeddedFiles.value];
            while (remain.length) {
                const beforeLength = remain.length;
                consumeRemain();
                if (beforeLength === remain.length) {
                    break;
                }
            }
            for (const { file, snapshot, mappings } of remain) {
                embeddedFiles.push(Object.assign(Object.assign({}, file), { snapshot,
                    mappings, embeddedFiles: [] }));
                console.error('Unable to resolve embedded: ' + file.parentFileName + ' -> ' + file.fileName);
            }
            return embeddedFiles;
            function consumeRemain() {
                for (let i = remain.length - 1; i >= 0; i--) {
                    const { file, snapshot, mappings } = remain[i];
                    if (!file.parentFileName) {
                        embeddedFiles.push(Object.assign(Object.assign({}, file), { snapshot,
                            mappings, embeddedFiles: [] }));
                        remain.splice(i, 1);
                    }
                    else {
                        const parent = findParentStructure(file.parentFileName, embeddedFiles);
                        if (parent) {
                            parent.embeddedFiles.push(Object.assign(Object.assign({}, file), { snapshot,
                                mappings, embeddedFiles: [] }));
                            remain.splice(i, 1);
                        }
                    }
                }
            }
            function findParentStructure(fileName, current) {
                for (const child of current) {
                    if (child.fileName === fileName) {
                        return child;
                    }
                    let parent = findParentStructure(fileName, child.embeddedFiles);
                    if (parent) {
                        return parent;
                    }
                }
            }
        });
        this.update(snapshot);
    }
    update(newScriptSnapshot) {
        this.snapshot = newScriptSnapshot;
        this.mappings = [{
                sourceRange: [0, this.snapshot.getLength()],
                generatedRange: [0, this.snapshot.getLength()],
                data: {
                    hover: true,
                    references: true,
                    definition: true,
                    rename: true,
                    completion: true,
                    diagnostic: true,
                    semanticTokens: true,
                },
            }];
        const parsedSfc = this.parseSfc();
        if (parsedSfc) {
            this.updateTemplate(parsedSfc.descriptor.template);
            this.updateScript(parsedSfc.descriptor.script);
            this.updateScriptSetup(parsedSfc.descriptor.scriptSetup);
            this.updateStyles(parsedSfc.descriptor.styles);
            this.updateCustomBlocks(parsedSfc.descriptor.customBlocks);
        }
        else {
            this.updateTemplate(null);
            this.updateScript(null);
            this.updateScriptSetup(null);
            this.updateStyles([]);
            this.updateCustomBlocks([]);
        }
    }
    parseSfc() {
        var _a, _b;
        // incremental update
        if ((_a = this.parsedSfcCache) === null || _a === void 0 ? void 0 : _a.plugin.updateSFC) {
            const change = this.snapshot.getChangeRange(this.parsedSfcCache.snapshot);
            if (change) {
                const newSfc = this.parsedSfcCache.plugin.updateSFC(this.parsedSfcCache.sfc, {
                    start: change.span.start,
                    end: change.span.start + change.span.length,
                    newText: this.snapshot.getText(change.span.start, change.span.start + change.newLength),
                });
                if (newSfc) {
                    this.parsedSfcCache.snapshot = this.snapshot;
                    this.parsedSfcCache.sfc = newSfc;
                    return newSfc;
                }
            }
        }
        for (const plugin of this.plugins) {
            const sfc = (_b = plugin.parseSFC) === null || _b === void 0 ? void 0 : _b.call(plugin, this.fileName, this.snapshot.getText(0, this.snapshot.getLength()));
            if (sfc) {
                if (!sfc.errors.length) {
                    this.parsedSfcCache = {
                        snapshot: this.snapshot,
                        sfc,
                        plugin,
                    };
                }
                return sfc;
            }
        }
    }
    updateTemplate(block) {
        var _a;
        const newData = block ? {
            name: 'template',
            start: this.snapshot.getText(0, block.loc.start.offset).lastIndexOf('<'),
            end: block.loc.end.offset + this.snapshot.getText(block.loc.end.offset, this.snapshot.getLength()).indexOf('>') + 1,
            startTagEnd: block.loc.start.offset,
            endTagStart: block.loc.end.offset,
            content: block.content,
            lang: (_a = block.lang) !== null && _a !== void 0 ? _a : 'html',
        } : null;
        if (this.sfc.template && newData) {
            this.updateBlock(this.sfc.template, newData);
        }
        else {
            this.sfc.template = newData;
        }
    }
    updateScript(block) {
        var _a;
        const newData = block ? {
            name: 'script',
            start: this.snapshot.getText(0, block.loc.start.offset).lastIndexOf('<'),
            end: block.loc.end.offset + this.snapshot.getText(block.loc.end.offset, this.snapshot.getLength()).indexOf('>') + 1,
            startTagEnd: block.loc.start.offset,
            endTagStart: block.loc.end.offset,
            content: block.content,
            lang: (_a = block.lang) !== null && _a !== void 0 ? _a : 'js',
            src: block.src,
        } : null;
        if (this.sfc.script && newData) {
            this.updateBlock(this.sfc.script, newData);
        }
        else {
            this.sfc.script = newData;
        }
    }
    updateScriptSetup(block) {
        var _a;
        const newData = block ? {
            name: 'scriptSetup',
            start: this.snapshot.getText(0, block.loc.start.offset).lastIndexOf('<'),
            end: block.loc.end.offset + this.snapshot.getText(block.loc.end.offset, this.snapshot.getLength()).indexOf('>') + 1,
            startTagEnd: block.loc.start.offset,
            endTagStart: block.loc.end.offset,
            content: block.content,
            lang: (_a = block.lang) !== null && _a !== void 0 ? _a : 'js',
            generic: typeof block.attrs.generic === 'string' ? block.attrs.generic : undefined,
            genericOffset: typeof block.attrs.generic === 'string' ? this.snapshot.getText(0, block.loc.start.offset).lastIndexOf(block.attrs.generic) - block.loc.start.offset : -1,
        } : null;
        if (this.sfc.scriptSetup && newData) {
            this.updateBlock(this.sfc.scriptSetup, newData);
        }
        else {
            this.sfc.scriptSetup = newData;
        }
    }
    updateStyles(blocks) {
        var _a;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const newData = {
                name: 'style_' + i,
                start: this.snapshot.getText(0, block.loc.start.offset).lastIndexOf('<'),
                end: block.loc.end.offset + this.snapshot.getText(block.loc.end.offset, this.snapshot.getLength()).indexOf('>') + 1,
                startTagEnd: block.loc.start.offset,
                endTagStart: block.loc.end.offset,
                content: block.content,
                lang: (_a = block.lang) !== null && _a !== void 0 ? _a : 'css',
                module: typeof block.module === 'string' ? block.module : block.module ? '$style' : undefined,
                scoped: !!block.scoped,
            };
            if (this.sfc.styles.length > i) {
                this.updateBlock(this.sfc.styles[i], newData);
            }
            else {
                this.sfc.styles.push(newData);
            }
        }
        while (this.sfc.styles.length > blocks.length) {
            this.sfc.styles.pop();
        }
    }
    updateCustomBlocks(blocks) {
        var _a;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const newData = {
                name: 'customBlock_' + i,
                start: this.snapshot.getText(0, block.loc.start.offset).lastIndexOf('<'),
                end: block.loc.end.offset + this.snapshot.getText(block.loc.end.offset, this.snapshot.getLength()).indexOf('>') + 1,
                startTagEnd: block.loc.start.offset,
                endTagStart: block.loc.end.offset,
                content: block.content,
                lang: (_a = block.lang) !== null && _a !== void 0 ? _a : 'txt',
                type: block.type,
            };
            if (this.sfc.customBlocks.length > i) {
                this.updateBlock(this.sfc.customBlocks[i], newData);
            }
            else {
                this.sfc.customBlocks.push(newData);
            }
        }
        while (this.sfc.customBlocks.length > blocks.length) {
            this.sfc.customBlocks.pop();
        }
    }
    updateBlock(oldBlock, newBlock) {
        for (let key in newBlock) {
            oldBlock[key] = newBlock[key];
        }
    }
}
exports.VueFile = VueFile;
//# sourceMappingURL=sourceFile.js.map
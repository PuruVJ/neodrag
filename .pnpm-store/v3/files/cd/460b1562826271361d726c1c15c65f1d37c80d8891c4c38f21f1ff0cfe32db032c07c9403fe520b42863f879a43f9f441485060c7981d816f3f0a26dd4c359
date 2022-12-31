Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUseScriptSetupRanges = exports.parseUnuseScriptSetupRanges = void 0;
const scriptSetupRanges_1 = require("./scriptSetupRanges");
;
function parseUnuseScriptSetupRanges(ts, ast) {
    const imports = [];
    const bindings = (0, scriptSetupRanges_1.parseBindingRanges)(ts, ast, false);
    let defineProps;
    let defineEmits;
    let useSlots;
    let useAttrs;
    const definePropsTypeArgsMap = new Map();
    ast.forEachChild(node => {
        visitNode(node, ast, undefined);
    });
    if (defineProps && 'typeArgs' in defineProps && defineProps.typeArgs.length) {
        ast.forEachChild(node => {
            visitNode_withDefaults(node);
        });
    }
    return {
        imports,
        defineProps,
        defineEmits,
        useSlots,
        useAttrs,
        bindings,
    };
    function _getStartEnd(node) {
        return (0, scriptSetupRanges_1.getStartEnd)(node, ast);
    }
    function visitNode(node, parent, parentParent) {
        var _a;
        if (ts.isImportDeclaration(node)) {
            imports.push(_getStartEnd(node));
        }
        else if (ts.isCallExpression(node)
            && ts.isIdentifier(node.expression)) {
            const callText = node.expression.getText(ast);
            const declaration = ts.isVariableDeclaration(parent) ? parent : undefined;
            const fullNode = declaration ? (parentParent !== null && parentParent !== void 0 ? parentParent : node) : node;
            const binding = declaration ? _getStartEnd(declaration.name) : undefined;
            const typeArg = ((_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a.length) && ts.isTypeLiteralNode(node.typeArguments[0]) ? node.typeArguments[0] : undefined;
            if (callText === 'defineProps' && node.arguments.length) {
                defineProps = {
                    range: _getStartEnd(fullNode),
                    binding,
                    args: _getStartEnd(node.arguments[0]),
                };
            }
            if (callText === 'defineEmits' && node.arguments.length) {
                defineEmits = {
                    range: _getStartEnd(fullNode),
                    binding,
                    args: _getStartEnd(node.arguments[0]),
                };
            }
            if (callText === 'useSlots') {
                useSlots = {
                    range: _getStartEnd(fullNode),
                    binding,
                };
            }
            if (callText === 'useAttrs') {
                useAttrs = {
                    range: _getStartEnd(fullNode),
                    binding,
                };
            }
            if (callText === 'defineProps' && typeArg) {
                defineProps = {
                    range: _getStartEnd(fullNode),
                    binding,
                    typeArgs: [],
                };
                for (const member of typeArg.members) {
                    if (ts.isPropertySignature(member) && member.type) {
                        const propName = _getStartEnd(member.name);
                        const propType = _getStartEnd(member.type);
                        defineProps.typeArgs.push({
                            name: propName,
                            type: propType,
                            required: !member.questionToken,
                            default: undefined,
                        });
                        definePropsTypeArgsMap.set(member.name.getText(ast), defineProps.typeArgs[defineProps.typeArgs.length - 1]);
                    }
                }
            }
            if (callText === 'defineEmits' && typeArg) {
                defineEmits = {
                    range: _getStartEnd(fullNode),
                    binding,
                    typeArgs: [],
                };
                for (const member of typeArg.members) {
                    if (ts.isCallSignatureDeclaration(member) && member.parameters.length) {
                        const emitName = member.parameters[0].type;
                        if (emitName) {
                            let restArgs;
                            if (member.parameters.length >= 2) {
                                const firstParam = member.parameters[1];
                                const lastParam = member.parameters[member.parameters.length - 1];
                                restArgs = {
                                    start: firstParam.getStart(ast),
                                    end: lastParam.getEnd(),
                                };
                            }
                            defineEmits.typeArgs.push({
                                name: _getStartEnd(emitName),
                                restArgs,
                            });
                        }
                    }
                }
            }
        }
        node.forEachChild(child => visitNode(child, node, parent));
    }
    function visitNode_withDefaults(node) {
        if (ts.isCallExpression(node)
            && ts.isIdentifier(node.expression)
            && node.expression.getText(ast) === 'withDefaults') {
            if (node.arguments.length >= 2) {
                const defaults = node.arguments[1];
                if (ts.isObjectLiteralExpression(defaults)) {
                    for (const defaultProp of defaults.properties) {
                        if (defaultProp.name) {
                            const initializer = ts.isPropertyAssignment(defaultProp) ? defaultProp.initializer : defaultProp.name;
                            const defaultPropName = defaultProp.name.getText(ast);
                            const typeProp = definePropsTypeArgsMap.get(defaultPropName);
                            if (typeProp) {
                                typeProp.default = _getStartEnd(initializer);
                            }
                        }
                    }
                }
            }
        }
        node.forEachChild(child => visitNode_withDefaults(child));
    }
}
exports.parseUnuseScriptSetupRanges = parseUnuseScriptSetupRanges;
function parseUseScriptSetupRanges(ts, ast) {
    const imports = [];
    let exportDefault;
    let propsOption;
    let emitsOption;
    let setupOption;
    const otherOptions = [];
    const otherScriptStatements = [];
    ast.forEachChild(node => {
        var _a, _b;
        if (ts.isImportDeclaration(node)) {
            imports.push(_getStartEnd(node));
        }
        else if (ts.isExportAssignment(node)) {
            let options;
            if (ts.isObjectLiteralExpression(node.expression)) {
                options = node.expression;
            }
            else if (ts.isCallExpression(node.expression) && node.expression.arguments.length) {
                const arg0 = node.expression.arguments[0];
                if (ts.isObjectLiteralExpression(arg0)) {
                    options = arg0;
                }
            }
            exportDefault = _getStartEnd(node);
            if (options) {
                for (const option of options.properties) {
                    const optionName = (_a = option.name) === null || _a === void 0 ? void 0 : _a.getText(ast);
                    let setupFunction;
                    if (optionName === 'props' && ts.isPropertyAssignment(option)) {
                        propsOption = _getStartEnd(option.initializer);
                    }
                    else if (optionName === 'emits' && ts.isPropertyAssignment(option)) {
                        emitsOption = _getStartEnd(option.initializer);
                    }
                    else if (optionName === 'setup' && ts.isPropertyAssignment(option) && ts.isArrowFunction(option.initializer)) {
                        setupFunction = option.initializer;
                    }
                    else if (optionName === 'setup' && ts.isMethodDeclaration(option)) {
                        setupFunction = option;
                    }
                    else if (optionName === 'components') {
                        // ignore
                    }
                    else {
                        otherOptions.push(_getStartEnd(option));
                    }
                    if (setupFunction === null || setupFunction === void 0 ? void 0 : setupFunction.body) {
                        setupOption = {
                            props: undefined,
                            context: undefined,
                            body: _getStartEnd(setupFunction.body),
                            bodyReturn: undefined,
                        };
                        if (setupFunction.parameters.length >= 1) {
                            setupOption.props = _getStartEnd(setupFunction.parameters[0].name);
                        }
                        if (setupFunction.parameters.length >= 2) {
                            const context = setupFunction.parameters[1];
                            if (ts.isObjectBindingPattern(context.name)) {
                                setupOption.context = {
                                    emit: undefined,
                                    slots: undefined,
                                    attrs: undefined,
                                };
                                for (const element of context.name.elements) {
                                    const elementName = ((_b = element.propertyName) !== null && _b !== void 0 ? _b : element.name).getText(ast);
                                    if (elementName === 'emit') {
                                        setupOption.context.emit = _getStartEnd(element.name);
                                    }
                                    else if (elementName === 'slots') {
                                        setupOption.context.slots = _getStartEnd(element.name);
                                    }
                                    else if (elementName === 'attrs') {
                                        setupOption.context.attrs = _getStartEnd(element.name);
                                    }
                                }
                            }
                            else {
                                setupOption.context = _getStartEnd(context.name);
                            }
                        }
                        setupFunction.body.forEachChild(statement => {
                            if (ts.isReturnStatement(statement)) {
                                setupOption.bodyReturn = _getStartEnd(statement);
                            }
                        });
                    }
                }
            }
        }
        else {
            otherScriptStatements.push(_getStartEnd(node));
        }
    });
    return {
        imports,
        exportDefault,
        propsOption,
        emitsOption,
        setupOption,
        otherOptions,
        otherScriptStatements,
    };
    function _getStartEnd(node) {
        return (0, scriptSetupRanges_1.getStartEnd)(node, ast);
    }
}
exports.parseUseScriptSetupRanges = parseUseScriptSetupRanges;
//# sourceMappingURL=scriptSetupConvertRanges.js.map
'use strict';

var t = require('@babel/types');
var generator = require('@babel/generator');
var helperModuleImports = require('@babel/helper-module-imports');
var crypto = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var t__namespace = /*#__PURE__*/_interopNamespace(t);
var generator__default = /*#__PURE__*/_interopDefaultLegacy(generator);
var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

function isComponentishName(name) {
    return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z';
}
function getSolidRefreshIdentifier(hooks, path, name) {
    const current = hooks.get(name);
    if (current) {
        return current;
    }
    const newID = helperModuleImports.addNamed(path, name, 'solid-refresh');
    hooks.set(name, newID);
    return newID;
}
function isESMHMR(bundler) {
    // The currently known ESM HMR implementations
    // esm - the original ESM HMR Spec
    // vite - Vite's implementation
    return bundler === 'esm' || bundler === 'vite';
}
function getHotIdentifier(bundler) {
    if (isESMHMR(bundler)) {
        return t__namespace.memberExpression(t__namespace.memberExpression(t__namespace.identifier('import'), t__namespace.identifier('meta')), t__namespace.identifier('hot'));
    }
    if (bundler === 'webpack5') {
        return t__namespace.memberExpression(t__namespace.memberExpression(t__namespace.identifier('import'), t__namespace.identifier('meta')), t__namespace.identifier('webpackHot'));
    }
    return t__namespace.memberExpression(t__namespace.identifier("module"), t__namespace.identifier("hot"));
}
function getStatementPath(path) {
    if (t__namespace.isStatement(path.node)) {
        return path;
    }
    if (path.parentPath) {
        return getStatementPath(path.parentPath);
    }
    return null;
}
function createHotMap(hooks, path, name) {
    const current = hooks.get(name);
    if (current) {
        return current;
    }
    const newID = t__namespace.identifier(name);
    path.insertBefore(t__namespace.exportNamedDeclaration(t__namespace.variableDeclaration('const', [t__namespace.variableDeclarator(newID, t__namespace.objectExpression([]))])));
    hooks.set(name, newID);
    return newID;
}
function createSignatureValue(node) {
    const code = generator__default["default"](node);
    const result = crypto__default["default"].createHash('sha256').update(code.code).digest('base64');
    return result;
}
function isForeignBinding(source, current, name) {
    if (source === current) {
        return true;
    }
    if (current.scope.hasOwnBinding(name)) {
        return false;
    }
    if (current.parentPath) {
        return isForeignBinding(source, current.parentPath, name);
    }
    return true;
}
function createHotSignature(component, sign, deps) {
    if (sign && deps) {
        return t__namespace.objectExpression([
            t__namespace.objectProperty(t__namespace.identifier('component'), component),
            t__namespace.objectProperty(t__namespace.identifier('id'), t__namespace.stringLiteral(component.name)),
            t__namespace.objectProperty(t__namespace.identifier('signature'), sign),
            t__namespace.objectProperty(t__namespace.identifier('dependencies'), t__namespace.arrayExpression(deps)),
        ]);
    }
    return t__namespace.objectExpression([
        t__namespace.objectProperty(t__namespace.identifier('component'), component),
        t__namespace.objectProperty(t__namespace.identifier('id'), t__namespace.stringLiteral(component.name)),
    ]);
}
function getBindings(path) {
    const identifiers = new Set();
    path.traverse({
        Expression(p) {
            if (t__namespace.isIdentifier(p.node)
                && !t__namespace.isTypeScript(p.parentPath.node)
                && isForeignBinding(path, p, p.node.name)) {
                identifiers.add(p.node.name);
            }
            if (t__namespace.isJSXElement(p.node)
                && t__namespace.isJSXMemberExpression(p.node.openingElement.name)) {
                let base = p.node.openingElement.name;
                while (t__namespace.isJSXMemberExpression(base)) {
                    base = base.object;
                }
                if (isForeignBinding(path, p, base.name)) {
                    identifiers.add(base.name);
                }
            }
        }
    });
    return [...identifiers].map((value) => t__namespace.identifier(value));
}
function createStandardHot(path, state, HotComponent, rename) {
    const HotImport = getSolidRefreshIdentifier(state.hooks, path, 'standard');
    const pathToHot = getHotIdentifier(state.opts.bundler);
    const statementPath = getStatementPath(path);
    if (statementPath) {
        statementPath.insertBefore(rename);
    }
    return t__namespace.callExpression(HotImport, [
        createHotSignature(HotComponent, state.granular.value ? t__namespace.stringLiteral(createSignatureValue(rename)) : undefined, state.granular.value ? getBindings(path) : undefined),
        pathToHot,
    ]);
}
function createESMHot(path, state, HotComponent, rename) {
    const HotImport = getSolidRefreshIdentifier(state.hooks, path, 'esm');
    const pathToHot = getHotIdentifier(state.opts.bundler);
    const handlerId = path.scope.generateUidIdentifier("handler");
    const componentId = path.scope.generateUidIdentifier("Component");
    const statementPath = getStatementPath(path);
    if (statementPath) {
        const registrationMap = createHotMap(state.hooks, statementPath, '$$registrations');
        statementPath.insertBefore(rename);
        statementPath.insertBefore(t__namespace.expressionStatement(t__namespace.assignmentExpression('=', t__namespace.memberExpression(registrationMap, HotComponent), createHotSignature(HotComponent, state.granular.value
            ? t__namespace.stringLiteral(createSignatureValue(rename))
            : undefined, state.granular.value
            ? getBindings(path)
            : undefined))));
        statementPath.insertBefore(t__namespace.variableDeclaration("const", [
            t__namespace.variableDeclarator(t__namespace.objectPattern([
                t__namespace.objectProperty(t__namespace.identifier('handler'), handlerId, false, true),
                t__namespace.objectProperty(t__namespace.identifier('Component'), componentId, false, true)
            ]), t__namespace.callExpression(HotImport, [
                t__namespace.memberExpression(registrationMap, HotComponent),
                t__namespace.unaryExpression("!", t__namespace.unaryExpression("!", pathToHot)),
            ]))
        ]));
        const mod = path.scope.generateUidIdentifier('mod');
        statementPath.insertBefore(t__namespace.ifStatement(pathToHot, t__namespace.expressionStatement(t__namespace.callExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier("accept")), [
            t__namespace.arrowFunctionExpression([mod], t__namespace.blockStatement([
                t__namespace.expressionStatement(t__namespace.logicalExpression('&&', t__namespace.callExpression(handlerId, [
                    // Vite interprets this differently
                    state.opts.bundler === 'esm'
                        ? t__namespace.memberExpression(mod, t__namespace.identifier('module'))
                        : mod
                ]), t__namespace.callExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier("invalidate")), []))),
            ]))
        ]))));
    }
    return componentId;
}
function createHot(path, state, name, expression) {
    const HotComponent = name
        ? path.scope.generateUidIdentifier(`Hot$$${name.name}`)
        : path.scope.generateUidIdentifier('HotComponent');
    const rename = t__namespace.variableDeclaration("const", [
        t__namespace.variableDeclarator(HotComponent, expression),
    ]);
    if (isESMHMR(state.opts.bundler)) {
        return createESMHot(path, state, HotComponent, rename);
    }
    return createStandardHot(path, state, HotComponent, rename);
}
const SOURCE_MODULE = 'solid-js/web';
function isValidSpecifier(specifier, keyword) {
    return ((t__namespace.isIdentifier(specifier.imported) && specifier.imported.name === keyword)
        || (t__namespace.isStringLiteral(specifier.imported) && specifier.imported.value === keyword));
}
function captureValidIdentifiers(path) {
    const validIdentifiers = new Set();
    path.traverse({
        ImportDeclaration(p) {
            if (p.node.source.value === SOURCE_MODULE) {
                for (let i = 0, len = p.node.specifiers.length; i < len; i += 1) {
                    const specifier = p.node.specifiers[i];
                    if (t__namespace.isImportSpecifier(specifier)
                        && (isValidSpecifier(specifier, 'render')
                            || isValidSpecifier(specifier, 'hydrate'))) {
                        validIdentifiers.add(specifier.local);
                    }
                }
            }
        }
    });
    return validIdentifiers;
}
function captureValidNamespaces(path) {
    const validNamespaces = new Set();
    path.traverse({
        ImportDeclaration(p) {
            if (p.node.source.value === SOURCE_MODULE) {
                for (let i = 0, len = p.node.specifiers.length; i < len; i += 1) {
                    const specifier = p.node.specifiers[i];
                    if (t__namespace.isImportNamespaceSpecifier(specifier)) {
                        validNamespaces.add(specifier.local);
                    }
                }
            }
        }
    });
    return validNamespaces;
}
function isValidCallee(path, { callee }, validIdentifiers, validNamespaces) {
    if (t__namespace.isIdentifier(callee)) {
        const binding = path.scope.getBinding(callee.name);
        return binding && validIdentifiers.has(binding.identifier);
    }
    if (t__namespace.isMemberExpression(callee)
        && !callee.computed
        && t__namespace.isIdentifier(callee.object)
        && t__namespace.isIdentifier(callee.property)) {
        const binding = path.scope.getBinding(callee.object.name);
        return (binding
            && validNamespaces.has(binding.identifier)
            && (callee.property.name === 'render' || callee.property.name === 'hydrate'));
    }
    return false;
}
function checkValidRenderCall(path) {
    let currentPath = path.parentPath;
    while (currentPath) {
        if (t__namespace.isProgram(currentPath.node)) {
            return true;
        }
        if (!t__namespace.isStatement(currentPath.node)) {
            return false;
        }
        currentPath = currentPath.parentPath;
    }
    return false;
}
function fixRenderCalls(path, opts) {
    const validIdentifiers = captureValidIdentifiers(path);
    const validNamespaces = captureValidNamespaces(path);
    path.traverse({
        ExpressionStatement(p) {
            if (t__namespace.isCallExpression(p.node.expression)
                && checkValidRenderCall(p)
                && isValidCallee(p, p.node.expression, validIdentifiers, validNamespaces)) {
                // Replace with variable declaration
                const id = p.scope.generateUidIdentifier("cleanup");
                p.replaceWith(t__namespace.variableDeclaration('const', [
                    t__namespace.variableDeclarator(id, p.node.expression),
                ]));
                const pathToHot = getHotIdentifier(opts.bundler);
                p.insertAfter(t__namespace.ifStatement(pathToHot, t__namespace.expressionStatement(t__namespace.callExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier('dispose')), [id]))));
                p.skip();
            }
        },
    });
}
function getHMRDecline(opts, pathToHot) {
    if (isESMHMR(opts.bundler)) {
        return (t__namespace.ifStatement(pathToHot, t__namespace.expressionStatement(t__namespace.callExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier("decline")), []))));
    }
    if (opts.bundler === 'webpack5') {
        return (t__namespace.ifStatement(pathToHot, t__namespace.expressionStatement(t__namespace.callExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier("decline")), []))));
    }
    return (t__namespace.ifStatement(pathToHot, t__namespace.expressionStatement(t__namespace.conditionalExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier("decline")), t__namespace.callExpression(t__namespace.memberExpression(pathToHot, t__namespace.identifier("decline")), []), t__namespace.callExpression(t__namespace.memberExpression(t__namespace.memberExpression(t__namespace.identifier("window"), t__namespace.identifier("location")), t__namespace.identifier("reload")), [])))));
}
function solidRefreshPlugin() {
    return {
        name: 'Solid Refresh',
        pre() {
            this.hooks = new Map();
            this.processed = {
                value: false,
            };
            this.granular = {
                value: false,
            };
        },
        visitor: {
            Program(path, { file, opts, processed, granular }) {
                var _a;
                let shouldReload = false;
                const comments = file.ast.comments;
                if (comments) {
                    for (let i = 0; i < comments.length; i++) {
                        const comment = comments[i].value;
                        if (/^\s*@refresh granular\s*$/.test(comment)) {
                            granular.value = true;
                            return;
                        }
                        if (/^\s*@refresh skip\s*$/.test(comment)) {
                            processed.value = true;
                            return;
                        }
                        if (/^\s*@refresh reload\s*$/.test(comment)) {
                            processed.value = true;
                            shouldReload = true;
                            const pathToHot = getHotIdentifier(opts.bundler);
                            path.pushContainer('body', getHMRDecline(opts, pathToHot));
                            return;
                        }
                    }
                }
                if (!shouldReload && ((_a = opts.fixRender) !== null && _a !== void 0 ? _a : true)) {
                    fixRenderCalls(path, opts);
                }
            },
            ExportNamedDeclaration(path, state) {
                if (state.processed.value) {
                    return;
                }
                const decl = path.node.declaration;
                // Check if declaration is FunctionDeclaration
                if (t__namespace.isFunctionDeclaration(decl)
                    && !(decl.generator || decl.async)
                    // Might be component-like, but the only valid components
                    // have zero or one parameter
                    && decl.params.length < 2) {
                    // Check if the declaration has an identifier, and then check 
                    // if the name is component-ish
                    if (decl.id && isComponentishName(decl.id.name)) {
                        path.node.declaration = t__namespace.variableDeclaration('const', [
                            t__namespace.variableDeclarator(decl.id, createHot(path, state, decl.id, t__namespace.functionExpression(decl.id, decl.params, decl.body)))
                        ]);
                    }
                }
            },
            VariableDeclarator(path, state) {
                var _a, _b;
                if (state.processed.value) {
                    return;
                }
                const grandParentNode = (_b = (_a = path.parentPath) === null || _a === void 0 ? void 0 : _a.parentPath) === null || _b === void 0 ? void 0 : _b.node;
                // Check if the parent of the VariableDeclaration
                // is either a Program or an ExportNamedDeclaration
                if (t__namespace.isProgram(grandParentNode)
                    || t__namespace.isExportNamedDeclaration(grandParentNode)) {
                    const identifier = path.node.id;
                    const init = path.node.init;
                    if (t__namespace.isIdentifier(identifier)
                        && isComponentishName(identifier.name)
                        && (
                        // Check for valid FunctionExpression
                        (t__namespace.isFunctionExpression(init) && !(init.async || init.generator))
                            // Check for valid ArrowFunctionExpression
                            || (t__namespace.isArrowFunctionExpression(init) && !(init.async || init.generator)))
                        // Might be component-like, but the only valid components
                        // have zero or one parameter
                        && init.params.length < 2) {
                        path.node.init = createHot(path, state, identifier, init);
                    }
                }
            },
            FunctionDeclaration(path, state) {
                if (state.processed.value) {
                    return;
                }
                if (!(t__namespace.isProgram(path.parentPath.node)
                    || t__namespace.isExportDefaultDeclaration(path.parentPath.node))) {
                    return;
                }
                const decl = path.node;
                // Check if declaration is FunctionDeclaration
                if (!(decl.generator || decl.async)
                    // Might be component-like, but the only valid components
                    // have zero or one parameter
                    && decl.params.length < 2) {
                    // Check if the declaration has an identifier, and then check 
                    // if the name is component-ish
                    if (decl.id && isComponentishName(decl.id.name)) {
                        const replacement = createHot(path, state, decl.id, t__namespace.functionExpression(decl.id, decl.params, decl.body));
                        if (t__namespace.isExportDefaultDeclaration(path.parentPath.node)) {
                            path.replaceWith(replacement);
                        }
                        else {
                            path.replaceWith(t__namespace.variableDeclaration('var', [
                                t__namespace.variableDeclarator(decl.id, replacement),
                            ]));
                        }
                    }
                    else if (!decl.id
                        && decl.params.length === 1
                        && t__namespace.isIdentifier(decl.params[0])
                        && decl.params[0].name === 'props'
                        && t__namespace.isExportDefaultDeclaration(path.parentPath.node)) {
                        const replacement = createHot(path, state, undefined, t__namespace.functionExpression(null, decl.params, decl.body));
                        path.replaceWith(replacement);
                    }
                }
            }
        },
    };
}

module.exports = solidRefreshPlugin;

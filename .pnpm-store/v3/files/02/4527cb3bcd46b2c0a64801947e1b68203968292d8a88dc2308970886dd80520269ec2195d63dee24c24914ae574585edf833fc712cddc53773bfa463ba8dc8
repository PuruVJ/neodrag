const plugin = ({ modules }) => {
    return {
        version: 1,
        compileSFCTemplate(lang, template, options) {
            if (lang === 'html') {
                const compiler = modules['@vue/compiler-dom'];
                return compiler.compile(template, options);
            }
        },
        updateSFCTemplate(oldResult, change) {
            const CompilerDOM = modules['@vue/compiler-dom'];
            const lengthDiff = change.newText.length - (change.end - change.start);
            let hitNodes = [];
            if (tryUpdateNode(oldResult.ast) && hitNodes.length) {
                hitNodes = hitNodes.sort((a, b) => a.loc.source.length - b.loc.source.length);
                const hitNode = hitNodes[0];
                if (hitNode.type === 4 /* CompilerDOM.NodeTypes.SIMPLE_EXPRESSION */) {
                    return oldResult;
                }
            }
            function tryUpdateNode(node) {
                if (withinChangeRange(node.loc)) {
                    hitNodes.push(node);
                }
                if (tryUpdateNodeLoc(node.loc)) {
                    if (node.type === 0 /* CompilerDOM.NodeTypes.ROOT */) {
                        for (const child of node.children) {
                            if (!tryUpdateNode(child)) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === 1 /* CompilerDOM.NodeTypes.ELEMENT */) {
                        if (withinChangeRange(node.loc)) {
                            // if not self closing, should not hit tag name
                            const start = node.loc.start.offset + 2;
                            const end = node.loc.start.offset + node.loc.source.lastIndexOf('</');
                            if (!withinChangeRange({ start: { offset: start }, end: { offset: end }, source: '' })) {
                                return false;
                            }
                        }
                        for (const prop of node.props) {
                            if (!tryUpdateNode(prop)) {
                                return false;
                            }
                        }
                        for (const child of node.children) {
                            if (!tryUpdateNode(child)) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === 6 /* CompilerDOM.NodeTypes.ATTRIBUTE */) {
                        if (node.value && !tryUpdateNode(node.value)) {
                            return false;
                        }
                    }
                    else if (node.type === 7 /* CompilerDOM.NodeTypes.DIRECTIVE */) {
                        if (node.arg && withinChangeRange(node.arg.loc) && node.name === 'slot') {
                            return false;
                        }
                        if (node.arg && !tryUpdateNode(node.arg)) {
                            return false;
                        }
                        if (node.exp && !tryUpdateNode(node.exp)) {
                            return false;
                        }
                    }
                    else if (node.type === 12 /* CompilerDOM.NodeTypes.TEXT_CALL */) {
                        if (!tryUpdateNode(node.content)) {
                            return false;
                        }
                    }
                    else if (node.type === 8 /* CompilerDOM.NodeTypes.COMPOUND_EXPRESSION */) {
                        for (const childNode of node.children) {
                            if (typeof childNode === 'object') {
                                if (!tryUpdateNode(childNode)) {
                                    return false;
                                }
                            }
                        }
                    }
                    else if (node.type === 9 /* CompilerDOM.NodeTypes.IF */) {
                        for (const branche of node.branches) {
                            if (branche.condition && !tryUpdateNode(branche.condition)) {
                                return false;
                            }
                            for (const child of branche.children) {
                                if (!tryUpdateNode(child)) {
                                    return false;
                                }
                            }
                        }
                    }
                    else if (node.type === 11 /* CompilerDOM.NodeTypes.FOR */) {
                        for (const child of [
                            node.parseResult.source,
                            node.parseResult.value,
                            node.parseResult.key,
                            node.parseResult.index,
                        ]) {
                            if (child && !tryUpdateNode(child)) {
                                return false;
                            }
                        }
                        for (const child of node.children) {
                            if (!tryUpdateNode(child)) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === 5 /* CompilerDOM.NodeTypes.INTERPOLATION */) {
                        if (!tryUpdateNode(node.content)) {
                            return false;
                        }
                    }
                    else if (node.type === 4 /* CompilerDOM.NodeTypes.SIMPLE_EXPRESSION */) {
                        if (withinChangeRange(node.loc) && node.isStatic) { // TODO: review this (slot name?)
                            return false;
                        }
                        node.content = node.loc.source;
                    }
                    return true;
                }
                return false;
            }
            function tryUpdateNodeLoc(loc) {
                if (withinChangeRange(loc)) {
                    loc.source =
                        loc.source.substring(0, change.start - loc.start.offset)
                            + change.newText
                            + loc.source.substring(change.end - loc.start.offset);
                    loc.end.offset += lengthDiff;
                    return true;
                }
                else if (change.end <= loc.start.offset) {
                    loc.start.offset += lengthDiff;
                    loc.end.offset += lengthDiff;
                    return true;
                }
                else if (change.start >= loc.end.offset) {
                    return true; // no need update
                }
                return false;
            }
            function withinChangeRange(loc) {
                return change.start >= loc.start.offset && change.end <= loc.end.offset;
            }
        },
    };
};
module.exports = plugin;
//# sourceMappingURL=vue-template-html.js.map
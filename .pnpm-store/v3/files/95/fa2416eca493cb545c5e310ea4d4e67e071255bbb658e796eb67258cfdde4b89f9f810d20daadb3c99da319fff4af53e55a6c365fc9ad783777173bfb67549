"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visitor = exports.skipTDZChecks = void 0;
var _core = require("@babel/core");
function getTDZStatus(refPath, bindingPath) {
  const executionStatus = bindingPath._guessExecutionStatusRelativeTo(refPath);
  if (executionStatus === "before") {
    return "outside";
  } else if (executionStatus === "after") {
    return "inside";
  } else {
    return "maybe";
  }
}
const skipTDZChecks = new WeakSet();
exports.skipTDZChecks = skipTDZChecks;
function buildTDZAssert(status, node, state) {
  if (status === "maybe") {
    const clone = _core.types.cloneNode(node);
    skipTDZChecks.add(clone);
    return _core.types.callExpression(state.addHelper("temporalRef"), [
    clone, _core.types.stringLiteral(node.name)]);
  } else {
    return _core.types.callExpression(state.addHelper("tdz"), [_core.types.stringLiteral(node.name)]);
  }
}
function isReference(node, scope, state) {
  const declared = state.letReferences.get(node.name);
  if (!declared) return false;

  return scope.getBindingIdentifier(node.name) === declared;
}
function getTDZReplacement(path, state, id = path.node) {
  if (!isReference(id, path.scope, state)) return;
  if (skipTDZChecks.has(id)) return;
  skipTDZChecks.add(id);
  const bindingPath = path.scope.getBinding(id.name).path;
  if (bindingPath.isFunctionDeclaration()) return;
  const status = getTDZStatus(path, bindingPath);
  if (status === "outside") return;
  if (status === "maybe") {
    bindingPath.parent._tdzThis = true;
  }
  return {
    status,
    node: buildTDZAssert(status, id, state)
  };
}
const visitor = {
  ReferencedIdentifier(path, state) {
    if (!state.tdzEnabled) return;
    if (path.parentPath.isUpdateExpression()) return;
    if (path.parentPath.isFor({
      left: path.node
    })) return;
    const replacement = getTDZReplacement(path, state);
    if (!replacement) return;
    path.replaceWith(replacement.node);
  },
  UpdateExpression(path, state) {
    if (!state.tdzEnabled) return;
    const {
      node
    } = path;
    if (skipTDZChecks.has(node)) return;
    skipTDZChecks.add(node);
    const arg = path.get("argument");
    if (!arg.isIdentifier()) return;
    const replacement = getTDZReplacement(path, state, arg.node);
    if (!replacement) return;
    if (replacement.status === "maybe") {
      path.insertBefore(replacement.node);
    } else {
      path.replaceWith(replacement.node);
    }
  },
  AssignmentExpression(path, state) {
    if (!state.tdzEnabled) return;
    const {
      node
    } = path;
    if (skipTDZChecks.has(node)) return;
    skipTDZChecks.add(node);
    const nodes = [];
    const ids = path.getBindingIdentifiers();
    for (const name of Object.keys(ids)) {
      const replacement = getTDZReplacement(path, state, ids[name]);
      if (replacement) {
        nodes.push(_core.types.expressionStatement(replacement.node));
        if (replacement.status === "inside") break;
      }
    }
    if (nodes.length > 0) path.insertBefore(nodes);
  }
};
exports.visitor = visitor;

//# sourceMappingURL=tdz.js.map

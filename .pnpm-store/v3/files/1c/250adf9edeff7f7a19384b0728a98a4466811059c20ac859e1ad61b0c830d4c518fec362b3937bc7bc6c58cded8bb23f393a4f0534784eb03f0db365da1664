'use strict';

var SyntaxJSX = require('@babel/plugin-syntax-jsx');
var t = require('@babel/types');
var helperModuleImports = require('@babel/helper-module-imports');
var htmlEntities = require('html-entities');

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

var SyntaxJSX__default = /*#__PURE__*/_interopDefaultLegacy(SyntaxJSX);
var t__namespace = /*#__PURE__*/_interopNamespace(t);

const booleans = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected"
];

const BooleanAttributes = /*#__PURE__*/ new Set(booleans);

const Properties = /*#__PURE__*/ new Set([
  "className",
  "value",
  "readOnly",
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  ...booleans
]);

const ChildProperties = /*#__PURE__*/ new Set([
  "innerHTML",
  "textContent",
  "innerText",
  "children"
]);

// React Compat
const Aliases = /*#__PURE__*/ Object.assign(Object.create(null), {
  className: "class",
  htmlFor: "for"
});
const PropAliases = /*#__PURE__*/ Object.assign(Object.create(null), {
  class: "className",
  formnovalidate: "formNoValidate",
  ismap: "isMap",
  nomodule: "noModule",
  playsinline: "playsInline",
  readonly: "readOnly"
});

// list of Element events that will be delegated
const DelegatedEvents = /*#__PURE__*/ new Set([
  "beforeinput",
  "click",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
]);

const SVGElements = /*#__PURE__*/ new Set([
  // "a",
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animate",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "color-profile",
  "cursor",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignObject",
  "g",
  "glyph",
  "glyphRef",
  "hkern",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "missing-glyph",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  // "script",
  "set",
  "stop",
  // "style",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  // "title",
  "tref",
  "tspan",
  "use",
  "view",
  "vkern"
]);

const SVGNamespace = {
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace"
};

var VoidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];

const reservedNameSpaces = new Set([
  "class",
  "on",
  "oncapture",
  "style",
  "use",
  "prop",
  "attr"
]);

const nonSpreadNameSpaces = new Set([
  "class",
  "style",
  "use",
  "prop",
  "attr"
]);

function getConfig(path) {
  return path.hub.file.metadata.config;
}

const getRendererConfig = (path, renderer) => {
  const config = getConfig(path);
  return config?.renderers?.find(r => r.name === renderer) ?? config;
};

function registerImportMethod(path, name, moduleName) {
  const imports =
    path.scope.getProgramParent().data.imports ||
    (path.scope.getProgramParent().data.imports = new Map());
  moduleName = moduleName || getConfig(path).moduleName;
  if (!imports.has(`${moduleName}:${name}`)) {
    let id = helperModuleImports.addNamed(path, name, moduleName, {
      nameHint: `_$${name}`
    });
    imports.set(`${moduleName}:${name}`, id);
    return id;
  } else {
    let iden = imports.get(`${moduleName}:${name}`);
    // the cloning is required to play well with babel-preset-env which is
    // transpiling import as we add them and using the same identifier causes
    // problems with the multiple identifiers of the same thing
    return t__namespace.cloneDeep(iden);
  }
}

function jsxElementNameToString(node) {
  if (t__namespace.isJSXMemberExpression(node)) {
    return `${jsxElementNameToString(node.object)}.${node.property.name}`;
  }
  if (t__namespace.isJSXIdentifier(node) || t__namespace.isIdentifier(node)) {
    return node.name;
  }
  return `${node.namespace.name}:${node.name.name}`;
}

function getTagName(tag) {
  const jsxName = tag.openingElement.name;
  return jsxElementNameToString(jsxName);
}

function isComponent(tagName) {
  return (
    (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
    tagName.includes(".") ||
    /[^a-zA-Z]/.test(tagName[0])
  );
}

function isDynamic(path, { checkMember, checkTags, checkCallExpressions = true, native }) {
  const config = getConfig(path);
  if (config.generate === "ssr" && native) {
    checkMember = false;
    checkCallExpressions = false;
  }
  const expr = path.node;
  if (t__namespace.isFunction(expr)) return false;
  if (
    expr.leadingComments &&
    expr.leadingComments[0] &&
    expr.leadingComments[0].value.trim() === config.staticMarker
  ) {
    expr.leadingComments.shift();
    return false;
  }
  if (
    (checkCallExpressions && (t__namespace.isCallExpression(expr) || t__namespace.isOptionalCallExpression(expr))) ||
    (checkMember &&
      (t__namespace.isMemberExpression(expr) ||
        t__namespace.isOptionalMemberExpression(expr) ||
        t__namespace.isSpreadElement(expr) ||
        (t__namespace.isBinaryExpression(expr) && expr.operator === "in"))) ||
    (checkTags && (t__namespace.isJSXElement(expr) || t__namespace.isJSXFragment(expr)))
  )
    return true;

  let dynamic;
  path.traverse({
    Function(p) {
      if (t__namespace.isObjectMethod(p.node) && p.node.computed) {
        dynamic = isDynamic(p.get("key"), { checkMember, checkTags, checkCallExpressions, native });
      }
      p.skip();
    },
    CallExpression(p) {
      checkCallExpressions && (dynamic = true) && p.stop();
    },
    OptionalCallExpression(p) {
      checkCallExpressions && (dynamic = true) && p.stop();
    },
    MemberExpression(p) {
      checkMember && (dynamic = true) && p.stop();
    },
    OptionalMemberExpression(p) {
      checkMember && (dynamic = true) && p.stop();
    },
    SpreadElement(p) {
      checkMember && (dynamic = true) && p.stop();
    },
    BinaryExpression(p) {
      checkMember && p.node.operator === "in" && (dynamic = true) && p.stop();
    },
    JSXElement(p) {
      checkTags ? (dynamic = true) && p.stop() : p.skip();
    },
    JSXFragment(p) {
      checkTags ? (dynamic = true) && p.stop() : p.skip();
    }
  });
  return dynamic;
}

function getStaticExpression(path) {
  const node = path.node;
  let value, type;
  return (
    t__namespace.isJSXExpressionContainer(node) &&
    t__namespace.isJSXElement(path.parent) &&
    !isComponent(getTagName(path.parent)) &&
    !t__namespace.isSequenceExpression(node.expression) &&
    (value = path.get("expression").evaluate().value) !== undefined &&
    ((type = typeof value) === "string" || type === "number") &&
    value
  );
}

// remove unnecessary JSX Text nodes
function filterChildren(children) {
  return children.filter(
    ({ node: child }) =>
      !(t__namespace.isJSXExpressionContainer(child) && t__namespace.isJSXEmptyExpression(child.expression)) &&
      (!t__namespace.isJSXText(child) || !/^[\r\n]\s*$/.test(child.extra.raw))
  );
}

function checkLength(children) {
  let i = 0;
  children.forEach(path => {
    const child = path.node;
    !(t__namespace.isJSXExpressionContainer(child) && t__namespace.isJSXEmptyExpression(child.expression)) &&
      (!t__namespace.isJSXText(child) || !/^\s*$/.test(child.extra.raw) || /^ *$/.test(child.extra.raw)) &&
      i++;
  });
  return i > 1;
}

function trimWhitespace(text) {
  text = text.replace(/\r/g, "");
  if (/\n/g.test(text)) {
    text = text
      .split("\n")
      .map((t, i) => (i ? t.replace(/^\s*/g, "") : t))
      .filter(s => !/^\s*$/.test(s))
      .join(" ");
  }
  return text.replace(/\s+/g, " ");
}

function toEventName(name) {
  return name.slice(2).toLowerCase();
}

function toPropertyName(name) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}

function wrappedByText(list, startIndex) {
  let index = startIndex,
    wrapped;
  while (--index >= 0) {
    const node = list[index];
    if (!node) continue;
    if (node.text) {
      wrapped = true;
      break;
    }
    if (node.id) return false;
  }
  if (!wrapped) return false;
  index = startIndex;
  while (++index < list.length) {
    const node = list[index];
    if (!node) continue;
    if (node.text) return true;
    if (node.id) return false;
  }
  return false;
}

function transformCondition$1(path, inline, deep) {
  const config = getConfig(path);
  const expr = path.node;
  const memo = registerImportMethod(path, config.memoWrapper);
  let dTest, cond, id;
  if (
    t__namespace.isConditionalExpression(expr) &&
    (isDynamic(path.get("consequent"), {
      checkTags: true
    }) ||
      isDynamic(path.get("alternate"), { checkTags: true }))
  ) {
    dTest = isDynamic(path.get("test"), { checkMember: true });
    if (dTest) {
      cond = expr.test;
      if (!t__namespace.isBinaryExpression(cond))
        cond = t__namespace.unaryExpression("!", t__namespace.unaryExpression("!", cond, true), true);
      id = inline
        ? t__namespace.callExpression(memo, [t__namespace.arrowFunctionExpression([], cond)])
        : path.scope.generateUidIdentifier("_c$");
      expr.test = t__namespace.callExpression(id, []);
      if (t__namespace.isConditionalExpression(expr.consequent) || t__namespace.isLogicalExpression(expr.consequent)) {
        expr.consequent = transformCondition$1(path.get("consequent"), inline, true);
      }
      if (t__namespace.isConditionalExpression(expr.alternate) || t__namespace.isLogicalExpression(expr.alternate)) {
        expr.alternate = transformCondition$1(path.get("alternate"), inline, true);
      }
    }
  } else if (t__namespace.isLogicalExpression(expr)) {
    let nextPath = path;
    // handle top-level or, ie cond && <A/> || <B/>
    while (nextPath.node.operator !== "&&" && t__namespace.isLogicalExpression(nextPath.node.left)) {
      nextPath = nextPath.get("left");
    }
    nextPath.node.operator === "&&" &&
      isDynamic(nextPath.get("right"), { checkTags: true }) &&
      (dTest = isDynamic(nextPath.get("left"), {
        checkMember: true
      }));
    if (dTest) {
      cond = nextPath.node.left;
      if (!t__namespace.isBinaryExpression(cond))
        cond = t__namespace.unaryExpression("!", t__namespace.unaryExpression("!", cond, true), true);
      id = inline
        ? t__namespace.callExpression(memo, [t__namespace.arrowFunctionExpression([], cond)])
        : path.scope.generateUidIdentifier("_c$");
      nextPath.node.left = t__namespace.callExpression(id, []);
    }
  }
  if (dTest && !inline) {
    const statements = [
      t__namespace.variableDeclaration("const", [
        t__namespace.variableDeclarator(
          id,
          config.memoWrapper
            ? t__namespace.callExpression(memo, [t__namespace.arrowFunctionExpression([], cond)])
            : t__namespace.arrowFunctionExpression([], cond)
        )
      ]),
      t__namespace.arrowFunctionExpression([], expr)
    ];
    return deep
      ? t__namespace.callExpression(
          t__namespace.arrowFunctionExpression(
            [],
            t__namespace.blockStatement([statements[0], t__namespace.returnStatement(statements[1])])
          ),
          []
        )
      : statements;
  }
  return deep ? expr : t__namespace.arrowFunctionExpression([], expr);
}

function escapeBackticks(value) {
  return value.replace(/`/g, "\\`");
}

function escapeHTML(s, attr) {
  if (typeof s !== "string") return s;
  const delim = attr ? '"' : "<";
  const escDelim = attr ? "&quot;" : "&lt;";
  let iDelim = s.indexOf(delim);
  let iAmp = s.indexOf("&");

  if (iDelim < 0 && iAmp < 0) return s;

  let left = 0,
    out = "";

  while (iDelim >= 0 && iAmp >= 0) {
    if (iDelim < iAmp) {
      if (left < iDelim) out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } else {
      if (left < iAmp) out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  }

  if (iDelim >= 0) {
    do {
      if (left < iDelim) out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } while (iDelim >= 0);
  } else {
    while (iAmp >= 0) {
      if (left < iAmp) out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  }

  return left < s.length ? out + s.substring(left) : out;
}

function convertJSXIdentifier(node) {
  if (t__namespace.isJSXIdentifier(node)) {
    if (t__namespace.isValidIdentifier(node.name)) {
      node.type = "Identifier";
    } else {
      return t__namespace.stringLiteral(node.name);
    }
  } else if (t__namespace.isJSXMemberExpression(node)) {
    return t__namespace.memberExpression(
      convertJSXIdentifier(node.object),
      convertJSXIdentifier(node.property)
    );
  } else if (t__namespace.isJSXNamespacedName(node)) {
    return t__namespace.stringLiteral(`${node.namespace.name}:${node.name.name}`);
  }

  return node;
}

function canNativeSpread(key, { checkNameSpaces } = {}) {
  if (checkNameSpaces && key.includes(":") && nonSpreadNameSpaces.has(key.split(":")[0])) return false;
  // TODO: figure out how to detect definitely function ref
  if (key === "ref") return false;
  return true;
}

function transformElement$3(path, info) {
  let tagName = getTagName(path.node),
    config = getConfig(path),
    wrapSVG = info.topLevel && tagName != "svg" && SVGElements.has(tagName),
    voidTag = VoidElements.indexOf(tagName) > -1,
    isCustomElement = tagName.indexOf("-") > -1,
    results = {
      template: `<${tagName}`,
      decl: [],
      exprs: [],
      dynamics: [],
      postExprs: [],
      isSVG: wrapSVG,
      hasCustomElement: isCustomElement,
      tagName,
      renderer: "dom"
    };
  if (config.hydratable && (tagName === "html" || tagName === "head" || tagName === "body")) {
    results.skipTemplate = true;
    if (tagName === "head" && info.topLevel) {
      const createComponent = registerImportMethod(
        path,
        "createComponent",
        getRendererConfig(path, "dom").moduleName
      );
      const NoHydration = registerImportMethod(
        path,
        "NoHydration",
        getRendererConfig(path, "dom").moduleName
      );
      results.exprs.push(
        t__namespace.expressionStatement(
          t__namespace.callExpression(createComponent, [NoHydration, t__namespace.objectExpression([])])
        )
      );
      return results;
    }
  }
  if (wrapSVG) results.template = "<svg>" + results.template;
  if (!info.skipId) results.id = path.scope.generateUidIdentifier("el$");
  transformAttributes$2(path, results);
  if (config.contextToCustomElements && (tagName === "slot" || isCustomElement)) {
    contextToCustomElement(path, results);
  }
  results.template += ">";
  if (!voidTag) {
    transformChildren$2(path, results, config);
    results.template += `</${tagName}>`;
  }
  if (info.topLevel && config.hydratable && results.hasHydratableEvent) {
    let runHydrationEvents = registerImportMethod(
      path,
      "runHydrationEvents",
      getRendererConfig(path, "dom").moduleName
    );
    results.postExprs.push(t__namespace.expressionStatement(t__namespace.callExpression(runHydrationEvents, [])));
  }
  if (wrapSVG) results.template += "</svg>";
  return results;
}

function setAttr$2(path, elem, name, value, { isSVG, dynamic, prevId, isCE }) {
  // pull out namespace
  const config = getConfig(path);
  let parts, namespace;
  if ((parts = name.split(":")) && parts[1] && reservedNameSpaces.has(parts[0])) {
    name = parts[1];
    namespace = parts[0];
  }

  if (namespace === "style") {
    return t__namespace.callExpression(
      t__namespace.memberExpression(
        t__namespace.memberExpression(elem, t__namespace.identifier("style")),
        t__namespace.identifier("setProperty")
      ),
      [t__namespace.stringLiteral(name), value]
    );
  }

  if (namespace === "class") {
    return t__namespace.callExpression(
      t__namespace.memberExpression(
        t__namespace.memberExpression(elem, t__namespace.identifier("classList")),
        t__namespace.identifier("toggle")
      ),
      [t__namespace.stringLiteral(name), value]
    );
  }

  if (name === "style") {
    return t__namespace.callExpression(
      registerImportMethod(path, "style", getRendererConfig(path, "dom").moduleName),
      prevId ? [elem, value, prevId] : [elem, value]
    );
  }

  if (!isSVG && name === "class") {
    return t__namespace.callExpression(
      registerImportMethod(path, "className", getRendererConfig(path, "dom").moduleName),
      [elem, value]
    );
  }

  if (name === "classList") {
    return t__namespace.callExpression(
      registerImportMethod(path, "classList", getRendererConfig(path, "dom").moduleName),
      prevId ? [elem, value, prevId] : [elem, value]
    );
  }

  if (config.hydratable && name === "innerHTML") {
    return t__namespace.callExpression(registerImportMethod(path, "innerHTML"), [elem, value]);
  }

  if (dynamic && name === "textContent") {
    return t__namespace.assignmentExpression("=", t__namespace.memberExpression(elem, t__namespace.identifier("data")), value);
  }

  const isChildProp = ChildProperties.has(name);
  const isProp = Properties.has(name);
  const alias = PropAliases[name];
  if (namespace !== "attr" && (isChildProp || (!isSVG && isProp) || isCE || namespace === "prop")) {
    if (isCE && !isChildProp && !isProp && namespace !== "prop") name = toPropertyName(name);
    return t__namespace.assignmentExpression(
      "=",
      t__namespace.memberExpression(elem, t__namespace.identifier(alias || name)),
      value
    );
  }

  let isNameSpaced = name.indexOf(":") > -1;
  name = Aliases[name] || name;
  !isSVG && (name = name.toLowerCase());
  const ns = isNameSpaced && SVGNamespace[name.split(":")[0]];
  if (ns) {
    return t__namespace.callExpression(
      registerImportMethod(path, "setAttributeNS", getRendererConfig(path, "dom").moduleName),
      [elem, t__namespace.stringLiteral(ns), t__namespace.stringLiteral(name), value]
    );
  } else {
    return t__namespace.callExpression(
      registerImportMethod(path, "setAttribute", getRendererConfig(path, "dom").moduleName),
      [elem, t__namespace.stringLiteral(name), value]
    );
  }
}

function detectResolvableEventHandler(attribute, handler) {
  while (t__namespace.isIdentifier(handler)) {
    const lookup = attribute.scope.getBinding(handler.name);
    if (lookup) {
      if (t__namespace.isVariableDeclarator(lookup.path.node)) {
        handler = lookup.path.node.init;
      } else if (t__namespace.isFunctionDeclaration(lookup.path.node)) {
        return true;
      } else return false;
    } else return false;
  }
  return t__namespace.isFunction(handler);
}

function transformAttributes$2(path, results) {
  let elem = results.id,
    hasHydratableEvent = false,
    children,
    spreadExpr,
    attributes = path.get("openingElement").get("attributes");
  const tagName = getTagName(path.node),
    isSVG = SVGElements.has(tagName),
    isCE = tagName.includes("-"),
    hasChildren = path.node.children.length > 0,
    config = getConfig(path);

  // preprocess spreads
  if (attributes.some(attribute => t__namespace.isJSXSpreadAttribute(attribute.node))) {
    [attributes, spreadExpr] = processSpreads$1(path, attributes, {
      elem,
      isSVG,
      hasChildren,
      wrapConditionals: config.wrapConditionals
    });
    path.get("openingElement").set(
      "attributes",
      attributes.map(a => a.node)
    );
    //NOTE: can't be checked at compile time so add to compiled output
    hasHydratableEvent = true;
  }

  // preprocess styles
  const styleAttribute = path
    .get("openingElement")
    .get("attributes")
    .find(
      a =>
        a.node.name &&
        a.node.name.name === "style" &&
        t__namespace.isJSXExpressionContainer(a.node.value) &&
        t__namespace.isObjectExpression(a.node.value.expression) &&
        !a.node.value.expression.properties.some(p => t__namespace.isSpreadElement(p))
    );
  if (styleAttribute) {
    let i = 0,
      leading = styleAttribute.node.value.expression.leadingComments;
    styleAttribute.node.value.expression.properties.slice().forEach((p, index) => {
      if (!p.computed) {
        if (leading) p.value.leadingComments = leading;
        path
          .get("openingElement")
          .node.attributes.splice(
            styleAttribute.key + ++i,
            0,
            t__namespace.JSXAttribute(
              t__namespace.JSXNamespacedName(
                t__namespace.JSXIdentifier("style"),
                t__namespace.JSXIdentifier(t__namespace.isIdentifier(p.key) ? p.key.name : p.key.value)
              ),
              t__namespace.JSXExpressionContainer(p.value)
            )
          );
        styleAttribute.node.value.expression.properties.splice(index - i - 1, 1);
      }
    });
    if (!styleAttribute.node.value.expression.properties.length)
      path.get("openingElement").node.attributes.splice(styleAttribute.key, 1);
  }

  // preprocess classList
  attributes = path.get("openingElement").get("attributes");
  const classListAttribute = attributes.find(
    a =>
      a.node.name &&
      a.node.name.name === "classList" &&
      t__namespace.isJSXExpressionContainer(a.node.value) &&
      t__namespace.isObjectExpression(a.node.value.expression) &&
      !a.node.value.expression.properties.some(
        p =>
          t__namespace.isSpreadElement(p) ||
          p.computed ||
          (t__namespace.isStringLiteral(p.key) && (p.key.value.includes(" ") || p.key.value.includes(":")))
      )
  );
  if (classListAttribute) {
    let i = 0,
      leading = classListAttribute.node.value.expression.leadingComments,
      classListProperties = classListAttribute.get("value").get("expression").get("properties");
    classListProperties.slice().forEach((propPath, index) => {
      const p = propPath.node;
      const { confident, value: computed } = propPath.get("value").evaluate();
      if (leading) p.value.leadingComments = leading;
      if (!confident) {
        path
          .get("openingElement")
          .node.attributes.splice(
            classListAttribute.key + ++i,
            0,
            t__namespace.JSXAttribute(
              t__namespace.JSXNamespacedName(
                t__namespace.JSXIdentifier("class"),
                t__namespace.JSXIdentifier(t__namespace.isIdentifier(p.key) ? p.key.name : p.key.value)
              ),
              t__namespace.JSXExpressionContainer(p.value)
            )
          );
      } else if (computed) {
        path
          .get("openingElement")
          .node.attributes.splice(
            classListAttribute.key + ++i,
            0,
            t__namespace.JSXAttribute(
              t__namespace.JSXIdentifier("class"),
              t__namespace.stringLiteral(t__namespace.isIdentifier(p.key) ? p.key.name : p.key.value)
            )
          );
      }
      classListProperties.splice(index - i - 1, 1);
    });
    if (!classListProperties.length)
      path.get("openingElement").node.attributes.splice(classListAttribute.key, 1);
  }

  // combine class properties
  attributes = path.get("openingElement").get("attributes");
  const classAttributes = attributes.filter(
    a => a.node.name && (a.node.name.name === "class" || a.node.name.name === "className")
  );
  if (classAttributes.length > 1) {
    const first = classAttributes[0].node,
      values = [],
      quasis = [t__namespace.TemplateElement({ raw: "" })];
    for (let i = 0; i < classAttributes.length; i++) {
      const attr = classAttributes[i].node,
        isLast = i === classAttributes.length - 1;
      if (!t__namespace.isJSXExpressionContainer(attr.value)) {
        const prev = quasis.pop();
        quasis.push(
          t__namespace.TemplateElement({
            raw: (prev ? prev.value.raw : "") + `${attr.value.value}` + (isLast ? "" : " ")
          })
        );
      } else {
        values.push(t__namespace.logicalExpression("||", attr.value.expression, t__namespace.stringLiteral("")));
        quasis.push(t__namespace.TemplateElement({ raw: isLast ? "" : " " }));
      }
      i && attributes.splice(attributes.indexOf(classAttributes[i]), 1);
    }
    if (values.length) first.value = t__namespace.JSXExpressionContainer(t__namespace.TemplateLiteral(quasis, values));
    else first.value = t__namespace.stringLiteral(quasis[0].value.raw);
  }
  path.get("openingElement").set(
    "attributes",
    attributes.map(a => a.node)
  );

  path
    .get("openingElement")
    .get("attributes")
    .forEach(attribute => {
      const node = attribute.node;
      let value = node.value,
        key = t__namespace.isJSXNamespacedName(node.name)
          ? `${node.name.namespace.name}:${node.name.name.name}`
          : node.name.name,
        reservedNameSpace =
          t__namespace.isJSXNamespacedName(node.name) && reservedNameSpaces.has(node.name.namespace.name);
      if (t__namespace.isJSXExpressionContainer(value) && !key.startsWith("use:")) {
        const evaluated = attribute.get("value").get("expression").evaluate().value;
        let type;
        if (
          evaluated !== undefined &&
          ((type = typeof evaluated) === "string" || type === "number")
        ) {
          value = t__namespace.stringLiteral(String(evaluated));
        }
      }
      if (
        t__namespace.isJSXNamespacedName(node.name) &&
        reservedNameSpace &&
        !t__namespace.isJSXExpressionContainer(value)
      ) {
        node.value = value = t__namespace.JSXExpressionContainer(value || t__namespace.JSXEmptyExpression());
      }
      if (
        t__namespace.isJSXExpressionContainer(value) &&
        (reservedNameSpace ||
          !(t__namespace.isStringLiteral(value.expression) || t__namespace.isNumericLiteral(value.expression)))
      ) {
        if (key === "ref") {
          // Normalize expressions for non-null and type-as
          while (
            t__namespace.isTSNonNullExpression(value.expression) ||
            t__namespace.isTSAsExpression(value.expression)
          ) {
            value.expression = value.expression.expression;
          }
          let binding,
            isFunction =
              t__namespace.isIdentifier(value.expression) &&
              (binding = path.scope.getBinding(value.expression.name)) &&
              binding.kind === "const";
          if (!isFunction && t__namespace.isLVal(value.expression)) {
            const refIdentifier = path.scope.generateUidIdentifier("_ref$");
            results.exprs.unshift(
              t__namespace.variableDeclaration("const", [
                t__namespace.variableDeclarator(refIdentifier, value.expression)
              ]),
              t__namespace.expressionStatement(
                t__namespace.conditionalExpression(
                  t__namespace.binaryExpression(
                    "===",
                    t__namespace.unaryExpression("typeof", refIdentifier),
                    t__namespace.stringLiteral("function")
                  ),
                  t__namespace.callExpression(
                    registerImportMethod(path, "use", getRendererConfig(path, "dom").moduleName),
                    [refIdentifier, elem]
                  ),
                  t__namespace.assignmentExpression("=", value.expression, elem)
                )
              )
            );
          } else if (isFunction || t__namespace.isFunction(value.expression)) {
            results.exprs.unshift(
              t__namespace.expressionStatement(
                t__namespace.callExpression(
                  registerImportMethod(path, "use", getRendererConfig(path, "dom").moduleName),
                  [value.expression, elem]
                )
              )
            );
          } else if (t__namespace.isCallExpression(value.expression)) {
            const refIdentifier = path.scope.generateUidIdentifier("_ref$");
            results.exprs.unshift(
              t__namespace.variableDeclaration("const", [
                t__namespace.variableDeclarator(refIdentifier, value.expression)
              ]),
              t__namespace.expressionStatement(
                t__namespace.logicalExpression(
                  "&&",
                  t__namespace.binaryExpression(
                    "===",
                    t__namespace.unaryExpression("typeof", refIdentifier),
                    t__namespace.stringLiteral("function")
                  ),
                  t__namespace.callExpression(
                    registerImportMethod(path, "use", getRendererConfig(path, "dom").moduleName),
                    [refIdentifier, elem]
                  )
                )
              )
            );
          }
        } else if (key.startsWith("use:")) {
          // Some trick to treat JSXIdentifier as Identifier
          node.name.name.type = "Identifier";
          results.exprs.unshift(
            t__namespace.expressionStatement(
              t__namespace.callExpression(
                registerImportMethod(path, "use", getRendererConfig(path, "dom").moduleName),
                [
                  node.name.name,
                  elem,
                  t__namespace.arrowFunctionExpression(
                    [],
                    t__namespace.isJSXEmptyExpression(value.expression)
                      ? t__namespace.booleanLiteral(true)
                      : value.expression
                  )
                ]
              )
            )
          );
        } else if (key === "children") {
          children = value;
        } else if (key.startsWith("on")) {
          const ev = toEventName(key);
          if (key.startsWith("on:") || key.startsWith("oncapture:")) {
            const listenerOptions = [t__namespace.stringLiteral(key.split(":")[1]), value.expression];
            results.exprs.push(
              t__namespace.expressionStatement(
                t__namespace.callExpression(
                  t__namespace.memberExpression(elem, t__namespace.identifier("addEventListener")),
                  key.startsWith("oncapture:")
                    ? listenerOptions.concat(t__namespace.booleanLiteral(true))
                    : listenerOptions
                )
              )
            );
          } else if (
            config.delegateEvents &&
            (DelegatedEvents.has(ev) || config.delegatedEvents.indexOf(ev) !== -1)
          ) {
            // can only hydrate delegated events
            hasHydratableEvent = true;
            const events =
              attribute.scope.getProgramParent().data.events ||
              (attribute.scope.getProgramParent().data.events = new Set());
            events.add(ev);
            let handler = value.expression;
            const resolveable = detectResolvableEventHandler(attribute, handler);
            if (t__namespace.isArrayExpression(handler)) {
              if (handler.elements.length > 1) {
                results.exprs.unshift(
                  t__namespace.expressionStatement(
                    t__namespace.assignmentExpression(
                      "=",
                      t__namespace.memberExpression(elem, t__namespace.identifier(`$$${ev}Data`)),
                      handler.elements[1]
                    )
                  )
                );
              }
              handler = handler.elements[0];
              results.exprs.unshift(
                t__namespace.expressionStatement(
                  t__namespace.assignmentExpression(
                    "=",
                    t__namespace.memberExpression(elem, t__namespace.identifier(`$$${ev}`)),
                    handler
                  )
                )
              );
            } else if (t__namespace.isFunction(handler) || resolveable) {
              results.exprs.unshift(
                t__namespace.expressionStatement(
                  t__namespace.assignmentExpression(
                    "=",
                    t__namespace.memberExpression(elem, t__namespace.identifier(`$$${ev}`)),
                    handler
                  )
                )
              );
            } else {
              results.exprs.unshift(
                t__namespace.expressionStatement(
                  t__namespace.callExpression(
                    registerImportMethod(
                      path,
                      "addEventListener",
                      getRendererConfig(path, "dom").moduleName
                    ),
                    [elem, t__namespace.stringLiteral(ev), handler, t__namespace.booleanLiteral(true)]
                  )
                )
              );
            }
          } else {
            let handler = value.expression;
            const resolveable = detectResolvableEventHandler(attribute, handler);
            if (t__namespace.isArrayExpression(handler)) {
              if (handler.elements.length > 1) {
                handler = t__namespace.arrowFunctionExpression(
                  [t__namespace.identifier("e")],
                  t__namespace.callExpression(handler.elements[0], [handler.elements[1], t__namespace.identifier("e")])
                );
              } else handler = handler.elements[0];
              results.exprs.unshift(
                t__namespace.expressionStatement(
                  t__namespace.callExpression(t__namespace.memberExpression(elem, t__namespace.identifier("addEventListener")), [
                    t__namespace.stringLiteral(ev),
                    handler
                  ])
                )
              );
            } else if (t__namespace.isFunction(handler) || resolveable) {
              results.exprs.unshift(
                t__namespace.expressionStatement(
                  t__namespace.callExpression(t__namespace.memberExpression(elem, t__namespace.identifier("addEventListener")), [
                    t__namespace.stringLiteral(ev),
                    handler
                  ])
                )
              );
            } else {
              results.exprs.unshift(
                t__namespace.expressionStatement(
                  t__namespace.callExpression(
                    registerImportMethod(
                      path,
                      "addEventListener",
                      getRendererConfig(path, "dom").moduleName
                    ),
                    [elem, t__namespace.stringLiteral(ev), handler]
                  )
                )
              );
            }
          }
        } else if (
          config.effectWrapper &&
          (isDynamic(attribute.get("value").get("expression"), {
            checkMember: true
          }) ||
            ((key === "classList" || key === "style") &&
              !attribute.get("value").get("expression").evaluate().confident))
        ) {
          let nextElem = elem;
          if (key === "value" || key === "checked") {
            const effectWrapperId = registerImportMethod(path, config.effectWrapper);
            results.postExprs.push(
              t__namespace.expressionStatement(
                t__namespace.callExpression(effectWrapperId, [
                  t__namespace.arrowFunctionExpression(
                    [],
                    setAttr$2(path, elem, key, value.expression, {
                      isSVG,
                      isCE
                    })
                  )
                ])
              )
            );
            return;
          }
          if (key === "textContent") {
            nextElem = attribute.scope.generateUidIdentifier("el$");
            children = t__namespace.JSXText(" ");
            children.extra = { raw: " ", rawValue: " " };
            results.decl.push(
              t__namespace.variableDeclarator(nextElem, t__namespace.memberExpression(elem, t__namespace.identifier("firstChild")))
            );
          }
          results.dynamics.push({ elem: nextElem, key, value: value.expression, isSVG, isCE });
        } else {
          results.exprs.push(
            t__namespace.expressionStatement(setAttr$2(attribute, elem, key, value.expression, { isSVG, isCE }))
          );
        }
      } else {
        if (config.hydratable && key === "$ServerOnly") {
          results.skipTemplate = true;
          return;
        }
        if (t__namespace.isJSXExpressionContainer(value)) value = value.expression;
        key = Aliases[key] || key;
        if (value && ChildProperties.has(key)) {
          results.exprs.push(
            t__namespace.expressionStatement(setAttr$2(attribute, elem, key, value, { isSVG, isCE }))
          );
        } else {
          !isSVG && (key = key.toLowerCase());
          results.template += ` ${key}`;
          results.template += value ? `="${escapeBackticks(escapeHTML(value.value, true))}"` : "";
        }
      }
    });
  if (!hasChildren && children) {
    path.node.children.push(children);
  }
  if (spreadExpr) results.exprs.push(spreadExpr);

  results.hasHydratableEvent = results.hasHydratableEvent || hasHydratableEvent;
}

function transformChildren$2(path, results, config) {
  let tempPath = results.id && results.id.name,
    tagName = getTagName(path.node),
    nextPlaceholder,
    i = 0;
  const filteredChildren = filterChildren(path.get("children")),
    childNodes = filteredChildren.reduce((memo, child, index) => {
      if (child.isJSXFragment()) {
        throw new Error(
          `Fragments can only be used top level in JSX. Not used under a <${tagName}>.`
        );
      }
      const transformed = transformNode(child, {
        skipId: !results.id || !detectExpressions(filteredChildren, index, config)
      });
      if (!transformed) return memo;
      const i = memo.length;
      if (transformed.text && i && memo[i - 1].text) {
        memo[i - 1].template += transformed.template;
      } else memo.push(transformed);
      return memo;
    }, []);

  childNodes.forEach((child, index) => {
    if (!child) return;
    if (child.tagName && child.renderer !== "dom") {
      throw new Error(`<${child.tagName}> is not supported in <${tagName}>.
      Wrap the usage with a component that would render this element, eg. Canvas`);
    }

    results.template += child.template;
    if (child.id) {
      if (child.tagName === "head") {
        if (config.hydratable) {
          const createComponent = registerImportMethod(
            path,
            "createComponent",
            getRendererConfig(path, "dom").moduleName
          );
          const NoHydration = registerImportMethod(
            path,
            "NoHydration",
            getRendererConfig(path, "dom").moduleName
          );
          results.exprs.push(
            t__namespace.expressionStatement(
              t__namespace.callExpression(createComponent, [NoHydration, t__namespace.objectExpression([])])
            )
          );
        }
        return;
      }

      let getNextMatch;
      if (config.hydratable && tagName === "html") {
        getNextMatch = registerImportMethod(
          path,
          "getNextMatch",
          getRendererConfig(path, "dom").moduleName
        );
      }
      const walk = t__namespace.memberExpression(
        t__namespace.identifier(tempPath),
        t__namespace.identifier(i === 0 ? "firstChild" : "nextSibling")
      );
      results.decl.push(
        t__namespace.variableDeclarator(
          child.id,
          config.hydratable && tagName === "html"
            ? t__namespace.callExpression(getNextMatch, [walk, t__namespace.stringLiteral(child.tagName)])
            : walk
        )
      );
      results.decl.push(...child.decl);
      results.exprs.push(...child.exprs);
      results.dynamics.push(...child.dynamics);
      results.postExprs.push(...child.postExprs);
      results.hasHydratableEvent = results.hasHydratableEvent || child.hasHydratableEvent;
      results.hasCustomElement = results.hasCustomElement || child.hasCustomElement;
      tempPath = child.id.name;
      nextPlaceholder = null;
      i++;
    } else if (child.exprs.length) {
      let insert = registerImportMethod(path, "insert", getRendererConfig(path, "dom").moduleName);
      const multi = checkLength(filteredChildren),
        markers = config.hydratable && multi;
      // boxed by textNodes
      if (markers || wrappedByText(childNodes, index)) {
        let exprId, contentId;
        if (markers) tempPath = createPlaceholder(path, results, tempPath, i++, "#")[0].name;
        if (nextPlaceholder) {
          exprId = nextPlaceholder;
        } else {
          [exprId, contentId] = createPlaceholder(path, results, tempPath, i++, markers ? "/" : "");
        }
        if (!markers) nextPlaceholder = exprId;
        results.exprs.push(
          t__namespace.expressionStatement(
            t__namespace.callExpression(
              insert,
              contentId
                ? [results.id, child.exprs[0], exprId, contentId]
                : [results.id, child.exprs[0], exprId]
            )
          )
        );
        tempPath = exprId.name;
      } else if (multi) {
        results.exprs.push(
          t__namespace.expressionStatement(
            t__namespace.callExpression(insert, [
              results.id,
              child.exprs[0],
              nextChild$1(childNodes, index) || t__namespace.nullLiteral()
            ])
          )
        );
      } else {
        results.exprs.push(
          t__namespace.expressionStatement(t__namespace.callExpression(insert, [results.id, child.exprs[0]]))
        );
      }
    } else nextPlaceholder = null;
  });
}

function createPlaceholder(path, results, tempPath, i, char) {
  const exprId = path.scope.generateUidIdentifier("el$"),
    config = getConfig(path);
  let contentId;
  results.template += `<!${char}>`;
  if (config.hydratable && char === "/") {
    contentId = path.scope.generateUidIdentifier("co$");
    results.decl.push(
      t__namespace.variableDeclarator(
        t__namespace.arrayPattern([exprId, contentId]),
        t__namespace.callExpression(
          registerImportMethod(path, "getNextMarker", getRendererConfig(path, "dom").moduleName),
          [t__namespace.memberExpression(t__namespace.identifier(tempPath), t__namespace.identifier("nextSibling"))]
        )
      )
    );
  } else
    results.decl.push(
      t__namespace.variableDeclarator(
        exprId,
        t__namespace.memberExpression(
          t__namespace.identifier(tempPath),
          t__namespace.identifier(i === 0 ? "firstChild" : "nextSibling")
        )
      )
    );
  return [exprId, contentId];
}

function nextChild$1(children, index) {
  return children[index + 1] && (children[index + 1].id || nextChild$1(children, index + 1));
}

// reduce unnecessary refs
function detectExpressions(children, index, config) {
  if (children[index - 1]) {
    const node = children[index - 1].node;
    if (
      t__namespace.isJSXExpressionContainer(node) &&
      !t__namespace.isJSXEmptyExpression(node.expression) &&
      !getStaticExpression(children[index - 1])
    )
      return true;
    let tagName;
    if (t__namespace.isJSXElement(node) && (tagName = getTagName(node)) && isComponent(tagName)) return true;
  }
  for (let i = index; i < children.length; i++) {
    const child = children[i].node;
    if (t__namespace.isJSXExpressionContainer(child)) {
      if (!t__namespace.isJSXEmptyExpression(child.expression) && !getStaticExpression(children[i]))
        return true;
    } else if (t__namespace.isJSXElement(child)) {
      const tagName = getTagName(child);
      if (isComponent(tagName)) return true;
      if (config.contextToCustomElements && (tagName === "slot" || tagName.indexOf("-") > -1))
        return true;
      if (
        child.openingElement.attributes.some(
          attr =>
            t__namespace.isJSXSpreadAttribute(attr) ||
            ["textContent", "innerHTML", "innerText"].includes(attr.name.name) ||
            (attr.name.namespace && attr.name.namespace.name === "use") ||
            (t__namespace.isJSXExpressionContainer(attr.value) &&
              !(
                t__namespace.isStringLiteral(attr.value.expression) ||
                t__namespace.isNumericLiteral(attr.value.expression)
              ))
        )
      )
        return true;
      const nextChildren = filterChildren(children[i].get("children"));
      if (nextChildren.length) if (detectExpressions(nextChildren, 0, config)) return true;
    }
  }
}

function contextToCustomElement(path, results) {
  results.exprs.push(
    t__namespace.expressionStatement(
      t__namespace.assignmentExpression(
        "=",
        t__namespace.memberExpression(results.id, t__namespace.identifier("_$owner")),
        t__namespace.callExpression(
          registerImportMethod(path, "getOwner", getRendererConfig(path, "dom").moduleName),
          []
        )
      )
    )
  );
}

function processSpreads$1(path, attributes, { elem, isSVG, hasChildren, wrapConditionals }) {
  // TODO: skip but collect the names of any properties after the last spread to not overwrite them
  const filteredAttributes = [];
  const spreadArgs = [];
  let runningObject = [];
  let dynamicSpread = false;
  let firstSpread = false;
  attributes.forEach(attribute => {
    const node = attribute.node;
    const key =
      !t__namespace.isJSXSpreadAttribute(node) &&
      (t__namespace.isJSXNamespacedName(node.name)
        ? `${node.name.namespace.name}:${node.name.name.name}`
        : node.name.name);
    if (t__namespace.isJSXSpreadAttribute(node)) {
      firstSpread = true;
      if (runningObject.length) {
        spreadArgs.push(t__namespace.objectExpression(runningObject));
        runningObject = [];
      }
      spreadArgs.push(
        isDynamic(attribute.get("argument"), {
          checkMember: true
        }) && (dynamicSpread = true)
          ? t__namespace.isCallExpression(node.argument) &&
            !node.argument.arguments.length &&
            !t__namespace.isCallExpression(node.argument.callee) &&
            !t__namespace.isMemberExpression(node.argument.callee)
            ? node.argument.callee
            : t__namespace.arrowFunctionExpression([], node.argument)
          : node.argument
      );
    } else if (
      (firstSpread ||
        (t__namespace.isJSXExpressionContainer(node.value) &&
          isDynamic(attribute.get("value").get("expression"), { checkMember: true }))) &&
      canNativeSpread(key, { checkNameSpaces: true })
    ) {
      const isContainer = t__namespace.isJSXExpressionContainer(node.value);
      const dynamic =
        isContainer && isDynamic(attribute.get("value").get("expression"), { checkMember: true });
      if (dynamic) {
        const id = convertJSXIdentifier(node.name);
        let expr =
          wrapConditionals &&
          (t__namespace.isLogicalExpression(node.value.expression) ||
            t__namespace.isConditionalExpression(node.value.expression))
            ? transformCondition$1(attribute.get("value").get("expression"), true)
            : t__namespace.arrowFunctionExpression([], node.value.expression);
        runningObject.push(
          t__namespace.objectMethod(
            "get",
            id,
            [],
            t__namespace.blockStatement([t__namespace.returnStatement(expr.body)]),
            !t__namespace.isValidIdentifier(key)
          )
        );
      } else {
        runningObject.push(
          t__namespace.objectProperty(
            t__namespace.stringLiteral(key),
            isContainer ? node.value.expression : node.value || (Properties.has(key) ? t__namespace.booleanLiteral(true) : t__namespace.stringLiteral(""))
          )
        );
      }
    } else filteredAttributes.push(attribute);
  });

  if (runningObject.length) {
    spreadArgs.push(t__namespace.objectExpression(runningObject));
  }

  const props =
    spreadArgs.length === 1 && !dynamicSpread
      ? spreadArgs[0]
      : t__namespace.callExpression(registerImportMethod(path, "mergeProps"), spreadArgs);

  return [
    filteredAttributes,
    t__namespace.expressionStatement(
      t__namespace.callExpression(
        registerImportMethod(path, "spread", getRendererConfig(path, "dom").moduleName),
        [elem, props, t__namespace.booleanLiteral(isSVG), t__namespace.booleanLiteral(hasChildren)]
      )
    )
  ];
}

function createTemplate$2(path, result, wrap) {
  const config = getConfig(path);
  if (result.id) {
    registerTemplate(path, result);
    if (
      !(result.exprs.length || result.dynamics.length || result.postExprs.length) &&
      result.decl.declarations.length === 1
    ) {
      return result.decl.declarations[0].init;
    } else {
      return t__namespace.callExpression(
        t__namespace.arrowFunctionExpression(
          [],
          t__namespace.blockStatement([
            result.decl,
            ...result.exprs.concat(
              wrapDynamics$1(path, result.dynamics) || [],
              result.postExprs || []
            ),
            t__namespace.returnStatement(result.id)
          ])
        ),
        []
      );
    }
  }
  if (wrap && result.dynamic && config.memoWrapper) {
    return t__namespace.callExpression(registerImportMethod(path, config.memoWrapper), [result.exprs[0]]);
  }
  return result.exprs[0];
}

function appendTemplates$1(path, templates) {
  const declarators = templates.map(template => {
    const tmpl = {
      cooked: template.template,
      raw: template.template
    };
    return t__namespace.variableDeclarator(
      template.id,
      t__namespace.addComment(
        t__namespace.callExpression(
          registerImportMethod(path, "template", getRendererConfig(path, "dom").moduleName),
          [
            t__namespace.templateLiteral([t__namespace.templateElement(tmpl, true)], []),
            t__namespace.numericLiteral(template.elementCount)
          ].concat(template.isSVG ? t__namespace.booleanLiteral(template.isSVG) : [])
        ),
        "leading",
        "#__PURE__"
      )
    );
  });
  path.node.body.unshift(t__namespace.variableDeclaration("const", declarators));
}

function registerTemplate(path, results) {
  const { hydratable } = getConfig(path);
  let decl;
  if (results.template.length) {
    let templateDef, templateId;
    if (!results.skipTemplate) {
      const templates =
        path.scope.getProgramParent().data.templates ||
        (path.scope.getProgramParent().data.templates = []);
      if ((templateDef = templates.find(t => t.template === results.template))) {
        templateId = templateDef.id;
      } else {
        templateId = path.scope.generateUidIdentifier("tmpl$");
        templates.push({
          id: templateId,
          template: results.template,
          elementCount: results.template.split("<").length - 1,
          isSVG: results.isSVG,
          renderer: "dom"
        });
      }
    }
    decl = t__namespace.variableDeclarator(
      results.id,
      hydratable
        ? t__namespace.callExpression(
            registerImportMethod(path, "getNextElement", getRendererConfig(path, "dom").moduleName),
            templateId ? [templateId] : []
          )
        : results.hasCustomElement
        ? t__namespace.callExpression(
            registerImportMethod(path, "untrack", getRendererConfig(path, "dom").moduleName),
            [
              t__namespace.arrowFunctionExpression(
                [],
                t__namespace.callExpression(
                  t__namespace.memberExpression(t__namespace.identifier("document"), t__namespace.identifier("importNode")),
                  [templateId, t__namespace.booleanLiteral(true)]
                )
              )
            ]
          )
        : t__namespace.callExpression(t__namespace.memberExpression(templateId, t__namespace.identifier("cloneNode")), [
            t__namespace.booleanLiteral(true)
          ])
    );
  }
  results.decl.unshift(decl);
  results.decl = t__namespace.variableDeclaration("const", results.decl);
}

function wrapDynamics$1(path, dynamics) {
  if (!dynamics.length) return;
  const config = getConfig(path);

  const effectWrapperId = registerImportMethod(path, config.effectWrapper);

  if (dynamics.length === 1) {
    const prevValue =
      dynamics[0].key === "classList" || dynamics[0].key === "style"
        ? t__namespace.identifier("_$p")
        : undefined;
    if (
      dynamics[0].key.startsWith("class:") &&
      !t__namespace.isBooleanLiteral(dynamics[0].value) &&
      !t__namespace.isUnaryExpression(dynamics[0].value)
    ) {
      dynamics[0].value = t__namespace.unaryExpression("!", t__namespace.unaryExpression("!", dynamics[0].value));
    }

    return t__namespace.expressionStatement(
      t__namespace.callExpression(effectWrapperId, [
        t__namespace.arrowFunctionExpression(
          prevValue ? [prevValue] : [],
          setAttr$2(path, dynamics[0].elem, dynamics[0].key, dynamics[0].value, {
            isSVG: dynamics[0].isSVG,
            isCE: dynamics[0].isCE,
            dynamic: true,
            prevId: prevValue
          })
        )
      ])
    );
  }
  const decls = [],
    statements = [],
    identifiers = [],
    prevId = t__namespace.identifier("_p$");
  dynamics.forEach(({ elem, key, value, isSVG, isCE }) => {
    const identifier = path.scope.generateUidIdentifier("v$");
    if (key.startsWith("class:") && !t__namespace.isBooleanLiteral(value) && !t__namespace.isUnaryExpression(value)) {
      value = t__namespace.unaryExpression("!", t__namespace.unaryExpression("!", value));
    }
    identifiers.push(identifier);
    decls.push(t__namespace.variableDeclarator(identifier, value));
    if (key === "classList" || key === "style") {
      const prev = t__namespace.memberExpression(prevId, identifier);
      statements.push(
        t__namespace.expressionStatement(
          t__namespace.assignmentExpression(
            "=",
            prev,
            setAttr$2(path, elem, key, identifier, { isSVG, isCE, dynamic: true, prevId: prev })
          )
        )
      );
    } else {
      statements.push(
        t__namespace.expressionStatement(
          t__namespace.logicalExpression(
            "&&",
            t__namespace.binaryExpression("!==", identifier, t__namespace.memberExpression(prevId, identifier)),
            setAttr$2(
              path,
              elem,
              key,
              t__namespace.assignmentExpression("=", t__namespace.memberExpression(prevId, identifier), identifier),
              { isSVG, isCE, dynamic: true }
            )
          )
        )
      );
    }
  });

  return t__namespace.expressionStatement(
    t__namespace.callExpression(effectWrapperId, [
      t__namespace.arrowFunctionExpression(
        [prevId],
        t__namespace.blockStatement([
          t__namespace.variableDeclaration("const", decls),
          ...statements,
          t__namespace.returnStatement(prevId)
        ])
      ),
      t__namespace.objectExpression(identifiers.map(id => t__namespace.objectProperty(id, t__namespace.identifier("undefined"))))
    ])
  );
}

function createTemplate$1(path, result) {
  if (!result.template) {
    return result.exprs[0];
  }

  let template, id;

  if (!Array.isArray(result.template)) {
    template = t__namespace.stringLiteral(result.template);
  } else if (result.template.length === 1) {
    template = t__namespace.stringLiteral(result.template[0]);
  } else {
    const strings = result.template.map(tmpl => t__namespace.stringLiteral(tmpl));
    template = t__namespace.arrayExpression(strings);
  }

  const templates =
    path.scope.getProgramParent().data.templates ||
    (path.scope.getProgramParent().data.templates = []);
  const found = templates.find(tmp => {
    if (t__namespace.isArrayExpression(tmp.template) && t__namespace.isArrayExpression(template)) {
      return tmp.template.elements.every(
        (el, i) => template.elements[i] && el.value === template.elements[i].value
      );
    }
    return tmp.template.value === template.value;
  });
  if (!found) {
    id = path.scope.generateUidIdentifier("tmpl$");
    templates.push({
      id,
      template,
      renderer: "ssr"
    });
  } else id = found.id;

  return t__namespace.callExpression(
    registerImportMethod(path, "ssr"),
    Array.isArray(result.template) && result.template.length > 1 ? [id, ...result.templateValues] : [id]
  );
}

function appendTemplates(path, templates) {
  const declarators = templates.map(template => {
    return t__namespace.variableDeclarator(template.id, template.template);
  });
  path.node.body.unshift(t__namespace.variableDeclaration("const", declarators));
}

function appendToTemplate(template, value) {
  let array;
  if (Array.isArray(value)) {
    [value, ...array] = value;
  }
  template[template.length - 1] += value;
  if (array && array.length) template.push.apply(template, array);
}

function transformElement$2(path, info) {
  const config = getConfig(path);
  // contains spread attributes
  if (path.node.openingElement.attributes.some(a => t__namespace.isJSXSpreadAttribute(a)))
    return createElement(path, { ...info, ...config });

  const tagName = getTagName(path.node),
    voidTag = VoidElements.indexOf(tagName) > -1,
    results = {
      template: [`<${tagName}`],
      templateValues: [],
      decl: [],
      exprs: [],
      dynamics: [],
      tagName,
      renderer: "ssr"
    };

  if (info.topLevel && config.hydratable) {
    if (tagName === "head") {
      registerImportMethod(path, "NoHydration");
      registerImportMethod(path, "createComponent");
      const child = transformElement$2(path, { ...info, topLevel: false });
      results.template = "";
      results.exprs.push(
        t__namespace.callExpression(t__namespace.identifier("_$createComponent"), [
          t__namespace.identifier("_$NoHydration"),
          t__namespace.objectExpression([
            t__namespace.objectMethod(
              "get",
              t__namespace.identifier("children"),
              [],
              t__namespace.blockStatement([t__namespace.returnStatement(createTemplate$1(path, child))])
            )
          ])
        ])
      );
      return results;
    }
    results.template.push("");
    results.templateValues.push(
      t__namespace.callExpression(registerImportMethod(path, "ssrHydrationKey"), [])
    );
  }
  transformAttributes$1(path, results, { ...config, ...info });
  appendToTemplate(results.template, ">");
  if (!voidTag) {
    transformChildren$1(path, results, { ...config, ...info });
    appendToTemplate(results.template, `</${tagName}>`);
  }
  return results;
}

function toAttribute(key, isSVG) {
  key = Aliases[key] || key;
  !isSVG && (key = key.toLowerCase());
  return key;
}

function setAttr$1(attribute, results, name, value, isSVG) {
  // strip out namespaces for now, everything at this point is an attribute
  let parts;
  if ((parts = name.split(":")) && parts[1] && reservedNameSpaces.has(parts[0])) {
    name = parts[1];
  }

  name = toAttribute(name, isSVG);
  const attr = t__namespace.callExpression(registerImportMethod(attribute, "ssrAttribute"), [
    t__namespace.stringLiteral(name),
    value,
    t__namespace.booleanLiteral(false)
  ]);
  if (results.template[results.template.length - 1].length) {
    results.template.push("");
    results.templateValues.push(attr);
  } else {
    const last = results.templateValues.length - 1;
    results.templateValues[last] = t__namespace.binaryExpression("+", results.templateValues[last], attr);
  }
}

function escapeExpression(path, expression, attr) {
  if (t__namespace.isStringLiteral(expression) || t__namespace.isNumericLiteral(expression)) {
    return expression;
  } else if (t__namespace.isFunction(expression)) {
    expression.body = escapeExpression(path, expression.body, attr);
    return expression;
  } else if (t__namespace.isTemplateLiteral(expression)) {
    expression.expressions = expression.expressions.map(e => escapeExpression(path, e, attr));
    return expression;
  } else if (t__namespace.isUnaryExpression(expression)) {
    expression.argument = escapeExpression(path, expression.argument, attr);
    return expression;
  } else if (t__namespace.isBinaryExpression(expression)) {
    expression.left = escapeExpression(path, expression.left, attr);
    expression.right = escapeExpression(path, expression.right, attr);
    return expression;
  } else if (t__namespace.isConditionalExpression(expression)) {
    expression.consequent = escapeExpression(path, expression.consequent, attr);
    expression.alternate = escapeExpression(path, expression.alternate, attr);
    return expression;
  } else if (t__namespace.isLogicalExpression(expression)) {
    expression.right = escapeExpression(path, expression.right, attr);
    if (expression.operator !== "&&") {
      expression.left = escapeExpression(path, expression.left, attr);
    }
    return expression;
  } else if (t__namespace.isCallExpression(expression) && t__namespace.isFunction(expression.callee)) {
    if (t__namespace.isBlockStatement(expression.callee.body)) {
      expression.callee.body.body = expression.callee.body.body.map(e => {
        if (t__namespace.isReturnStatement(e)) e.argument = escapeExpression(path, e.argument, attr);
        return e;
      });
    } else expression.callee.body = escapeExpression(path, expression.callee.body, attr);
    return expression;
  }

  return t__namespace.callExpression(
    registerImportMethod(path, "escape"),
    [expression].concat(attr ? [t__namespace.booleanLiteral(true)] : [])
  );
}

function transformToObject(attrName, attributes, selectedAttributes) {
  const properties = [];
  const existingAttribute = attributes.find(a => a.node.name.name === attrName);
  for (let i = 0; i < selectedAttributes.length; i++) {
    const attr = selectedAttributes[i].node;
    const computed = !t__namespace.isValidIdentifier(attr.name.name.name);
    if (!computed) {
      attr.name.name.type = "Identifier";
    }
    properties.push(
      t__namespace.objectProperty(
        computed ? t__namespace.stringLiteral(attr.name.name.name) : attr.name.name,
        t__namespace.isJSXExpressionContainer(attr.value) ? attr.value.expression : attr.value
      )
    );
    (existingAttribute || i) && attributes.splice(selectedAttributes[i].key, 1);
  }
  if (
    existingAttribute &&
    t__namespace.isJSXExpressionContainer(existingAttribute.node.value) &&
    t__namespace.isObjectExpression(existingAttribute.node.value.expression)
  ) {
    existingAttribute.node.value.expression.properties.push(...properties);
  } else {
    selectedAttributes[0].node = t__namespace.jsxAttribute(
      t__namespace.jsxIdentifier(attrName),
      t__namespace.jsxExpressionContainer(t__namespace.objectExpression(properties))
    );
  }
}

function normalizeAttributes(path) {
  const attributes = path.get("openingElement").get("attributes"),
    styleAttributes = attributes.filter(
      a => t__namespace.isJSXNamespacedName(a.node.name) && a.node.name.namespace.name === "style"
    ),
    classNamespaceAttributes = attributes.filter(
      a => t__namespace.isJSXNamespacedName(a.node.name) && a.node.name.namespace.name === "class"
    );
  if (classNamespaceAttributes.length)
    transformToObject("classList", attributes, classNamespaceAttributes);
  const classAttributes = attributes.filter(
    a =>
      a.node.name &&
      (a.node.name.name === "class" ||
        a.node.name.name === "className" ||
        a.node.name.name === "classList")
  );
  // combine class propertoes
  if (classAttributes.length > 1) {
    const first = classAttributes[0].node,
      values = [],
      quasis = [t__namespace.TemplateElement({ raw: "" })];
    for (let i = 0; i < classAttributes.length; i++) {
      const attr = classAttributes[i].node,
        isLast = i === classAttributes.length - 1;
      if (!t__namespace.isJSXExpressionContainer(attr.value)) {
        const prev = quasis.pop();
        quasis.push(
          t__namespace.TemplateElement({
            raw:
              (prev ? prev.value.raw : "") +
              (i ? " " : "") +
              `${attr.value.value}` +
              (isLast ? "" : " ")
          })
        );
      } else {
        let expr = attr.value.expression;
        if (attr.name.name === "classList") {
          if (t__namespace.isObjectExpression(expr) && !expr.properties.some(p => t__namespace.isSpreadElement(p))) {
            transformClasslistObject(path, expr, values, quasis);
            i && attributes.splice(attributes.indexOf(classAttributes[i]), 1);
            continue;
          }
          expr = t__namespace.callExpression(registerImportMethod(path, "ssrClassList"), [expr]);
        }
        values.push(t__namespace.logicalExpression("||", expr, t__namespace.stringLiteral("")));
        quasis.push(t__namespace.TemplateElement({ raw: isLast ? "" : " " }));
      }
      i && attributes.splice(attributes.indexOf(classAttributes[i]), 1);
    }
    first.name = t__namespace.JSXIdentifier("class");
    first.value = t__namespace.JSXExpressionContainer(t__namespace.TemplateLiteral(quasis, values));
  }
  if (styleAttributes.length) transformToObject("style", attributes, styleAttributes);
  return attributes;
}

function transformAttributes$1(path, results, info) {
  const tagName = getTagName(path.node),
    isSVG = SVGElements.has(tagName),
    hasChildren = path.node.children.length > 0,
    attributes = normalizeAttributes(path);
  let children;

  attributes.forEach(attribute => {
    const node = attribute.node;

    let value = node.value,
      key = t__namespace.isJSXNamespacedName(node.name)
        ? `${node.name.namespace.name}:${node.name.name.name}`
        : node.name.name,
      reservedNameSpace =
        t__namespace.isJSXNamespacedName(node.name) && reservedNameSpaces.has(node.name.namespace.name);
    if (
      ((t__namespace.isJSXNamespacedName(node.name) && reservedNameSpace) || ChildProperties.has(key)) &&
      !t__namespace.isJSXExpressionContainer(value)
    ) {
      node.value = value = t__namespace.JSXExpressionContainer(value || t__namespace.JSXEmptyExpression());
    }

    if (
      t__namespace.isJSXExpressionContainer(value) &&
      (reservedNameSpace ||
        ChildProperties.has(key) ||
        !(t__namespace.isStringLiteral(value.expression) || t__namespace.isNumericLiteral(value.expression)))
    ) {
      if (
        key === "ref" ||
        key.startsWith("use:") ||
        key.startsWith("prop:") ||
        key.startsWith("on")
      )
        return;
      else if (ChildProperties.has(key)) {
        if (info.hydratable && key === "textContent" && value && value.expression) {
          value.expression = t__namespace.logicalExpression("||", value.expression, t__namespace.stringLiteral(" "));
        }
        if (key === "innerHTML") path.doNotEscape = true;
        children = value;
      } else {
        let doEscape = true;
        if (BooleanAttributes.has(key)) {
          results.template.push("");
          const fn = t__namespace.callExpression(registerImportMethod(attribute, "ssrAttribute"), [
            t__namespace.stringLiteral(key),
            value.expression,
            t__namespace.booleanLiteral(true)
          ]);
          results.templateValues.push(fn);
          return;
        }
        if (key === "style") {
          if (
            t__namespace.isJSXExpressionContainer(value) &&
            t__namespace.isObjectExpression(value.expression) &&
            !value.expression.properties.some(p => t__namespace.isSpreadElement(p))
          ) {
            const props = value.expression.properties.map((p, i) =>
              t__namespace.binaryExpression(
                "+",
                t__namespace.stringLiteral(
                  (i ? ";" : "") + (t__namespace.isIdentifier(p.key) ? p.key.name : p.key.value) + ":"
                ),
                t__namespace.isStringLiteral(p.value)
                  ? t__namespace.stringLiteral(escapeHTML(p.value.value))
                  : t__namespace.isNumericLiteral(p.value)
                  ? p.value
                  : t__namespace.isTemplateLiteral(p.value) && p.value.expressions.length === 0
                  ? t__namespace.stringLiteral(escapeHTML(p.value.quasis[0].value.raw))
                  : t__namespace.callExpression(registerImportMethod(path, "escape"), [
                      p.value,
                      t__namespace.booleanLiteral(true)
                    ])
              )
            );
            let res = props[0];
            for (let i = 1; i < props.length; i++) {
              res = t__namespace.binaryExpression("+", res, props[i]);
            }
            value.expression = res;
          } else {
            value.expression = t__namespace.callExpression(registerImportMethod(path, "ssrStyle"), [
              value.expression
            ]);
          }
          doEscape = false;
        }
        if (key === "classList") {
          if (
            t__namespace.isObjectExpression(value.expression) &&
            !value.expression.properties.some(p => t__namespace.isSpreadElement(p))
          ) {
            const values = [],
              quasis = [t__namespace.TemplateElement({ raw: "" })];
            transformClasslistObject(path, value.expression, values, quasis);
            if (!values.length) value.expression = t__namespace.stringLiteral(quasis[0].value.raw);
            else if (values.length === 1 && !quasis[0].value.raw && !quasis[1].value.raw) {
              value.expression = values[0];
            } else value.expression = t__namespace.templateLiteral(quasis, values);
          } else {
            value.expression = t__namespace.callExpression(registerImportMethod(path, "ssrClassList"), [
              value.expression
            ]);
          }
          key = "class";
          doEscape = false;
        }
        if (doEscape) value.expression = escapeExpression(path, value.expression, true);

        if (!doEscape || t__namespace.isLiteral(value.expression) || t__namespace.isBinaryExpression(value.expression)) {
          key = toAttribute(key, isSVG);
          appendToTemplate(results.template, ` ${key}="`);
          results.template.push(`"`);
          results.templateValues.push(value.expression);
        } else setAttr$1(attribute, results, key, value.expression, isSVG);
      }
    } else {
      if (key === "$ServerOnly") return;
      if (t__namespace.isJSXExpressionContainer(value)) value = value.expression;
      key = toAttribute(key, isSVG);
      appendToTemplate(results.template, ` ${key}`);
      appendToTemplate(results.template, value ? `="${escapeHTML(value.value, true)}"` : "");
    }
  });
  if (!hasChildren && children) {
    path.node.children.push(children);
  }
}

function transformClasslistObject(path, expr, values, quasis) {
  expr.properties.forEach((prop, i) => {
    const isLast = expr.properties.length - 1 === i;
    let key = prop.key;
    if (t__namespace.isIdentifier(prop.key) && !prop.computed) key = t__namespace.stringLiteral(key.name);
    else if (prop.computed) {
      key = t__namespace.callExpression(registerImportMethod(path, "escape"), [
        prop.key,
        t__namespace.booleanLiteral(true)
      ]);
    } else key = t__namespace.stringLiteral(escapeHTML(prop.key.value));
    if (t__namespace.isBooleanLiteral(prop.value)) {
      if (prop.value.value === true) {
        if (!prop.computed) {
          const prev = quasis.pop();
          quasis.push(
            t__namespace.TemplateElement({
              raw:
                (prev ? prev.value.raw : "") + (i ? " " : "") + `${key.value}` + (isLast ? "" : " ")
            })
          );
        } else {
          values.push(key);
          quasis.push(t__namespace.TemplateElement({ raw: isLast ? "" : " " }));
        }
      }
    } else {
      values.push(t__namespace.conditionalExpression(prop.value, key, t__namespace.stringLiteral("")));
      quasis.push(t__namespace.TemplateElement({ raw: isLast ? "" : " " }));
    }
  });
}

function transformChildren$1(path, results, { hydratable }) {
  const doNotEscape = path.doNotEscape;
  const filteredChildren = filterChildren(path.get("children"));
  const multi = checkLength(filteredChildren),
    markers = hydratable && multi;
  filteredChildren.forEach(node => {
    if (t__namespace.isJSXElement(node.node) && getTagName(node.node) === "head") {
      const child = transformNode(node, { doNotEscape, hydratable: false });
      registerImportMethod(path, "NoHydration");
      registerImportMethod(path, "createComponent");
      results.template.push("");
      results.templateValues.push(
        t__namespace.callExpression(t__namespace.identifier("_$createComponent"), [
          t__namespace.identifier("_$NoHydration"),
          t__namespace.objectExpression([
            t__namespace.objectMethod(
              "get",
              t__namespace.identifier("children"),
              [],
              t__namespace.blockStatement([t__namespace.returnStatement(createTemplate$1(path, child))])
            )
          ])
        ])
      );
      return;
    }
    const child = transformNode(node, { doNotEscape });
    if (!child) return;
    appendToTemplate(results.template, child.template);
    results.templateValues.push.apply(results.templateValues, child.templateValues || []);
    if (child.exprs.length) {
      if (!doNotEscape && !child.spreadElement)
        child.exprs[0] = escapeExpression(path, child.exprs[0]);

      // boxed by textNodes
      if (markers && !child.spreadElement) {
        appendToTemplate(results.template, `<!--#-->`);
        results.template.push("");
        results.templateValues.push(child.exprs[0]);
        appendToTemplate(results.template, `<!--/-->`);
      } else {
        results.template.push("");
        results.templateValues.push(child.exprs[0]);
      }
    }
  });
}

function createElement(path, { topLevel, hydratable }) {
  const tagName = getTagName(path.node),
    config = getConfig(path),
    attributes = normalizeAttributes(path);

  const filteredChildren = filterChildren(path.get("children")),
    multi = checkLength(filteredChildren),
    markers = hydratable && multi,
    childNodes = filteredChildren.reduce((memo, path) => {
      if (t__namespace.isJSXText(path.node)) {
        const v = htmlEntities.decode(trimWhitespace(path.node.extra.raw));
        if (v.length) memo.push(t__namespace.stringLiteral(v));
      } else {
        const child = transformNode(path);
        if (markers && child.exprs.length && !child.spreadElement) memo.push(t__namespace.stringLiteral("<!--#-->"));
        if (child.exprs.length && !child.spreadElement) child.exprs[0] = escapeExpression(path, child.exprs[0]);
        memo.push(getCreateTemplate(config, path, child)(path, child, true));
        if (markers && child.exprs.length && !child.spreadElement) memo.push(t__namespace.stringLiteral("<!--/-->"));
      }
      return memo;
    }, []);

  let transformed;
  if (attributes.length === 1) {
    transformed = attributes[0].node.argument;
  } else {
    transformed = t__namespace.arrowFunctionExpression(
      [],
      t__namespace.objectExpression(
        attributes.reduce((memo, attribute) => {
          const node = attribute.node;

          if (t__namespace.isJSXSpreadAttribute(node)) {
            const expr = node.argument;
            memo.push(t__namespace.spreadElement(expr));
            return memo;
          }
          let value = node.value,
            key = t__namespace.isJSXNamespacedName(node.name)
              ? `${node.name.namespace.name}:${node.name.name.name}`
              : node.name.name,
            reservedNameSpace =
              t__namespace.isJSXNamespacedName(node.name) && reservedNameSpaces.has(node.name.namespace.name);
          if (
            ((t__namespace.isJSXNamespacedName(node.name) && reservedNameSpace) || ChildProperties.has(key)) &&
            !t__namespace.isJSXExpressionContainer(value)
          ) {
            node.value = value = t__namespace.JSXExpressionContainer(value || t__namespace.JSXEmptyExpression());
          }

          if (
            t__namespace.isJSXExpressionContainer(value) &&
            (reservedNameSpace ||
              ChildProperties.has(key) ||
              !(t__namespace.isStringLiteral(value.expression) || t__namespace.isNumericLiteral(value.expression)))
          ) {
            if (
              key === "ref" ||
              key.startsWith("use:") ||
              key.startsWith("prop:") ||
              key.startsWith("on")
            )
              return memo;

            memo.push(t__namespace.objectProperty(t__namespace.stringLiteral(key), value.expression));
          } else {
            if (key === "$ServerOnly") return memo;
            if (t__namespace.isJSXExpressionContainer(value)) value = value.expression;
            memo.push(
              t__namespace.objectProperty(t__namespace.stringLiteral(key), value ? value : t__namespace.booleanLiteral(true))
            );
          }
          return memo;
        }, [])
      )
    );
  }

  const exprs = [
    t__namespace.callExpression(registerImportMethod(path, "ssrElement"), [
      t__namespace.stringLiteral(tagName),
      transformed,
      childNodes.length
        ? hydratable
          ? t__namespace.arrowFunctionExpression(
              [],
              childNodes.length === 1 ? childNodes[0] : t__namespace.arrayExpression(childNodes)
            )
          : childNodes.length === 1
          ? childNodes[0]
          : t__namespace.arrayExpression(childNodes)
        : t__namespace.identifier("undefined"),
      t__namespace.booleanLiteral(Boolean(topLevel && config.hydratable))
    ])
  ];
  return { exprs, template: "", spreadElement: true };
}

function transformElement$1(path, info) {
  let tagName = getTagName(path.node),
    results = {
      id: path.scope.generateUidIdentifier("el$"),
      decl: [],
      exprs: [],
      dynamics: [],
      postExprs: [],
      tagName,
      renderer: "universal"
    };

  results.decl.push(
    t__namespace.variableDeclarator(
      results.id,
      t__namespace.callExpression(
        registerImportMethod(
          path,
          "createElement",
          getRendererConfig(path, "universal").moduleName
        ),
        [t__namespace.stringLiteral(tagName)]
      )
    )
  );

  transformAttributes(path, results);
  transformChildren(path, results);

  return results;
}

function transformAttributes(path, results) {
  let children, spreadExpr;
  let attributes = path.get("openingElement").get("attributes");
  const elem = results.id,
    hasChildren = path.node.children.length > 0,
    config = getConfig(path);

  // preprocess spreads
  if (attributes.some(attribute => t__namespace.isJSXSpreadAttribute(attribute.node))) {
    [attributes, spreadExpr] = processSpreads(path, attributes, {
      elem,
      hasChildren,
      wrapConditionals: config.wrapConditionals
    });
    path.get("openingElement").set(
      "attributes",
      attributes.map(a => a.node)
    );
  }

  path
    .get("openingElement")
    .get("attributes")
    .forEach(attribute => {
      const node = attribute.node;

      let value = node.value,
        key = t__namespace.isJSXNamespacedName(node.name)
          ? `${node.name.namespace.name}:${node.name.name.name}`
          : node.name.name,
        reservedNameSpace = t__namespace.isJSXNamespacedName(node.name) && node.name.namespace.name === "use";
      if (
        t__namespace.isJSXNamespacedName(node.name) &&
        reservedNameSpace &&
        !t__namespace.isJSXExpressionContainer(value)
      ) {
        node.value = value = t__namespace.JSXExpressionContainer(value || t__namespace.JSXEmptyExpression());
      }
      if (t__namespace.isJSXExpressionContainer(value)) {
        if (key === "ref") {
          // Normalize expressions for non-null and type-as
          while (
            t__namespace.isTSNonNullExpression(value.expression) ||
            t__namespace.isTSAsExpression(value.expression)
          ) {
            value.expression = value.expression.expression;
          }
          if (t__namespace.isLVal(value.expression)) {
            const refIdentifier = path.scope.generateUidIdentifier("_ref$");
            results.exprs.unshift(
              t__namespace.variableDeclaration("const", [
                t__namespace.variableDeclarator(refIdentifier, value.expression)
              ]),
              t__namespace.expressionStatement(
                t__namespace.conditionalExpression(
                  t__namespace.binaryExpression(
                    "===",
                    t__namespace.unaryExpression("typeof", refIdentifier),
                    t__namespace.stringLiteral("function")
                  ),
                  t__namespace.callExpression(
                    registerImportMethod(
                      path,
                      "use",
                      getRendererConfig(path, "universal").moduleName
                    ),
                    [refIdentifier, elem]
                  ),
                  t__namespace.assignmentExpression("=", value.expression, elem)
                )
              )
            );
          } else if (t__namespace.isFunction(value.expression)) {
            results.exprs.unshift(
              t__namespace.expressionStatement(
                t__namespace.callExpression(
                  registerImportMethod(
                    path,
                    "use",
                    getRendererConfig(path, "universal").moduleName
                  ),
                  [value.expression, elem]
                )
              )
            );
          } else if (t__namespace.isCallExpression(value.expression)) {
            const refIdentifier = path.scope.generateUidIdentifier("_ref$");
            results.exprs.unshift(
              t__namespace.variableDeclaration("const", [
                t__namespace.variableDeclarator(refIdentifier, value.expression)
              ]),
              t__namespace.expressionStatement(
                t__namespace.logicalExpression(
                  "&&",
                  t__namespace.binaryExpression(
                    "===",
                    t__namespace.unaryExpression("typeof", refIdentifier),
                    t__namespace.stringLiteral("function")
                  ),
                  t__namespace.callExpression(
                    registerImportMethod(
                      path,
                      "use",
                      getRendererConfig(path, "universal").moduleName
                    ),
                    [refIdentifier, elem]
                  )
                )
              )
            );
          }
        } else if (key.startsWith("use:")) {
          // Some trick to treat JSXIdentifier as Identifier
          node.name.name.type = "Identifier";
          results.exprs.unshift(
            t__namespace.expressionStatement(
              t__namespace.callExpression(
                registerImportMethod(path, "use", getRendererConfig(path, "universal").moduleName),
                [
                  node.name.name,
                  elem,
                  t__namespace.arrowFunctionExpression(
                    [],
                    t__namespace.isJSXEmptyExpression(value.expression)
                      ? t__namespace.booleanLiteral(true)
                      : value.expression
                  )
                ]
              )
            )
          );
        } else if (key === "children") {
          children = value;
        } else if (
          config.effectWrapper &&
          isDynamic(attribute.get("value").get("expression"), {
            checkMember: true
          })
        ) {
          results.dynamics.push({ elem, key, value: value.expression });
        } else {
          results.exprs.push(
            t__namespace.expressionStatement(setAttr(attribute, elem, key, value.expression))
          );
        }
      } else {
        results.exprs.push(t__namespace.expressionStatement(setAttr(attribute, elem, key, value)));
      }
    });
  if (spreadExpr) results.exprs.push(spreadExpr);
  if (!hasChildren && children) {
    path.node.children.push(children);
  }
}

function setAttr(path, elem, name, value, { prevId } = {}) {
  if (!value) value = t__namespace.booleanLiteral(true);
  return t__namespace.callExpression(
    registerImportMethod(path, "setProp", getRendererConfig(path, "universal").moduleName),
    prevId ? [elem, t__namespace.stringLiteral(name), value, prevId] : [elem, t__namespace.stringLiteral(name), value]
  );
}

function transformChildren(path, results) {
  const filteredChildren = filterChildren(path.get("children")),
    multi = checkLength(filteredChildren),
    childNodes = filteredChildren.map(transformNode).reduce((memo, child) => {
      if (!child) return memo;
      const i = memo.length;
      if (child.text && i && memo[i - 1].text) {
        memo[i - 1].template += child.template;
      } else memo.push(child);
      return memo;
    }, []);

  const appends = [];
  childNodes.forEach((child, index) => {
    if (!child) return;
    if (child.tagName && child.renderer !== "universal") {
      throw new Error(`<${child.tagName}> is not supported in <${getTagName(path.node)}>.
        Wrap the usage with a component that would render this element, eg. Canvas`);
    }
    if (child.id) {
      let insertNode = registerImportMethod(
        path,
        "insertNode",
        getRendererConfig(path, "universal").moduleName
      );
      let insert = child.id;
      if (child.text) {
        let createTextNode = registerImportMethod(
          path,
          "createTextNode",
          getRendererConfig(path, "universal").moduleName
        );
        if (multi) {
          results.decl.push(
            t__namespace.variableDeclarator(
              child.id,
              t__namespace.callExpression(createTextNode, [
                t__namespace.templateLiteral([t__namespace.templateElement({ raw: child.template })], [])
              ])
            )
          );
        } else
          insert = t__namespace.callExpression(createTextNode, [
            t__namespace.templateLiteral([t__namespace.templateElement({ raw: child.template })], [])
          ]);
      }
      appends.push(t__namespace.expressionStatement(t__namespace.callExpression(insertNode, [results.id, insert])));
      results.decl.push(...child.decl);
      results.exprs.push(...child.exprs);
      results.dynamics.push(...child.dynamics);
    } else if (child.exprs.length) {
      let insert = registerImportMethod(
        path,
        "insert",
        getRendererConfig(path, "universal").moduleName
      );
      if (multi) {
        results.exprs.push(
          t__namespace.expressionStatement(
            t__namespace.callExpression(insert, [
              results.id,
              child.exprs[0],
              nextChild(childNodes, index) || t__namespace.nullLiteral()
            ])
          )
        );
      } else {
        results.exprs.push(
          t__namespace.expressionStatement(t__namespace.callExpression(insert, [results.id, child.exprs[0]]))
        );
      }
    }
  });
  results.exprs.unshift(...appends);
}

function nextChild(children, index) {
  return children[index + 1] && (children[index + 1].id || nextChild(children, index + 1));
}

function processSpreads(path, attributes, { elem, hasChildren, wrapConditionals }) {
  // TODO: skip but collect the names of any properties after the last spread to not overwrite them
  const filteredAttributes = [];
  const spreadArgs = [];
  let runningObject = [];
  let dynamicSpread = false;
  let firstSpread = false;
  attributes.forEach(attribute => {
    const node = attribute.node;
    const key =
      !t__namespace.isJSXSpreadAttribute(node) &&
      (t__namespace.isJSXNamespacedName(node.name)
        ? `${node.name.namespace.name}:${node.name.name.name}`
        : node.name.name);
    if (t__namespace.isJSXSpreadAttribute(node)) {
      firstSpread = true;
      if (runningObject.length) {
        spreadArgs.push(t__namespace.objectExpression(runningObject));
        runningObject = [];
      }
      spreadArgs.push(
        isDynamic(attribute.get("argument"), {
          checkMember: true
        }) && (dynamicSpread = true)
          ? t__namespace.isCallExpression(node.argument) &&
            !node.argument.arguments.length &&
            !t__namespace.isCallExpression(node.argument.callee) &&
            !t__namespace.isMemberExpression(node.argument.callee)
            ? node.argument.callee
            : t__namespace.arrowFunctionExpression([], node.argument)
          : node.argument
      );
    } else if (
      (firstSpread ||
        (t__namespace.isJSXExpressionContainer(node.value) &&
          isDynamic(attribute.get("value").get("expression"), { checkMember: true }))) &&
      canNativeSpread(key)
    ) {
      const isContainer = t__namespace.isJSXExpressionContainer(node.value);
      const dynamic =
        isContainer && isDynamic(attribute.get("value").get("expression"), { checkMember: true });
      if (dynamic) {
        const id = convertJSXIdentifier(node.name);
        let expr =
          wrapConditionals &&
          (t__namespace.isLogicalExpression(node.value.expression) || t__namespace.isConditionalExpression(node.value.expression))
            ? transformCondition(attribute.get("value").get("expression"), true)
            : t__namespace.arrowFunctionExpression([], node.value.expression);
        runningObject.push(
          t__namespace.objectMethod(
            "get",
            id,
            [],
            t__namespace.blockStatement([t__namespace.returnStatement(expr.body)]),
            !t__namespace.isValidIdentifier(key)
          )
        );
      } else {
        runningObject.push(
          t__namespace.objectProperty(
            t__namespace.stringLiteral(key),
            isContainer ? node.value.expression : node.value || t__namespace.booleanLiteral(true)
          )
        );
      }
    } else filteredAttributes.push(attribute);
  });

  if (runningObject.length) {
    spreadArgs.push(t__namespace.objectExpression(runningObject));
  }

  const props =
    spreadArgs.length === 1 && !dynamicSpread
      ? spreadArgs[0]
      : t__namespace.callExpression(registerImportMethod(path, "mergeProps"), spreadArgs);

  return [
    filteredAttributes,
    t__namespace.expressionStatement(
      t__namespace.callExpression(
        registerImportMethod(path, "spread", getRendererConfig(path, "universal").moduleName),
        [elem, props, t__namespace.booleanLiteral(hasChildren)]
      )
    )
  ];
}

function createTemplate(path, result, wrap) {
  const config = getConfig(path);
  if (result.id) {
    result.decl = t__namespace.variableDeclaration("const", result.decl);
    if (
      !(result.exprs.length || result.dynamics.length || result.postExprs.length) &&
      result.decl.declarations.length === 1
    ) {
      return result.decl.declarations[0].init;
    } else {
      return t__namespace.callExpression(
        t__namespace.arrowFunctionExpression(
          [],
          t__namespace.blockStatement([
            result.decl,
            ...result.exprs.concat(
              wrapDynamics(path, result.dynamics) || [],
              result.postExprs || []
            ),
            t__namespace.returnStatement(result.id)
          ])
        ),
        []
      );
    }
  }
  if (wrap && result.dynamic && config.memoWrapper) {
    return t__namespace.callExpression(registerImportMethod(path, config.memoWrapper), [result.exprs[0]]);
  }
  return result.exprs[0];
}

function wrapDynamics(path, dynamics) {
  if (!dynamics.length) return;
  const config = getConfig(path);

  const effectWrapperId = registerImportMethod(path, config.effectWrapper);

  if (dynamics.length === 1) {
    const prevValue = t__namespace.identifier("_$p");

    return t__namespace.expressionStatement(
      t__namespace.callExpression(effectWrapperId, [
        t__namespace.arrowFunctionExpression(
          [prevValue],
          setAttr(path, dynamics[0].elem, dynamics[0].key, dynamics[0].value, {
            dynamic: true,
            prevId: prevValue
          })
        )
      ])
    );
  }
  const decls = [],
    statements = [],
    identifiers = [],
    prevId = t__namespace.identifier("_p$");
  dynamics.forEach(({ elem, key, value }) => {
    const identifier = path.scope.generateUidIdentifier("v$");
    identifiers.push(identifier);
    decls.push(t__namespace.variableDeclarator(identifier, value));
    const prev = t__namespace.memberExpression(prevId, identifier);
    statements.push(
      t__namespace.expressionStatement(
        t__namespace.logicalExpression(
          "&&",
          t__namespace.binaryExpression("!==", identifier, t__namespace.memberExpression(prevId, identifier)),
          t__namespace.assignmentExpression("=", t__namespace.memberExpression(prevId, identifier), setAttr(
            path,
            elem,
            key,
            identifier,
            { dynamic: true, prevId: prev }
          ))
        )
      )
    );
  });

  return t__namespace.expressionStatement(
    t__namespace.callExpression(effectWrapperId, [
      t__namespace.arrowFunctionExpression(
        [prevId],
        t__namespace.blockStatement([
          t__namespace.variableDeclaration("const", decls),
          ...statements,
          t__namespace.returnStatement(prevId)
        ])
      ),
      t__namespace.objectExpression(identifiers.map(id => t__namespace.objectProperty(id, t__namespace.identifier("undefined"))))
    ])
  );
}

function convertComponentIdentifier(node) {
  if (t__namespace.isJSXIdentifier(node)) {
    if (t__namespace.isValidIdentifier(node.name)) node.type = "Identifier";
    else return t__namespace.stringLiteral(node.name);
  } else if (t__namespace.isJSXMemberExpression(node)) {
    const prop = convertComponentIdentifier(node.property);
    const computed = t__namespace.isStringLiteral(prop);
    return t__namespace.memberExpression(convertComponentIdentifier(node.object), prop, computed);
  }

  return node;
}

function transformComponent(path) {
  let exprs = [],
    config = getConfig(path),
    tagId = convertComponentIdentifier(path.node.openingElement.name),
    props = [],
    runningObject = [],
    dynamicSpread = false,
    hasChildren = path.node.children.length > 0;

  if (config.builtIns.indexOf(tagId.name) > -1 && !path.scope.hasBinding(tagId.name)) {
    const newTagId = registerImportMethod(path, tagId.name);
    tagId.name = newTagId.name;
  }

  path
    .get("openingElement")
    .get("attributes")
    .forEach(attribute => {
      const node = attribute.node;
      if (t__namespace.isJSXSpreadAttribute(node)) {
        if (runningObject.length) {
          props.push(t__namespace.objectExpression(runningObject));
          runningObject = [];
        }
        props.push(
          isDynamic(attribute.get("argument"), {
            checkMember: true
          }) && (dynamicSpread = true)
            ? t__namespace.isCallExpression(node.argument) &&
              !node.argument.arguments.length &&
              !t__namespace.isCallExpression(node.argument.callee) &&
              !t__namespace.isMemberExpression(node.argument.callee)
              ? node.argument.callee
              : t__namespace.arrowFunctionExpression([], node.argument)
            : node.argument
        );
      } else {
        const value = node.value || t__namespace.booleanLiteral(true),
          id = convertJSXIdentifier(node.name),
          key = id.name;
        if (hasChildren && key === "children") return;
        if (t__namespace.isJSXExpressionContainer(value))
          if (key === "ref") {
            if (config.generate === "ssr") return;
            // Normalize expressions for non-null and type-as
            while (
              t__namespace.isTSNonNullExpression(value.expression) ||
              t__namespace.isTSAsExpression(value.expression)
            ) {
              value.expression = value.expression.expression;
            }
            let binding,
              isFunction =
                t__namespace.isIdentifier(value.expression) &&
                (binding = path.scope.getBinding(value.expression.name)) &&
                binding.kind === "const";
            if (!isFunction && t__namespace.isLVal(value.expression)) {
              const refIdentifier = path.scope.generateUidIdentifier("_ref$");
              runningObject.push(
                t__namespace.objectMethod(
                  "method",
                  t__namespace.identifier("ref"),
                  [t__namespace.identifier("r$")],
                  t__namespace.blockStatement([
                    t__namespace.variableDeclaration("const", [
                      t__namespace.variableDeclarator(refIdentifier, value.expression)
                    ]),
                    t__namespace.expressionStatement(
                      t__namespace.conditionalExpression(
                        t__namespace.binaryExpression(
                          "===",
                          t__namespace.unaryExpression("typeof", refIdentifier),
                          t__namespace.stringLiteral("function")
                        ),
                        t__namespace.callExpression(refIdentifier, [t__namespace.identifier("r$")]),
                        t__namespace.assignmentExpression("=", value.expression, t__namespace.identifier("r$"))
                      )
                    )
                  ])
                )
              );
            } else if (isFunction || t__namespace.isFunction(value.expression)) {
              runningObject.push(t__namespace.objectProperty(t__namespace.identifier("ref"), value.expression));
            } else if (t__namespace.isCallExpression(value.expression)) {
              const refIdentifier = path.scope.generateUidIdentifier("_ref$");
              runningObject.push(
                t__namespace.objectMethod(
                  "method",
                  t__namespace.identifier("ref"),
                  [t__namespace.identifier("r$")],
                  t__namespace.blockStatement([
                    t__namespace.variableDeclaration("const", [
                      t__namespace.variableDeclarator(refIdentifier, value.expression)
                    ]),
                    t__namespace.expressionStatement(
                      t__namespace.logicalExpression(
                        "&&",
                        t__namespace.binaryExpression(
                          "===",
                          t__namespace.unaryExpression("typeof", refIdentifier),
                          t__namespace.stringLiteral("function")
                        ),
                        t__namespace.callExpression(refIdentifier, [t__namespace.identifier("r$")])
                      )
                    )
                  ])
                )
              );
            }
          } else if (
            isDynamic(attribute.get("value").get("expression"), {
              checkMember: true,
              checkTags: true
            })
          ) {
            let expr =
              config.wrapConditionals &&
              config.generate !== "ssr" &&
              (t__namespace.isLogicalExpression(value.expression) ||
                t__namespace.isConditionalExpression(value.expression))
                ? transformCondition$1(attribute.get("value").get("expression"), true)
                : t__namespace.arrowFunctionExpression([], value.expression);
            runningObject.push(
              t__namespace.objectMethod(
                "get",
                id,
                [],
                t__namespace.blockStatement([t__namespace.returnStatement(expr.body)]),
                !t__namespace.isValidIdentifier(key)
              )
            );
          } else runningObject.push(t__namespace.objectProperty(id, value.expression));
        else runningObject.push(t__namespace.objectProperty(id, value));
      }
    });

  const childResult = transformComponentChildren(path.get("children"), config);
  if (childResult && childResult[0]) {
    if (childResult[1]) {
      const body =
        t__namespace.isCallExpression(childResult[0]) && t__namespace.isFunction(childResult[0].arguments[0])
          ? childResult[0].arguments[0].body
          : childResult[0].body ? childResult[0].body : childResult[0];
      runningObject.push(
        t__namespace.objectMethod(
          "get",
          t__namespace.identifier("children"),
          [],
          t__namespace.isExpression(body) ? t__namespace.blockStatement([t__namespace.returnStatement(body)]) : body
        )
      );
    } else runningObject.push(t__namespace.objectProperty(t__namespace.identifier("children"), childResult[0]));
  }
  if (runningObject.length || !props.length) props.push(t__namespace.objectExpression(runningObject));

  if (props.length > 1 || dynamicSpread) {
    props = [t__namespace.callExpression(registerImportMethod(path, "mergeProps"), props)];
  }
  const componentArgs = [tagId, props[0]];
  exprs.push(t__namespace.callExpression(registerImportMethod(path, "createComponent"), componentArgs));

  // handle hoisting conditionals
  if (exprs.length > 1) {
    const ret = exprs.pop();
    exprs = [
      t__namespace.callExpression(
        t__namespace.arrowFunctionExpression([], t__namespace.blockStatement([...exprs, t__namespace.returnStatement(ret)])),
        []
      )
    ];
  }
  return { exprs, template: "", component: true };
}

function transformComponentChildren(children, config) {
  const filteredChildren = filterChildren(children);
  if (!filteredChildren.length) return;
  let dynamic = false;

  let transformedChildren = filteredChildren.reduce((memo, path) => {
    if (t__namespace.isJSXText(path.node)) {
      const v = htmlEntities.decode(trimWhitespace(path.node.extra.raw));
      if (v.length) memo.push(t__namespace.stringLiteral(v));
    } else {
      const child = transformNode(path, {
        topLevel: true,
        componentChild: true
      });
      dynamic = dynamic || child.dynamic;
      if (
        config.generate === "ssr" &&
        filteredChildren.length > 1 &&
        child.dynamic &&
        t__namespace.isFunction(child.exprs[0])
      ) {
        child.exprs[0] = child.exprs[0].body;
      }
      memo.push(getCreateTemplate(config, path, child)(path, child, filteredChildren.length > 1));
    }
    return memo;
  }, []);

  if (transformedChildren.length === 1) {
    transformedChildren = transformedChildren[0];
    if (
      !t__namespace.isJSXExpressionContainer(filteredChildren[0]) &&
      !t__namespace.isJSXSpreadChild(filteredChildren[0]) &&
      !t__namespace.isJSXText(filteredChildren[0])
    ) {
      transformedChildren =
        t__namespace.isCallExpression(transformedChildren) &&
        !transformedChildren.arguments.length &&
        !t__namespace.isIdentifier(transformedChildren.callee)
          ? transformedChildren.callee
          : t__namespace.arrowFunctionExpression([], transformedChildren);
      dynamic = true;
    }
  } else {
    transformedChildren = t__namespace.arrowFunctionExpression([], t__namespace.arrayExpression(transformedChildren));
    dynamic = true;
  }
  return [transformedChildren, dynamic];
}

function transformFragmentChildren(children, results, config) {
  const filteredChildren = filterChildren(children),
    childNodes = filteredChildren.reduce((memo, path) => {
      if (t__namespace.isJSXText(path.node)) {
        const v = htmlEntities.decode(trimWhitespace(path.node.extra.raw));
        if (v.length) memo.push(t__namespace.stringLiteral(v));
      } else {
        const child = transformNode(path, { topLevel: true, fragmentChild: true });
        memo.push(getCreateTemplate(config, path, child)(path, child, true));
      }
      return memo;
    }, []);
  results.exprs.push(childNodes.length === 1 ? childNodes[0] : t__namespace.arrayExpression(childNodes));
}

function transformJSX(path) {
  const config = getConfig(path);
  const replace = transformThis(path);
  const result = transformNode(
    path,
    t__namespace.isJSXFragment(path.node)
      ? {}
      : {
          topLevel: true
        }
  );

  const template = getCreateTemplate(config, path, result);

  path.replaceWith(replace(template(path, result, false)));
}

function transformThis(path) {
  let thisId;
  path.traverse({
    ThisExpression(path) {
      thisId || (thisId = path.scope.generateUidIdentifier("self$"));
      path.replaceWith(thisId);
    }
  });
  return node => {
    if (thisId) {
      let parent = path.getStatementParent();
      const decl = t__namespace.variableDeclaration("const", [
        t__namespace.variableDeclarator(thisId, t__namespace.thisExpression())
      ]);
      parent.insertBefore(decl);
    }
    return node;
  };
}

function transformNode(path, info = {}) {
  const config = getConfig(path);
  const node = path.node;
  let staticValue;
  if (t__namespace.isJSXElement(node)) {
    return transformElement(config, path, info);
  } else if (t__namespace.isJSXFragment(node)) {
    let results = { template: "", decl: [], exprs: [], dynamics: [] };
    // <><div /><Component /></>
    transformFragmentChildren(path.get("children"), results, config);
    return results;
  } else if (t__namespace.isJSXText(node) || (staticValue = getStaticExpression(path))) {
    const text =
      staticValue !== undefined
        ? !info.doNotEscape
          ? escapeHTML(staticValue.toString())
          : staticValue.toString()
        : trimWhitespace(node.extra.raw);
    if (!text.length) return null;
    const results = {
      template: config.generate === "ssr" ? text : escapeBackticks(text),
      decl: [],
      exprs: [],
      dynamics: [],
      postExprs: [],
      text: true
    };
    if (!info.skipId && config.generate !== "ssr")
      results.id = path.scope.generateUidIdentifier("el$");
    return results;
  } else if (t__namespace.isJSXExpressionContainer(node)) {
    if (t__namespace.isJSXEmptyExpression(node.expression)) return null;
    if (
      !isDynamic(path.get("expression"), {
        checkMember: true,
        checkTags: !!info.componentChild,
        native: !info.componentChild
      })
    ) {
      return { exprs: [node.expression], template: "" };
    }
    const expr =
      config.wrapConditionals &&
      config.generate !== "ssr" &&
      (t__namespace.isLogicalExpression(node.expression) || t__namespace.isConditionalExpression(node.expression))
        ? transformCondition$1(path.get("expression"), info.componentChild)
        : !info.componentChild &&
          (config.generate !== "ssr" || info.fragmentChild) &&
          t__namespace.isCallExpression(node.expression) &&
          !t__namespace.isMemberExpression(node.expression.callee) &&
          node.expression.arguments.length === 0
        ? node.expression.callee
        : t__namespace.arrowFunctionExpression([], node.expression);
    return {
      exprs:
        expr.length > 1
          ? [
              t__namespace.callExpression(
                t__namespace.arrowFunctionExpression(
                  [],
                  t__namespace.blockStatement([expr[0], t__namespace.returnStatement(expr[1])])
                ),
                []
              )
            ]
          : [expr],
      template: "",
      dynamic: true
    };
  } else if (t__namespace.isJSXSpreadChild(node)) {
    if (
      !isDynamic(path.get("expression"), {
        checkMember: true,
        native: !info.componentChild
      })
    )
      return { exprs: [node.expression], template: "" };
    const expr = t__namespace.arrowFunctionExpression([], node.expression);
    return {
      exprs: [expr],
      template: "",
      dynamic: true
    };
  }
}

function getCreateTemplate(config, path, result) {
  if ((result.tagName && result.renderer === "dom") || config.generate === "dom") {
    return createTemplate$2;
  }

  if (result.renderer === "ssr" || config.generate === "ssr") {
    return createTemplate$1;
  }

  return createTemplate;
}

function transformElement(config, path, info = {}) {
  const node = path.node;
  let tagName = getTagName(node);
  // <Component ...></Component>
  if (isComponent(tagName)) return transformComponent(path);

  // <div ...></div>
  // const element = getTransformElemet(config, path, tagName);

  let tagRenderer;
  for (var renderer of config.renderers ?? []) {
    if (renderer.elements.indexOf(tagName) !== -1) {
      tagRenderer = renderer;
      break;
    }
  }

  if (tagRenderer?.name === "dom" || getConfig(path).generate === "dom") {
    return transformElement$3(path, info);
  }

  if (getConfig(path).generate === "ssr") {
    return transformElement$2(path, info);
  }

  return transformElement$1(path);
}

// add to the top/bottom of the module.
var postprocess = path => {
  if (path.scope.data.events) {
    path.node.body.push(
      t__namespace.expressionStatement(
        t__namespace.callExpression(
          registerImportMethod(path, "delegateEvents", getRendererConfig(path, "dom").moduleName),
          [t__namespace.arrayExpression(Array.from(path.scope.data.events).map(e => t__namespace.stringLiteral(e)))]
        )
      )
    );
  }
  if (path.scope.data.templates?.length) {
    let domTemplates = path.scope.data.templates.filter(temp => temp.renderer === "dom");
    let ssrTemplates = path.scope.data.templates.filter(temp => temp.renderer === "ssr");
    domTemplates.length > 0 && appendTemplates$1(path, domTemplates);
    ssrTemplates.length > 0 && appendTemplates(path, ssrTemplates);
  }
};

var config = {
  moduleName: "dom",
  generate: "dom",
  hydratable: false,
  delegateEvents: true,
  delegatedEvents: [],
  builtIns: [],
  requireImportSource: false,
  wrapConditionals: true,
  contextToCustomElements: false,
  staticMarker: "@once",
  effectWrapper: "effect",
  memoWrapper: "memo"
};

var preprocess = (path, { opts })  => {
  const merged = path.hub.file.metadata.config = Object.assign({}, config, opts);
  const lib = merged.requireImportSource;
  if (lib) {
    const comments = path.hub.file.ast.comments;
    for(let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const index = comment.value.indexOf("@jsxImportSource");
      if (index > -1 && comment.value.slice(index).includes(lib)) return;
    }
    path.skip();
  }
};

var index = () => {
  return {
    name: "JSX DOM Expressions",
    inherits: SyntaxJSX__default["default"],
    visitor: {
      JSXElement: transformJSX,
      JSXFragment: transformJSX,
      Program: {
        enter: preprocess,
        exit: postprocess
      }
    }
  };
};

module.exports = index;

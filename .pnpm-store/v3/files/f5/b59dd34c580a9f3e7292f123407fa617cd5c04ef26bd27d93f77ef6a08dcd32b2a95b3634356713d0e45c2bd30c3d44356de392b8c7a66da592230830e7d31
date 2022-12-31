'use strict';

var web = require('solid-js/web');

const tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;
const attrRE = /(?:\s(?<boolean>[^/\s><=]+?)(?=[\s/>]))|(?:(?<name>\S+?)(?:\s*=\s*(?:(['"])(?<quotedValue>[\s\S]*?)\3|(?<unquotedValue>[^\s>]+))))/g;
const lookup = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  menuitem: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};
function parseTag(
tag) {
  const res = {
    type: 'tag',
    name: '',
    voidElement: false,
    attrs: {},
    children: []
  };
  const tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
  if (tagMatch) {
    res.name = tagMatch[1];
    if (lookup[tagMatch[1].toLowerCase()] || tag.charAt(tag.length - 2) === '/') {
      res.voidElement = true;
    }
    if (res.name.startsWith('!--')) {
      const endIndex = tag.indexOf('-->');
      return {
        type: 'comment',
        comment: endIndex !== -1 ? tag.slice(4, endIndex) : ''
      };
    }
  }
  const reg = new RegExp(attrRE);
  for (const match of tag.matchAll(reg)) {
    res.attrs[match[1] || match[2]] = match[4] || match[5] || '';
  }
  return res;
}
function pushTextNode(list, html, start) {
  const end = html.indexOf('<', start);
  const content = html.slice(start, end === -1 ? void 0 : end);
  if (!/^\s*$/.test(content)) {
    list.push({
      type: 'text',
      content: content
    });
  }
}
function pushCommentNode(list, tag) {
  const content = tag.replace('<!--', '').replace('-->', '');
  if (!/^\s*$/.test(content)) {
    list.push({
      type: 'comment',
      content: content
    });
  }
}
function parse(html) {
  const result = [];
  let current = void 0;
  let level = -1;
  const arr = [];
  const byTag = {};
  html.replace(tagRE, (tag, index) => {
    const isOpen = tag.charAt(1) !== '/';
    const isComment = tag.slice(0, 4) === '<!--';
    const start = index + tag.length;
    const nextChar = html.charAt(start);
    let parent = void 0;
    if (isOpen && !isComment) {
      level++;
      current = parseTag(tag);
      if (!current.voidElement && nextChar && nextChar !== '<') {
        pushTextNode(current.children, html, start);
      }
      byTag[current.tagName] = current;
      if (level === 0) {
        result.push(current);
      }
      parent = arr[level - 1];
      if (parent) {
        parent.children.push(current);
      }
      arr[level] = current;
    }
    if (isComment) {
      if (level < 0) {
        pushCommentNode(result, tag);
      } else {
        pushCommentNode(arr[level].children, tag);
      }
    }
    if (isComment || !isOpen || current.voidElement) {
      if (!isComment) {
        level--;
      }
      if (nextChar !== '<' && nextChar) {
        parent = level === -1 ? result : arr[level].children;
        pushTextNode(parent, html, start);
      }
    }
  });
  return result;
}
function attrString(attrs) {
  const buff = [];
  for (const key in attrs) {
    buff.push(key + '="' + attrs[key].replace(/"/g, '&quot;') + '"');
  }
  if (!buff.length) {
    return '';
  }
  return ' ' + buff.join(' ');
}
function stringifier(buff, doc) {
  switch (doc.type) {
    case 'text':
      return buff + doc.content;
    case 'tag':
      buff += '<' + doc.name + (doc.attrs ? attrString(doc.attrs) : '') + (doc.voidElement ? '/>' : '>');
      if (doc.voidElement) {
        return buff;
      }
      return buff + doc.children.reduce(stringifier, '') + '</' + doc.name + '>';
    case 'comment':
      return buff += '<!--' + doc.content + '-->';
  }
}
function stringify(doc) {
  return doc.reduce(function (token, rootEl) {
    return token + stringifier('', rootEl);
  }, '');
}
const cache = new Map();
const VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;
const spaces = " \\f\\n\\r\\t";
const almostEverything = "[^ " + spaces + "\\/>\"'=]+";
const attrName = "[ " + spaces + "]+" + almostEverything;
const tagName = "<([A-Za-z$#]+[A-Za-z0-9:_-]*)((?:";
const attrPartials = "(?:\\s*=\\s*(?:'[^']*?'|\"[^\"]*?\"|\\([^)]*?\\)|<[^>]*?>|" + almostEverything + "))?)";
const attrSeeker = new RegExp(tagName + attrName + attrPartials + "+)([ " + spaces + "]*/?>)", "g");
const findAttributes = new RegExp("(" + attrName + "\\s*=\\s*)(<!--#-->|['\"(]([\\w\\s]*<!--#-->[\\w\\s]*)*['\")])", "gi");
const selfClosing = new RegExp(tagName + attrName + attrPartials + "*)([ " + spaces + "]*/>)", "g");
const marker = "<!--#-->";
const reservedNameSpaces = new Set(["class", "on", "oncapture", "style", "use", "prop", "attr"]);
function attrReplacer($0, $1, $2, $3) {
  return "<" + $1 + $2.replace(findAttributes, replaceAttributes) + $3;
}
function replaceAttributes($0, $1, $2) {
  return $1 + ($2[0] === '"' || $2[0] === "'" ? $2.replace(/<!--#-->/g, "###") : '"###"');
}
function fullClosing($0, $1, $2) {
  return VOID_ELEMENTS.test($1) ? $0 : "<" + $1 + $2 + "></" + $1 + ">";
}
function toPropertyName(name) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}
function createHTML(r, {
  delegateEvents = true
} = {}) {
  let uuid = 1;
  r.wrapProps = props => {
    const d = Object.getOwnPropertyDescriptors(props);
    for (const k in d) {
      if (typeof d[k].value === "function" && !d[k].value.length) r.dynamicProperty(props, k);
    }
    return props;
  };
  function createTemplate(statics) {
    let i = 0,
        markup = "";
    for (; i < statics.length - 1; i++) {
      markup = markup + statics[i] + "<!--#-->";
    }
    markup = markup + statics[i];
    markup = markup.replace(selfClosing, fullClosing).replace(/<(<!--#-->)/g, "<###").replace(/\.\.\.(<!--#-->)/g, "###").replace(attrSeeker, attrReplacer).replace(/>\n+\s*/g, ">").replace(/\n+\s*</g, "<").replace(/\s+</g, " <").replace(/>\s+/g, "> ");
    const [html, code] = parseTemplate(parse(markup)),
          templates = [];
    for (let i = 0; i < html.length; i++) {
      templates.push(document.createElement("template"));
      templates[i].innerHTML = html[i];
      const nomarkers = templates[i].content.querySelectorAll("script,style");
      for (let j = 0; j < nomarkers.length; j++) {
        const d = nomarkers[j].firstChild?.data || "";
        if (d.indexOf(marker) > -1) {
          const parts = d.split(marker).reduce((memo, p, i) => {
            i && memo.push("");
            memo.push(p);
            return memo;
          }, []);
          nomarkers[i].firstChild.replaceWith(...parts);
        }
      }
    }
    templates[0].create = code;
    cache.set(statics, templates);
    return templates;
  }
  function parseKeyValue(tag, name, value, isSVG, isCE, options) {
    let expr = value === "###" ? `!doNotWrap ? exprs[${options.counter}]() : exprs[${options.counter++}]` : value.split("###").map((v, i) => i ? ` + (typeof exprs[${options.counter}] === "function" ? exprs[${options.counter}]() : exprs[${options.counter++}]) + "${v}"` : `"${v}"`).join(""),
        parts,
        namespace;
    if ((parts = name.split(":")) && parts[1] && reservedNameSpaces.has(parts[0])) {
      name = parts[1];
      namespace = parts[0];
    }
    const isChildProp = r.ChildProperties.has(name);
    const isProp = r.Properties.has(name);
    if (name === "style") {
      const prev = `_$v${uuid++}`;
      options.decl.push(`${prev}={}`);
      options.exprs.push(`r.style(${tag},${expr},${prev})`);
    } else if (name === "classList") {
      const prev = `_$v${uuid++}`;
      options.decl.push(`${prev}={}`);
      options.exprs.push(`r.classList(${tag},${expr},${prev})`);
    } else if (namespace !== "attr" && (isChildProp || !isSVG && (r.PropAliases[name] || isProp) || isCE || namespace === "prop")) {
      if (isCE && !isChildProp && !isProp && namespace !== "prop") name = toPropertyName(name);
      options.exprs.push(`${tag}.${r.PropAliases[name] || name} = ${expr}`);
    } else {
      const ns = isSVG && name.indexOf(":") > -1 && r.SVGNamespace[name.split(":")[0]];
      if (ns) options.exprs.push(`r.setAttributeNS(${tag},"${ns}","${name}",${expr})`);else options.exprs.push(`r.setAttribute(${tag},"${r.Aliases[name] || name}",${expr})`);
    }
  }
  function parseAttribute(tag, name, value, isSVG, isCE, options) {
    if (name.slice(0, 2) === "on") {
      if (!name.includes(":")) {
        const lc = name.slice(2).toLowerCase();
        const delegate = delegateEvents && r.DelegatedEvents.has(lc);
        options.exprs.push(`r.addEventListener(${tag},"${lc}",exprs[${options.counter++}],${delegate})`);
        delegate && options.delegatedEvents.add(lc);
      } else {
        let capture = name.startsWith("oncapture:");
        options.exprs.push(`${tag}.addEventListener("${name.slice(capture ? 10 : 3)}",exprs[${options.counter++}]${capture ? ",true" : ""})`);
      }
    } else if (name === "ref") {
      options.exprs.push(`exprs[${options.counter++}](${tag})`);
    } else {
      const childOptions = Object.assign({}, options, {
        exprs: []
      }),
            count = options.counter;
      parseKeyValue(tag, name, value, isSVG, isCE, childOptions);
      options.decl.push(`_fn${count} = (${value === "###" ? "doNotWrap" : ""}) => {\n${childOptions.exprs.join(";\n")};\n}`);
      if (value === "###") {
        options.exprs.push(`typeof exprs[${count}] === "function" ? r.effect(_fn${count}) : _fn${count}(true)`);
      } else {
        let check = "";
        for (let i = count; i < childOptions.counter; i++) {
          i !== count && (check += " || ");
          check += `typeof exprs[${i}] === "function"`;
        }
        options.exprs.push(check + ` ? r.effect(_fn${count}) : _fn${count}()`);
      }
      options.counter = childOptions.counter;
      options.wrap = false;
    }
  }
  function processChildren(node, options) {
    const childOptions = Object.assign({}, options, {
      first: true,
      multi: false,
      parent: options.path
    });
    if (node.children.length > 1) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "comment" && child.content === "#" || child.type === "tag" && child.name === "###") {
          childOptions.multi = true;
          break;
        }
      }
    }
    let i = 0;
    while (i < node.children.length) {
      const child = node.children[i];
      if (child.name === "###") {
        if (childOptions.multi) {
          node.children[i] = {
            type: "comment",
            content: "#"
          };
          i++;
        } else node.children.splice(i, 1);
        processComponent(child, childOptions);
        continue;
      }
      parseNode(child, childOptions);
      i++;
    }
    options.counter = childOptions.counter;
    options.templateId = childOptions.templateId;
    options.hasCustomElement = options.hasCustomElement || childOptions.hasCustomElement;
  }
  function processComponentProps(propGroups) {
    let result = [];
    for (const props of propGroups) {
      if (Array.isArray(props)) {
        if (!props.length) continue;
        result.push(`r.wrapProps({${props.join(",") || ""}})`);
      } else result.push(props);
    }
    return result.length > 1 ? `r.mergeProps(${result.join(",")})` : result[0];
  }
  function processComponent(node, options) {
    let props = [];
    const keys = Object.keys(node.attrs),
          propGroups = [props],
          componentIdentifier = options.counter++;
    for (let i = 0; i < keys.length; i++) {
      const name = keys[i],
            value = node.attrs[name];
      if (name === "###") {
        propGroups.push(`exprs[${options.counter++}]`);
        propGroups.push(props = []);
      } else if (value === "###") {
        props.push(`${name}: exprs[${options.counter++}]`);
      } else props.push(`${name}: "${value}"`);
    }
    if (node.children.length === 1 && node.children[0].type === "comment" && node.children[0].content === "#") {
      props.push(`children: () => exprs[${options.counter++}]`);
    } else if (node.children.length) {
      const children = {
        type: "fragment",
        children: node.children
      },
            childOptions = Object.assign({}, options, {
        first: true,
        decl: [],
        exprs: [],
        parent: false
      });
      parseNode(children, childOptions);
      props.push(`children: () => { ${childOptions.exprs.join(";\n")}}`);
      options.templateId = childOptions.templateId;
      options.counter = childOptions.counter;
    }
    let tag;
    if (options.multi) {
      tag = `_$el${uuid++}`;
      options.decl.push(`${tag} = ${options.path}.${options.first ? "firstChild" : "nextSibling"}`);
    }
    if (options.parent) options.exprs.push(`r.insert(${options.parent}, r.createComponent(exprs[${componentIdentifier}],${processComponentProps(propGroups)})${tag ? `, ${tag}` : ""})`);else options.exprs.push(`${options.fragment ? "" : "return "}r.createComponent(exprs[${componentIdentifier}],${processComponentProps(propGroups)})`);
    options.path = tag;
    options.first = false;
  }
  function parseNode(node, options) {
    if (node.type === "fragment") {
      const parts = [];
      node.children.forEach(child => {
        if (child.type === "tag") {
          if (child.name === "###") {
            const childOptions = Object.assign({}, options, {
              first: true,
              fragment: true,
              decl: [],
              exprs: []
            });
            processComponent(child, childOptions);
            parts.push(childOptions.exprs[0]);
            options.counter = childOptions.counter;
            options.templateId = childOptions.templateId;
            return;
          }
          options.templateId++;
          const id = uuid;
          const childOptions = Object.assign({}, options, {
            first: true,
            decl: [],
            exprs: []
          });
          options.templateNodes.push([child]);
          parseNode(child, childOptions);
          parts.push(`function() { ${childOptions.decl.join(",\n") + ";\n" + childOptions.exprs.join(";\n") + `;\nreturn _$el${id};\n`}}()`);
          options.counter = childOptions.counter;
          options.templateId = childOptions.templateId;
        } else if (child.type === "text") {
          parts.push(`"${child.content}"`);
        } else if (child.type === "comment" && child.content === "#") {
          parts.push(`exprs[${options.counter++}]`);
        }
      });
      options.exprs.push(`return [${parts.join(", \n")}]`);
    } else if (node.type === "tag") {
      const tag = `_$el${uuid++}`;
      const topDecl = !options.decl.length;
      const templateId = options.templateId;
      options.decl.push(topDecl ? "" : `${tag} = ${options.path}.${options.first ? "firstChild" : "nextSibling"}`);
      const keys = Object.keys(node.attrs);
      const isSVG = r.SVGElements.has(node.name);
      const isCE = node.name.includes("-");
      options.hasCustomElement = isCE;
      if (keys.includes("###")) {
        const spreadArgs = [];
        let current = "";
        for (let i = 0; i < keys.length; i++) {
          const name = keys[i],
                value = node.attrs[name];
          if (value.includes("###")) {
            let count = options.counter++;
            current += `${name}: ${name !== "ref" ? `typeof exprs[${count}] === "function" ? exprs[${count}]() : ` : ""}exprs[${count}],`;
            delete node.attrs[name];
          } else if (name === "###") {
            if (current.length) {
              spreadArgs.push(`()=>({${current}})`);
              current = "";
            }
            spreadArgs.push(`exprs[${options.counter++}]`);
            delete node.attrs[name];
          }
        }
        if (current.length) spreadArgs.push(`()=>({${current}})`);
        options.exprs.push(`r.spread(${tag},${spreadArgs.length === 1 ? `typeof ${spreadArgs[0]} === "function" ? r.mergeProps(${spreadArgs[0]}) : ${spreadArgs[0]}` : `r.mergeProps(${spreadArgs.join(",")})`},${isSVG},${!!node.children.length})`);
      } else {
        for (let i = 0; i < keys.length; i++) {
          const name = keys[i],
                value = node.attrs[name];
          if (value.includes("###")) {
            delete node.attrs[name];
            parseAttribute(tag, name, value, isSVG, isCE, options);
          }
        }
      }
      options.path = tag;
      options.first = false;
      processChildren(node, options);
      if (topDecl) {
        options.decl[0] = options.hasCustomElement ? `const ${tag} = r.untrack(() => document.importNode(tmpls[${templateId}].content.firstChild, true))` : `const ${tag} = tmpls[${templateId}].content.firstChild.cloneNode(true)`;
      }
    } else if (node.type === "text") {
      const tag = `_$el${uuid++}`;
      options.decl.push(`${tag} = ${options.path}.${options.first ? "firstChild" : "nextSibling"}`);
      options.path = tag;
      options.first = false;
    } else if (node.type === "comment") {
      const tag = `_$el${uuid++}`;
      options.decl.push(`${tag} = ${options.path}.${options.first ? "firstChild" : "nextSibling"}`);
      if (node.content === "#") {
        if (options.multi) {
          options.exprs.push(`r.insert(${options.parent}, exprs[${options.counter++}], ${tag})`);
        } else options.exprs.push(`r.insert(${options.parent}, exprs[${options.counter++}])`);
      }
      options.path = tag;
      options.first = false;
    }
  }
  function parseTemplate(nodes) {
    const options = {
      path: "",
      decl: [],
      exprs: [],
      delegatedEvents: new Set(),
      counter: 0,
      first: true,
      multi: false,
      templateId: 0,
      templateNodes: []
    },
          id = uuid,
          origNodes = nodes;
    let toplevel;
    if (nodes.length > 1) {
      nodes = [{
        type: "fragment",
        children: nodes
      }];
    }
    if (nodes[0].name === "###") {
      toplevel = true;
      processComponent(nodes[0], options);
    } else parseNode(nodes[0], options);
    r.delegateEvents(Array.from(options.delegatedEvents));
    const templateNodes = [origNodes].concat(options.templateNodes);
    return [templateNodes.map(t => stringify(t)), new Function("tmpls", "exprs", "r", options.decl.join(",\n") + ";\n" + options.exprs.join(";\n") + (toplevel ? "" : `;\nreturn _$el${id};\n`))];
  }
  function html(statics, ...args) {
    const templates = cache.get(statics) || createTemplate(statics);
    return templates[0].create(templates, args, r);
  }
  return html;
}

var index = createHTML({
  effect: web.effect,
  style: web.style,
  insert: web.insert,
  untrack: web.untrack,
  spread: web.spread,
  createComponent: web.createComponent,
  delegateEvents: web.delegateEvents,
  classList: web.classList,
  mergeProps: web.mergeProps,
  dynamicProperty: web.dynamicProperty,
  setAttribute: web.setAttribute,
  setAttributeNS: web.setAttributeNS,
  addEventListener: web.addEventListener,
  Aliases: web.Aliases,
  PropAliases: web.PropAliases,
  Properties: web.Properties,
  ChildProperties: web.ChildProperties,
  DelegatedEvents: web.DelegatedEvents,
  SVGElements: web.SVGElements,
  SVGNamespace: web.SVGNamespace
});

module.exports = index;

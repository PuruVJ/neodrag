function guard(type) {
    return (node) => node.type === type;
}
export const is = {
    parent(node) {
        return Array.isArray(node.children);
    },
    literal(node) {
        return typeof node.value === 'string';
    },
    tag(node) {
        return node.type === 'element' || node.type === 'custom-element' || node.type === 'component' || node.type === 'fragment';
    },
    whitespace(node) {
        return node.type === 'text' && node.value.trim().length === 0;
    },
    root: guard('root'),
    element: guard('element'),
    customElement: guard('custom-element'),
    component: guard('component'),
    fragment: guard('fragment'),
    expression: guard('expression'),
    text: guard('text'),
    doctype: guard('doctype'),
    comment: guard('comment'),
    frontmatter: guard('frontmatter'),
};
class Walker {
    constructor(callback) {
        this.callback = callback;
    }
    async visit(node, parent, index) {
        await this.callback(node, parent, index);
        if (is.parent(node)) {
            let promises = [];
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                promises.push(this.callback(child, node, i));
            }
            await Promise.all(promises);
        }
    }
}
export function walk(node, callback) {
    const walker = new Walker(callback);
    walker.visit(node);
}
function serializeAttributes(node) {
    let output = '';
    for (const attr of node.attributes) {
        output += ' ';
        switch (attr.kind) {
            case 'empty': {
                output += `${attr.name}`;
                break;
            }
            case 'expression': {
                output += `${attr.name}={${attr.value}}`;
                break;
            }
            case 'quoted': {
                output += `${attr.name}="${attr.value}"`;
                break;
            }
            case 'template-literal': {
                output += `${attr.name}=\`${attr.value}\``;
                break;
            }
            case 'shorthand': {
                output += `{${attr.name}}`;
                break;
            }
            case 'spread': {
                output += `{...${attr.value}}`;
                break;
            }
        }
    }
    return output;
}
export function serialize(root, opts = { selfClose: true }) {
    let output = '';
    function visitor(node) {
        if (is.root(node)) {
            node.children.forEach((child) => visitor(child));
        }
        else if (is.frontmatter(node)) {
            output += `---${node.value}---\n\n`;
        }
        else if (is.comment(node)) {
            output += `<!--${node.value}-->`;
        }
        else if (is.expression(node)) {
            output += `{`;
            node.children.forEach((child) => visitor(child));
            output += `}`;
        }
        else if (is.literal(node)) {
            output += node.value;
        }
        else if (is.tag(node)) {
            output += `<${node.name}`;
            output += serializeAttributes(node);
            if (node.children.length == 0 && opts.selfClose) {
                output += ` />`;
            }
            else {
                output += '>';
                node.children.forEach((child) => visitor(child));
                output += `</${node.name}>`;
            }
        }
    }
    visitor(root);
    return output;
}

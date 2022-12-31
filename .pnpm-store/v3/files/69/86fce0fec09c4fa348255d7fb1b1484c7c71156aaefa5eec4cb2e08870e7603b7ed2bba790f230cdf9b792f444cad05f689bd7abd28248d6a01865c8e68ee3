import { visit } from "unist-util-visit";
export const REGEX_BEGIN = /^\s*:::\s*(\w+)\s*(.*)?/;
export const REGEX_END = /^\s*:::$/;
const DEFAULT_SETTINGS = {
    className: "remark-container",
    containerTag: "div",
    titleElement: {},
    additionalProperties: undefined,
};
const isLiteralNode = (node) => {
    return "value" in node;
};
const isParagraph = (node) => {
    return "paragraph" === node.type;
};
export const plugin = (options) => {
    const settings = Object.assign({}, DEFAULT_SETTINGS, options);
    // Constructs `Parent` node of custom directive which contains given children.
    const constructContainer = (children, className, title) => {
        let properties;
        if (settings.additionalProperties) {
            properties = settings.additionalProperties(className, title ?? "");
        }
        return {
            type: "container",
            children,
            data: {
                hName: settings.containerTag,
                hProperties: {
                    className: [settings.className, className.toLowerCase()],
                    ...(properties && { ...properties }),
                },
            },
        };
    };
    const constructTitle = (title) => {
        return {
            type: "paragraph",
            children: [{ type: "text", value: title }],
            data: {
                hName: "div",
                hProperties: {
                    className: [`${settings.className}__title`],
                    ...(settings.titleElement && { ...settings.titleElement }),
                },
            },
        };
    };
    const transformer = (tree) => {
        visit(tree, (_node, _index, parent) => {
            if (!parent)
                return;
            const children = [];
            const len = parent.children.length;
            // we walk through each children in `parent` to look for custom directive.
            let currentIndex = -1;
            while (currentIndex < len - 1) {
                currentIndex += 1;
                // check if currentIndex of children contains begin node of custom directive
                const currentNode = parent.children[currentIndex];
                children.push(currentNode);
                if (!isParagraph(currentNode))
                    continue;
                // XXX: Consider checking other children in currentNode
                const currentElem = currentNode.children[0];
                if (!isLiteralNode(currentElem))
                    continue;
                const match = currentElem.value.match(REGEX_BEGIN);
                if (!match)
                    continue;
                // Here we're inside of the custom directive. let's find nearest closing directive.
                // remove last element, which is custom directive marker.
                children.pop();
                const beginIndex = currentIndex;
                let innerIndex = currentIndex - 1;
                while (innerIndex < len - 1) {
                    innerIndex += 1;
                    const currentNode = parent.children[innerIndex];
                    if (!isParagraph(currentNode))
                        continue;
                    const currentElem = currentNode.children[0];
                    if (!isLiteralNode(currentElem) ||
                        !currentElem.value.match(REGEX_END))
                        continue;
                    // here we found the closing directive.
                    const [_input, type, title] = match;
                    // remove surrounding `:::` markers and treat rest of them as children of the container
                    const containerChildren = parent.children.slice(beginIndex + 1, innerIndex);
                    // if the title exists and the settings.titleElement is not null, then construct the title div element
                    if (title?.length && settings.titleElement !== null) {
                        containerChildren.splice(0, 0, constructTitle(title));
                    }
                    const container = constructContainer(containerChildren, type.toLowerCase(), title);
                    children.push(container);
                    currentIndex = innerIndex - 1;
                    break;
                }
                currentIndex += 1;
            }
            parent.children = children;
        });
    };
    return transformer;
};
export default plugin;

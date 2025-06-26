import * as t from "@babel/types";
/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
export function buildContent(node) {
    let out = "";
    for (const child of node.children) {
        if (t.isJSXText(child)) {
            const text = child.value.trim();
            if (text)
                out += text;
        }
        else if (t.isJSXElement(child)) {
            const nameNode = child.openingElement.name;
            let name = "Unknown";
            if (t.isJSXIdentifier(nameNode)) {
                name = nameNode.name;
            }
            else if (t.isJSXMemberExpression(nameNode)) {
                name = nameNode.property.name;
            }
            // Recursively build inner content if needed
            const inner = buildContent(child);
            out += `<element:${name}>${inner}</element:${name}>`;
        }
    }
    return out;
}
/**
 * Convert full AST path to a relative scope path
 */
export function getRelativeScopePath(fullPath) {
    // Extract the meaningful part of the path after "program.body"
    const parts = fullPath.split(".");
    const bodyIndex = parts.findIndex((part) => part === "body");
    if (bodyIndex !== -1 && parts[bodyIndex - 1] === "program") {
        // Take everything after "program.body"
        const relativeParts = parts.slice(bodyIndex + 1);
        return relativeParts.join("/").replace(/\[(\d+)\]/g, "$1");
    }
    // Fallback: use the full path but clean it up
    return fullPath.replace(/\[(\d+)\]/g, "$1").replace(/\./g, "/");
}

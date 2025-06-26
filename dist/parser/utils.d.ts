import * as t from "@babel/types";
/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
export declare function buildContent(node: t.JSXElement): string;
/**
 * Convert full AST path to a relative scope path
 */
export declare function getRelativeScopePath(fullPath: string): string;

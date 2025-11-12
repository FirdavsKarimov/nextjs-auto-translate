import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import path from "path";
const traverseFunction = typeof traverse === "function" ? traverse : traverse.default;
const generateFunction = typeof generate === "function" ? generate : generate.default;
// Injects <Translated tKey="scope" /> in place of JSXText
export function injectTranslated(scope) {
    return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("Translated"), [t.jsxAttribute(t.jsxIdentifier("tKey"), t.stringLiteral(scope))], true // self-closing
    ), null, [], true);
}
// Ensures import Translated from 'algebras-auto-intl/runtime/client/components/Translated' exists
export function ensureImportTranslated(ast) {
    let hasImport = false;
    traverseFunction(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value ===
                "algebras-auto-intl/runtime/client/components/Translated" &&
                path.node.specifiers.some((s) => t.isImportDefaultSpecifier(s) &&
                    t.isIdentifier(s.local) &&
                    s.local.name === "Translated")) {
                hasImport = true;
                path.stop();
            }
        }
    });
    if (!hasImport) {
        const importDecl = t.importDeclaration([t.importDefaultSpecifier(t.identifier("Translated"))], t.stringLiteral("algebras-auto-intl/runtime/client/components/Translated"));
        ast.program.body.unshift(importDecl);
    }
}
// Ensures import LocalesSwitcher exists
export function ensureImportLocalesSwitcher(ast) {
    let hasImport = false;
    traverseFunction(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value ===
                "algebras-auto-intl/runtime/client/components/LocaleSwitcher" &&
                path.node.specifiers.some((s) => t.isImportDefaultSpecifier(s) &&
                    t.isIdentifier(s.local) &&
                    s.local.name === "LocalesSwitcher")) {
                hasImport = true;
                path.stop();
            }
        }
    });
    if (!hasImport) {
        const importDecl = t.importDeclaration([t.importDefaultSpecifier(t.identifier("LocalesSwitcher"))], t.stringLiteral("algebras-auto-intl/runtime/client/components/LocaleSwitcher"));
        ast.program.body.unshift(importDecl);
    }
}
// Inject LocalesSwitcher into the first section/div in the page
export function injectLocaleSwitcher(ast) {
    let injected = false;
    traverseFunction(ast, {
        JSXElement(path) {
            if (injected)
                return;
            const openingElement = path.node.openingElement;
            const tagName = openingElement.name;
            // Check if it's a section or div with className
            if (t.isJSXIdentifier(tagName) &&
                (tagName.name === "section" || tagName.name === "div")) {
                const hasClassName = openingElement.attributes.some((attr) => t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === "className");
                if (hasClassName && path.node.children.length > 0) {
                    // Create language switcher element
                    const switcherElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("div"), [
                        t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral("fixed top-4 right-4 z-[9999]")),
                    ], false), t.jsxClosingElement(t.jsxIdentifier("div")), [
                        t.jsxText("\n          "),
                        t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("LocalesSwitcher"), [], true), null, [], true),
                        t.jsxText("\n        ")
                    ], false);
                    // Add switcher as first child
                    path.node.children.unshift(t.jsxText("\n        "), switcherElement);
                    injected = true;
                    path.stop();
                }
            }
        }
    });
}
// Transforms the specified file, injecting t() calls
export function transformProject(code, options) {
    const { filePath } = options;
    const relativePath = path.relative(process.cwd(), filePath);
    // Only process if the file exists in sourceMap
    if (!options.sourceMap.files || !options.sourceMap.files[relativePath]) {
        return code;
    }
    let ast;
    try {
        ast = parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
    }
    catch (e) {
        console.warn(`[Injector] Failed to parse ${relativePath}:`, e);
        return code;
    }
    let changed = false;
    const fileScopes = options.sourceMap.files[relativePath]?.scopes || {};
    traverseFunction(ast, {
        JSXText(path) {
            const text = path.node.value.trim();
            if (!text)
                return;
            // Find the closest JSXElement ancestor
            const jsxElement = path.findParent((p) => p.isJSXElement());
            if (!jsxElement)
                return;
            // Find the scope for this element
            const scopePath = jsxElement
                .getPathLocation()
                .replace(/\[(\d+)\]/g, "$1")
                .replace(/\./g, "/");
            if (!fileScopes[scopePath])
                return;
            // Replace text with <Translated tKey="scope" />
            path.replaceWith(injectTranslated(`${relativePath}::${scopePath}`));
            changed = true;
        }
    });
    if (!changed) {
        return code;
    }
    ensureImportTranslated(ast);
    // Inject language switcher for page.tsx files
    if (relativePath.includes("page.tsx") || relativePath.includes("page.jsx")) {
        ensureImportLocalesSwitcher(ast);
        injectLocaleSwitcher(ast);
    }
    const output = generateFunction(ast, {
        retainLines: true,
        retainFunctionParens: true
    });
    return output.code;
}

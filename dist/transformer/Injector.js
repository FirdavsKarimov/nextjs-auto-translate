import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
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
// Transforms all .tsx/.jsx files in the project, injecting t() calls
export function transformProject(code, options) {
    const files = Object.keys(options.sourceMap.files || {});
    for (const filePath of files) {
        let ast;
        try {
            ast = parse(code, {
                sourceType: "module",
                plugins: ["jsx", "typescript"]
            });
        }
        catch (e) {
            console.warn(`[Injector] Failed to parse ${filePath}:`, e);
            continue;
        }
        let changed = false;
        const fileScopes = options.sourceMap.files[filePath]?.scopes || {};
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
                path.replaceWith(injectTranslated(`${filePath}::${scopePath}`));
                changed = true;
            }
        });
        if (!changed) {
            return code;
        }
        ensureImportTranslated(ast);
        const output = generateFunction(ast, {
            retainLines: true,
            retainFunctionParens: true
        });
        return output.code;
    }
}

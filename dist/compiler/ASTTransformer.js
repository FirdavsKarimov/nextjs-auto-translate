import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
export class ASTTransformer {
    /**
     * Transform code by replacing JSX elements with translatable text with IntlComponent
     */
    transformCode(code, options) {
        let ast;
        try {
            ast = parse(code, {
                sourceType: "module",
                plugins: ["jsx", "typescript"]
            });
        }
        catch (error) {
            console.warn(`[ASTTransformer] Failed to parse file: ${options.filePath}`, error);
            return code; // Return original code if parsing fails
        }
        let hasTransformations = false;
        const fileData = options.sourceMap.files[options.filePath];
        if (!fileData) {
            return code; // No translations found for this file
        }
        // Find JSX elements that need transformation
        traverse(ast, {
            JSXElement: (path) => {
                // Check if this element has translatable text
                const hasText = this.hasTranslatableText(path.node);
                if (!hasText)
                    return;
                // Generate scope path similar to our parser
                const scopePath = this.generateScopePath(path);
                // Check if this scope exists in our source map
                if (!fileData.scopes || !fileData.scopes[scopePath]) {
                    return;
                }
                // Transform this JSX element
                hasTransformations = true;
                this.transformJSXElement(path, {
                    filePath: options.filePath,
                    scopePath,
                    ast
                });
            }
        });
        if (!hasTransformations) {
            return code; // No transformations needed
        }
        // Generate the transformed code
        const result = generate(ast, {
            retainLines: true,
            retainFunctionParens: true
        });
        return result.code;
    }
    /**
     * Check if JSX element has translatable text content
     */
    hasTranslatableText(node) {
        for (const child of node.children) {
            if (t.isJSXText(child)) {
                const text = child.value.trim();
                if (text)
                    return true;
            }
        }
        return false;
    }
    /**
     * Generate scope path for JSX element (simplified version)
     */
    generateScopePath(path) {
        // This is a simplified version - we could make it more sophisticated
        // to match exactly with our parser's scope generation
        const location = path.getPathLocation();
        return location.replace(/\[(\d+)\]/g, "$1").replace(/\./g, "/");
    }
    /**
     * Transform JSX element to use our IntlComponent
     */
    transformJSXElement(path, options) {
        // Get original element name
        const originalElement = this.getJSXElementName(path);
        if (!originalElement)
            return;
        // Add import for IntlComponent if not already present
        this.ensureIntlComponentImport(options.ast);
        // Preserve original attributes
        const originalAttributes = path.node.openingElement.attributes.slice();
        // Add our special props
        originalAttributes.push(
        // $as - the original element type
        t.jsxAttribute(t.jsxIdentifier("$as"), /^[A-Z]/.test(originalElement)
            ? t.jsxExpressionContainer(t.identifier(originalElement))
            : t.stringLiteral(originalElement)), 
        // $filePath - the file this element comes from
        t.jsxAttribute(t.jsxIdentifier("$filePath"), t.stringLiteral(options.filePath)), 
        // $scopePath - the scope identifier
        t.jsxAttribute(t.jsxIdentifier("$scopePath"), t.stringLiteral(options.scopePath)));
        // Extract variables from JSX expressions
        const variables = this.extractVariables(path);
        if (variables.properties.length > 0) {
            originalAttributes.push(t.jsxAttribute(t.jsxIdentifier("$variables"), t.jsxExpressionContainer(variables)));
        }
        // Create the new IntlComponent element
        const newElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("IntlComponent"), originalAttributes, true // self-closing
        ), null, [], true);
        // Replace the original element
        path.replaceWith(newElement);
    }
    /**
     * Get JSX element name
     */
    getJSXElementName(path) {
        const name = path.node.openingElement.name;
        if (t.isJSXIdentifier(name)) {
            return name.name;
        }
        else if (t.isJSXMemberExpression(name)) {
            return name.property.name;
        }
        return null;
    }
    /**
     * Extract variables from JSX expressions
     */
    extractVariables(path) {
        const variables = new Set();
        path.traverse({
            JSXExpressionContainer(exprPath) {
                if (t.isIdentifier(exprPath.node.expression)) {
                    variables.add(exprPath.node.expression.name);
                }
                // Could add more complex expression handling here
            }
        });
        const properties = Array.from(variables).map((name) => t.objectProperty(t.stringLiteral(name), t.identifier(name)));
        return t.objectExpression(properties);
    }
    /**
     * Ensure IntlComponent import exists
     */
    ensureIntlComponentImport(ast) {
        let hasImport = false;
        traverse(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === "algebras-auto-intl/client") {
                    // Check if IntlComponent is already imported
                    for (const specifier of path.node.specifiers) {
                        if (t.isImportSpecifier(specifier) &&
                            t.isIdentifier(specifier.imported) &&
                            specifier.imported.name === "IntlComponent") {
                            hasImport = true;
                            break;
                        }
                    }
                    if (!hasImport) {
                        // Add IntlComponent to existing import
                        path.node.specifiers.push(t.importSpecifier(t.identifier("IntlComponent"), t.identifier("IntlComponent")));
                        hasImport = true;
                    }
                }
            }
        });
        if (!hasImport) {
            // Add new import statement
            const importDeclaration = t.importDeclaration([
                t.importSpecifier(t.identifier("IntlComponent"), t.identifier("IntlComponent"))
            ], t.stringLiteral("algebras-auto-intl/client"));
            // Find program and add import at the top
            traverse(ast, {
                Program(path) {
                    path.unshiftContainer("body", importDeclaration);
                    path.stop();
                }
            });
        }
    }
}

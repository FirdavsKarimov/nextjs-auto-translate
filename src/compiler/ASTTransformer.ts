import { parse } from "@babel/parser";
import * as t from "@babel/types";
import generate from "@babel/generator";
import type { NodePath } from "@babel/traverse";
import crypto from "crypto";

// Dynamic import to handle both ESM and CommonJS
function getTraverse() {
  try {
    // Try CommonJS first (webpack context)
    const traverseModule = require("@babel/traverse");
    return traverseModule.default || traverseModule;
  } catch {
    // This shouldn't happen in Node.js, but just in case
    throw new Error("Could not load @babel/traverse");
  }
}

interface TransformOptions {
  filePath: string;
  sourceMap: any;
}

export class ASTTransformer {
  /**
   * Transform code by replacing JSX elements with translatable text with IntlComponent
   */
  transformCode(code: string, options: TransformOptions): string {
    let ast;
    try {
      ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });
    } catch (error) {
      console.warn(
        `[ASTTransformer] Failed to parse file: ${options.filePath}`,
        error
      );
      return code; // Return original code if parsing fails
    }

    let hasTransformations = false;
    const fileData = options.sourceMap.files[options.filePath];

    if (!fileData) {
      return code; // No translations found for this file
    }

    // Find JSX elements that need transformation
    getTraverse()(ast, {
      JSXElement: (path: NodePath<t.JSXElement>) => {
        // Check if this element has translatable text
        const hasText = this.hasTranslatableText(path.node);
        if (!hasText) return;

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
  private hasTranslatableText(node: t.JSXElement): boolean {
    for (const child of node.children) {
      if (t.isJSXText(child)) {
        const text = child.value.trim();
        if (text) return true;
      }
    }
    return false;
  }

  /**
   * Generate scope path for JSX element (simplified version)
   */
  private generateScopePath(path: NodePath<t.JSXElement>): string {
    // This is a simplified version - we could make it more sophisticated
    // to match exactly with our parser's scope generation
    const location = path.getPathLocation();
    return location.replace(/\[(\d+)\]/g, "$1").replace(/\./g, "/");
  }

  /**
   * Transform JSX element to use our IntlComponent
   */
  private transformJSXElement(
    path: NodePath<t.JSXElement>,
    options: { filePath: string; scopePath: string; ast: t.Node }
  ): void {
    // Get original element name
    const originalElement = this.getJSXElementName(path);
    if (!originalElement) return;

    // Add import for IntlComponent if not already present
    this.ensureIntlComponentImport(options.ast);

    // Preserve original attributes
    const originalAttributes = path.node.openingElement.attributes.slice();

    // Add our special props
    originalAttributes.push(
      // $as - the original element type
      t.jsxAttribute(
        t.jsxIdentifier("$as"),
        /^[A-Z]/.test(originalElement)
          ? t.jsxExpressionContainer(t.identifier(originalElement))
          : t.stringLiteral(originalElement)
      ),
      // $filePath - the file this element comes from
      t.jsxAttribute(
        t.jsxIdentifier("$filePath"),
        t.stringLiteral(options.filePath)
      ),
      // $scopePath - the scope identifier
      t.jsxAttribute(
        t.jsxIdentifier("$scopePath"),
        t.stringLiteral(options.scopePath)
      )
    );

    // Extract variables from JSX expressions
    const variables = this.extractVariables(path);
    if (variables.properties.length > 0) {
      originalAttributes.push(
        t.jsxAttribute(
          t.jsxIdentifier("$variables"),
          t.jsxExpressionContainer(variables)
        )
      );
    }

    // Create the new IntlComponent element
    const newElement = t.jsxElement(
      t.jsxOpeningElement(
        t.jsxIdentifier("IntlComponent"),
        originalAttributes,
        true // self-closing
      ),
      null,
      [],
      true
    );

    // Replace the original element
    path.replaceWith(newElement);
  }

  /**
   * Get JSX element name
   */
  private getJSXElementName(path: NodePath<t.JSXElement>): string | null {
    const name = path.node.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      return name.name;
    } else if (t.isJSXMemberExpression(name)) {
      return name.property.name;
    }
    return null;
  }

  /**
   * Extract variables from JSX expressions
   */
  private extractVariables(path: NodePath<t.JSXElement>): t.ObjectExpression {
    const variables = new Set<string>();

    path.traverse({
      JSXExpressionContainer(exprPath) {
        if (t.isIdentifier(exprPath.node.expression)) {
          variables.add(exprPath.node.expression.name);
        }
        // Could add more complex expression handling here
      }
    });

    const properties = Array.from(variables).map((name) =>
      t.objectProperty(t.stringLiteral(name), t.identifier(name))
    );

    return t.objectExpression(properties);
  }

  /**
   * Ensure IntlComponent import exists
   */
  private ensureIntlComponentImport(ast: t.Node): void {
    let hasImport = false;

    getTraverse()(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === "algebras-auto-intl/client") {
          // Check if IntlComponent is already imported
          for (const specifier of path.node.specifiers) {
            if (
              t.isImportSpecifier(specifier) &&
              t.isIdentifier(specifier.imported) &&
              specifier.imported.name === "IntlComponent"
            ) {
              hasImport = true;
              break;
            }
          }

          if (!hasImport) {
            // Add IntlComponent to existing import
            path.node.specifiers.push(
              t.importSpecifier(
                t.identifier("IntlComponent"),
                t.identifier("IntlComponent")
              )
            );
            hasImport = true;
          }
        }
      }
    });

    if (!hasImport) {
      // Add new import statement
      const importDeclaration = t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier("IntlComponent"),
            t.identifier("IntlComponent")
          )
        ],
        t.stringLiteral("algebras-auto-intl/client")
      );

      // Find program and add import at the top
      getTraverse()(ast, {
        Program(path) {
          path.unshiftContainer("body", importDeclaration);
          path.stop();
        }
      });
    }
  }
}

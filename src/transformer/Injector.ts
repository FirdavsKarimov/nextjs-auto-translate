import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import path from "path";
import { ScopeMap } from "../types";

const traverseFunction =
  typeof traverse === "function" ? traverse : (traverse as any).default;

const generateFunction =
  typeof generate === "function" ? generate : (generate as any).default;

// Injects <Translated tKey="scope" /> in place of JSXText
export function injectTranslated(scope: string): t.JSXElement {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier("Translated"),
      [t.jsxAttribute(t.jsxIdentifier("tKey"), t.stringLiteral(scope))],
      true // self-closing
    ),
    null,
    [],
    true
  );
}

// Ensures import Translated from 'algebras-auto-intl/runtime/client/components/Translated' exists
export function ensureImportTranslated(ast: t.File) {
  let hasImport = false;
  traverseFunction(ast, {
    ImportDeclaration(path: any) {
      if (
        path.node.source.value ===
          "algebras-auto-intl/runtime/client/components/Translated" &&
        path.node.specifiers.some(
          (s: any) =>
            t.isImportDefaultSpecifier(s) &&
            t.isIdentifier(s.local) &&
            s.local.name === "Translated"
        )
      ) {
        hasImport = true;
        path.stop();
      }
    }
  });
  if (!hasImport) {
    const importDecl = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier("Translated"))],
      t.stringLiteral("algebras-auto-intl/runtime/client/components/Translated")
    );
    ast.program.body.unshift(importDecl);
  }
}

// Transforms the specified file, injecting t() calls
export function transformProject(
  code: string,
  options: {
    sourceMap: ScopeMap;
    filePath: string;
  }
) {
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
  } catch (e) {
    console.warn(`[Injector] Failed to parse ${relativePath}:`, e);
    return code;
  }

  let changed = false;
  const fileScopes = options.sourceMap.files[relativePath]?.scopes || {};

  traverseFunction(ast, {
    JSXText(path: NodePath<t.JSXText>) {
      const text = path.node.value.trim();

      if (!text) return;

      // Find the closest JSXElement ancestor
      const jsxElement = path.findParent((p) => p.isJSXElement());
      if (!jsxElement) return;

      // Find the scope for this element
      const scopePath = jsxElement
        .getPathLocation()
        .replace(/\[(\d+)\]/g, "$1")
        .replace(/\./g, "/");

      if (!fileScopes[scopePath]) return;

      // Replace text with <Translated tKey="scope" />
      path.replaceWith(injectTranslated(`${relativePath}::${scopePath}`));
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

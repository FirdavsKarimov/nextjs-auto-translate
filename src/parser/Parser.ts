// src/parser/Parser.ts
import { ScopeMap, ParserOptions, ScopeData } from "../types";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import crypto from "crypto";
import { SourceStore } from "../storage/SourceStore";
import * as t from "@babel/types";

/**
 * Builds a readable content string from a JSXElement node,
 * using pseudo-tags for JSXElements and trimmed text for JSXText.
 */
function buildContent(node: t.JSXElement): string {
  let out = "";
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) out += text;
    } else if (t.isJSXElement(child)) {
      const nameNode = child.openingElement.name;
      let name = "Unknown";
      if (t.isJSXIdentifier(nameNode)) {
        name = nameNode.name;
      } else if (t.isJSXMemberExpression(nameNode)) {
        name = nameNode.property.name;
      }
      // Recursively build inner content if needed
      const inner = buildContent(child as t.JSXElement);
      out += `<element:${name}>${inner}</element:${name}>`;
    }
  }
  return out;
}

/**
 * Convert full AST path to a relative scope path
 */
function getRelativeScopePath(fullPath: string): string {
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

export class Parser {
  private lockPath = path.resolve(process.cwd(), ".intl/.lock");
  private sourceStore = new SourceStore();

  constructor(private options: ParserOptions = {}) {}

  async parseProject(): Promise<ScopeMap> {
    // Ensure .intl directory exists
    const intlDir = path.dirname(this.sourceStore["path"]);
    fs.mkdirSync(intlDir, { recursive: true });

    // Lock file check
    if (fs.existsSync(this.lockPath)) {
      console.log("🟡 Skipping parse: lock file present.");
      return this.sourceStore.load();
    }

    // Create lock file
    fs.writeFileSync(this.lockPath, "");
    try {
      // Load previous sources
      const previous = this.sourceStore.load();

      console.log("[Parser] Scanning project for translatable strings...");
      const ignore = ["**/.next/**", "**/dist/**"];
      if (!this.options.includeNodeModules) {
        ignore.push("**/node_modules/**");
      }
      const files = await fg("**/*.{tsx,jsx}", {
        cwd: process.cwd(),
        ignore,
        absolute: true
      });
      console.log(`[Parser] Found ${files.length} files to scan.`);

      const scopeMap: ScopeMap = {
        version: 0.1,
        files: {}
      };

      const projectRoot = process.cwd();

      for (const file of files) {
        const code = fs.readFileSync(file, "utf-8");
        let ast;
        try {
          ast = parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
          });
        } catch {
          console.warn(`[Parser] Skipping file with parse error: ${file}`);
          continue;
        }

        // Get relative file path from project root
        const relativeFilePath = path.relative(projectRoot, file);
        const fileScopes: { [scope: string]: ScopeData } = {};

        traverse(ast, {
          JSXElement(path) {
            for (const child of path.node.children) {
              if (t.isJSXText(child)) {
                const text = child.value.trim();
                if (!text) continue;
                const content = buildContent(path.node);
                const hash = crypto
                  .createHash("md5")
                  .update(content)
                  .digest("hex");
                const fullScopePath = path.getPathLocation();
                const relativeScopePath = getRelativeScopePath(fullScopePath);

                fileScopes[relativeScopePath] = {
                  type: "element",
                  hash,
                  context: "",
                  skip: false,
                  overrides: {},
                  content
                };
              }
            }
          }
        });

        // Only add files that have scopes
        if (Object.keys(fileScopes).length > 0) {
          scopeMap.files[relativeFilePath] = {
            scopes: fileScopes
          };
        }
      }

      // Compare with previous
      const prev = this.sourceStore.load();
      const prevFiles = prev.files || {};
      const newFiles = scopeMap.files;

      const changed = this.hasChanges(prevFiles, newFiles);

      if (!changed) {
        console.log("🟢 Skipping parse: no changes detected.");
        return prev;
      }

      const totalEntries = Object.values(newFiles).reduce(
        (count, file) => count + Object.keys(file.scopes).length,
        0
      );

      console.log(
        `[Parser] Extraction complete. Found ${totalEntries} entries across ${
          Object.keys(newFiles).length
        } files.`
      );
      // Save new sources
      this.sourceStore.save(scopeMap);
      return scopeMap;
    } finally {
      // Remove lock file
      fs.unlinkSync(this.lockPath);
    }
  }

  private hasChanges(
    prevFiles: {
      [filePath: string]: { scopes: { [scope: string]: ScopeData } };
    },
    newFiles: { [filePath: string]: { scopes: { [scope: string]: ScopeData } } }
  ): boolean {
    const prevFilePaths = Object.keys(prevFiles);
    const newFilePaths = Object.keys(newFiles);

    // Check if file count changed
    if (prevFilePaths.length !== newFilePaths.length) {
      return true;
    }

    // Check each file
    for (const filePath of newFilePaths) {
      const prevFile = prevFiles[filePath];
      const newFile = newFiles[filePath];

      if (!prevFile) {
        return true; // New file added
      }

      const prevScopes = Object.keys(prevFile.scopes);
      const newScopes = Object.keys(newFile.scopes);

      // Check if scope count changed
      if (prevScopes.length !== newScopes.length) {
        return true;
      }

      // Check each scope
      for (const scope of newScopes) {
        const prevScope = prevFile.scopes[scope];
        const newScope = newFile.scopes[scope];

        if (!prevScope || prevScope.hash !== newScope.hash) {
          return true;
        }
      }
    }

    return false;
  }
}

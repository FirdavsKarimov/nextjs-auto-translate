// src/parser/Parser.ts
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { SourceStore } from "../storage/SourceStore";
import { buildContent, getRelativeScopePath } from "./utils";
export class Parser {
    constructor(options = {}) {
        this.options = options;
        const outputDir = options.outputDir || ".intl";
        this.lockPath = path.resolve(process.cwd(), outputDir, ".lock");
        this.sourceStore = new SourceStore(outputDir);
    }
    findFilesSync(dir, extensions, ignorePatterns) {
        const files = [];
        const isIgnored = (filePath) => {
            return ignorePatterns.some((pattern) => {
                // Convert glob pattern to regex-like matching
                const regexPattern = pattern
                    .replace(/\*\*/g, ".*")
                    .replace(/\*/g, "[^/]*")
                    .replace(/\//g, "\\/");
                const regex = new RegExp(regexPattern);
                return regex.test(filePath);
            });
        };
        const walkDir = (currentDir) => {
            try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);
                    const relativePath = path.relative(dir, fullPath);
                    if (isIgnored(relativePath)) {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        walkDir(fullPath);
                    }
                    else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                // Skip directories we can't read
                console.warn(`[Parser] Cannot read directory: ${currentDir}`);
            }
        };
        walkDir(dir);
        return files;
    }
    parseProject() {
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
            console.log("[Parser] Scanning project for translatable strings...");
            const ignore = ["**/.next/**", "**/dist/**"];
            if (!this.options.includeNodeModules) {
                ignore.push("**/node_modules/**");
            }
            const files = this.findFilesSync(process.cwd(), [".tsx", ".jsx"], ignore);
            console.log(`[Parser] Found ${files.length} files to scan.`);
            const scopeMap = {
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
                }
                catch {
                    console.warn(`[Parser] Skipping file with parse error: ${file}`);
                    continue;
                }
                // Get relative file path from project root
                const relativeFilePath = path.relative(projectRoot, file);
                const fileScopes = {};
                traverse(ast, {
                    JSXElement(path) {
                        for (const child of path.node.children) {
                            if (t.isJSXText(child)) {
                                const text = child.value.trim();
                                if (!text)
                                    continue;
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
            const totalEntries = Object.values(newFiles).reduce((count, file) => count + Object.keys(file.scopes).length, 0);
            console.log(`[Parser] Extraction complete. Found ${totalEntries} entries across ${Object.keys(newFiles).length} files.`);
            // Save new sources
            this.sourceStore.save(scopeMap);
            return scopeMap;
        }
        finally {
            // Remove lock file
            fs.unlinkSync(this.lockPath);
        }
    }
    hasChanges(prevFiles, newFiles) {
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

"use strict";
const fs = require("fs");
const path = require("path");
// Webpack loader for transforming JSX with internationalization
module.exports = function (source) {
    const callback = this.async();
    const options = this.getOptions() || {};
    if (!callback) {
        throw new Error("Webpack loader callback not available");
    }
    const processFile = async () => {
        try {
            // Get the file path relative to the project root
            const projectRoot = this.rootContext || process.cwd();
            const relativeFilePath = path
                .relative(projectRoot, this.resourcePath)
                .split(path.sep)
                .join("/"); // Normalize path separators
            // Check if source map exists
            const sourceMapPath = path.resolve(projectRoot, ".intl/source.json");
            if (!fs.existsSync(sourceMapPath)) {
                // No source map found, return original source
                console.log(`[IntlLoader] No source map found, skipping transformation for ${relativeFilePath}`);
                callback(null, source);
                return;
            }
            // Load source map
            const sourceMapContent = fs.readFileSync(sourceMapPath, "utf-8");
            const sourceMap = JSON.parse(sourceMapContent);
            // Check if this file has translations
            if (!sourceMap.files || !sourceMap.files[relativeFilePath]) {
                // No translations for this file, return original source
                callback(null, source);
                return;
            }
            // Import and use the ASTTransformer
            const { ASTTransformer } = await import("./ASTTransformer.js");
            const transformer = new ASTTransformer();
            const transformedCode = transformer.transformCode(source, {
                filePath: relativeFilePath,
                sourceMap: sourceMap
            });
            console.log(`[IntlLoader] Transformed ${relativeFilePath}`);
            callback(null, transformedCode);
        }
        catch (error) {
            console.error(`[IntlLoader] Error transforming ${this.resourcePath}:`, error);
            // Return original source on error to prevent build failure
            callback(null, source);
        }
    };
    processFile();
};

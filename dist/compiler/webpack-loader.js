import fs from "fs";
import path from "path";
import { transformCode } from "../transformer/Injector.js";
// Webpack loader for transforming JSX with internationalization
export default function (source) {
    const callback = this.async();
    const options = this.getOptions() || {};
    const processFile = async () => {
        try {
            // Get the file path relative to the project root
            const projectRoot = this.rootContext || process.cwd();
            const relativeFilePath = path
                .relative(projectRoot, this.resourcePath)
                .split(path.sep)
                .join("/"); // Normalize path separators
            // Try multiple possible source map locations
            const possibleSourceMapPaths = [
                path.resolve(projectRoot, "src/intl/source.json"), // Default Next.js demo location
                path.resolve(projectRoot, ".intl/source.json"), // Fallback location
                path.resolve(projectRoot, "source.json") // Root location
            ];
            let sourceMapPath = null;
            for (const possiblePath of possibleSourceMapPaths) {
                if (fs.existsSync(possiblePath)) {
                    sourceMapPath = possiblePath;
                    break;
                }
            }
            if (!sourceMapPath) {
                // No source map found, return original source
                console.log(`[IntlLoader] No source map found, skipping transformation for ${relativeFilePath}`);
                callback(null, source);
                return;
            }
            console.log(`[IntlLoader] Using source map: ${sourceMapPath}`);
            // Load source map
            const sourceMapContent = fs.readFileSync(sourceMapPath, "utf-8");
            const sourceMap = JSON.parse(sourceMapContent);
            // Check if this file has translations
            if (!sourceMap.files || !sourceMap.files[relativeFilePath]) {
                // No translations for this file, return original source
                console.log(`[IntlLoader] No translations found for ${relativeFilePath}`);
                callback(null, source);
                return;
            }
            console.log(`[IntlLoader] Processing ${relativeFilePath} with ${Object.keys(sourceMap.files[relativeFilePath].scopes || {}).length} scopes`);
            // Use transformCode from Injector
            const transformedCode = transformCode(source, {
                filePath: relativeFilePath,
                sourceMap: sourceMap
            });
            console.log(`[IntlLoader] ✅ Transformed ${relativeFilePath}`);
            callback(null, transformedCode);
        }
        catch (error) {
            console.error(`[IntlLoader] Error transforming ${this.resourcePath}:`, error);
            // Return original source on error to prevent build failure
            callback(null, source);
        }
    };
    processFile();
}

import { Parser } from "./parser/Parser";
import { DictionaryGenerator } from "./translator/DictionaryGenerator";
import fs from "fs";
import path from "path";
let hasScheduled = false;
function isProcessAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch {
        return false;
    }
}
export default function myPlugin(options = {}) {
    const { includeNodeModules = false, targetLocales = ["en", "es", "fr", "de"], outputDir = "src/intl", enableTransformation = true } = options;
    return function wrapNextConfig(nextConfig) {
        const scheduledFlagPath = path.resolve(process.cwd(), ".intl/.scheduled");
        const parserLockPath = path.resolve(process.cwd(), ".intl/.lock");
        const timestamp = new Date().toISOString();
        const pid = process.pid;
        console.log(`🔍 [${timestamp}] Plugin called (PID: ${pid})`);
        // Check if this process already scheduled
        if (hasScheduled) {
            console.log(`🟡 [${timestamp}] Parser already scheduled in this process (PID: ${pid})`);
            return nextConfig;
        }
        // Check if ANY process already scheduled parsing
        if (fs.existsSync(scheduledFlagPath)) {
            const flagPid = parseInt(fs.readFileSync(scheduledFlagPath, "utf-8"));
            if (isProcessAlive(flagPid)) {
                console.log(`🟡 [${timestamp}] Parser already scheduled by alive process ${flagPid} (PID: ${pid})`);
                return nextConfig;
            }
            else {
                console.log(`💀 [${timestamp}] Scheduled flag from dead process ${flagPid}, removing (PID: ${pid})`);
                fs.unlinkSync(scheduledFlagPath);
            }
        }
        console.log(`🟢 [${timestamp}] Scheduling parser (PID: ${pid})`);
        hasScheduled = true;
        // Create scheduled flag immediately
        fs.mkdirSync(path.dirname(scheduledFlagPath), { recursive: true });
        fs.writeFileSync(scheduledFlagPath, pid.toString());
        // Clean up any stale parser lock file
        if (fs.existsSync(parserLockPath)) {
            console.log(`🧹 [${timestamp}] Removing stale parser lock file (PID: ${pid})`);
            fs.unlinkSync(parserLockPath);
        }
        setImmediate(async () => {
            const asyncTimestamp = new Date().toISOString();
            console.log(`⚡ [${asyncTimestamp}] setImmediate callback started (PID: ${pid})`);
            try {
                const parser = new Parser({ includeNodeModules });
                const sourceMap = await parser.parseProject();
                // Generate dictionary
                const dictionaryGenerator = new DictionaryGenerator({
                    targetLocales,
                    outputDir
                });
                await dictionaryGenerator.generateDictionary(sourceMap);
                console.log(`✅ [${asyncTimestamp}] Parser and dictionary generation completed (PID: ${pid})`);
            }
            catch (err) {
                console.error(`❌ [${asyncTimestamp}] Parser error (PID: ${pid}):`, err);
            }
            // Note: NOT removing scheduled flag here - let it persist for the build
        });
        // Add webpack configuration for AST transformation if enabled
        const modifiedNextConfig = {
            ...nextConfig,
            webpack: (config, options) => {
                if (enableTransformation) {
                    // Add our custom loader for TSX/JSX files
                    config.module.rules.push({
                        test: /\.(tsx|jsx)$/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: path.resolve(__dirname, "../dist/compiler/webpack-loader.cjs"),
                                options: {
                                    outputDir
                                }
                            }
                        ]
                    });
                }
                // Call the original webpack config if it exists
                if (typeof nextConfig.webpack === "function") {
                    return nextConfig.webpack(config, options);
                }
                return config;
            }
        };
        return modifiedNextConfig;
    };
}

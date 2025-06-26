// src/index.ts
import fs from "fs";
import type { NextConfig } from "next";
import path from "path";
import { Parser } from "./parser/Parser.js";
import { DictionaryGenerator } from "./translator/DictionaryGenerator.js";
import { ScopeMap } from "./types.js";
import { LanguageCode } from "./data/languageMap.js";

// Re-export commonly used types and components
export { LanguageCode } from "./data/languageMap.js";
export { default as AlgebrasIntlProvider } from "./runtime/server/Provider.js";

let hasScheduled = false;
let cachedSourceMap: ScopeMap | null = null;

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export interface PluginOptions {
  defaultLocale: LanguageCode;
  targetLocales: LanguageCode[];
  includeNodeModules?: boolean;
  outputDir?: string;
}

export default function myPlugin(options: PluginOptions) {
  const {
    defaultLocale = "en",
    targetLocales,
    includeNodeModules = false,
    outputDir = "./src/intl"
  } = options;

  process.env.ALGEBRAS_INTL_OUTPUT_DIR = outputDir;

  const scheduledFlagPath = path.resolve(
    process.cwd(),
    outputDir,
    ".scheduled"
  );
  const parserLockPath = path.resolve(process.cwd(), outputDir, ".lock");

  function prepareSourceMap() {
    try {
      const parser = new Parser({ includeNodeModules, outputDir });
      const sourceMap = parser.parseProject();
      cachedSourceMap = sourceMap;

      const dictionaryGenerator = new DictionaryGenerator({
        defaultLocale,
        targetLocales,
        outputDir
      });
      dictionaryGenerator.generateDictionary(sourceMap);

      fs.writeFileSync(
        path.resolve(outputDir, "source.json"),
        JSON.stringify(sourceMap, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.error("❌ Failed to parse/generate source map:", err);
      cachedSourceMap = null;
    }
  }

  function wrapWebpack(
    nextWebpack?: NextConfig["webpack"]
  ): NextConfig["webpack"] {
    prepareSourceMap();
    return function webpack(config, options) {
      config.module.rules.push({
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("./webpack/auto-intl-loader"),
            options: {
              sourceMap: cachedSourceMap ?? {}
            }
          }
        ]
      });

      if (typeof nextWebpack === "function") {
        return nextWebpack(config, options);
      }

      return config;
    };
  }

  return function wrapNextConfig(nextConfig: Partial<Record<string, any>>) {
    if (hasScheduled) {
      return {
        ...nextConfig,
        webpack: wrapWebpack(nextConfig.webpack)
      };
    }

    if (fs.existsSync(scheduledFlagPath)) {
      const flagPid = parseInt(fs.readFileSync(scheduledFlagPath, "utf-8"));
      if (isProcessAlive(flagPid)) {
        return {
          ...nextConfig,
          webpack: wrapWebpack(nextConfig.webpack)
        };
      } else {
        fs.unlinkSync(scheduledFlagPath);
      }
    }

    hasScheduled = true;
    fs.mkdirSync(path.dirname(scheduledFlagPath), { recursive: true });
    fs.writeFileSync(scheduledFlagPath, process.pid.toString());
    if (fs.existsSync(parserLockPath)) fs.unlinkSync(parserLockPath);

    return {
      ...nextConfig,
      webpack: wrapWebpack(nextConfig.webpack)
    };
  };
}

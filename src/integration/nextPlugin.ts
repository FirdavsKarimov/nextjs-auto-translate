// src/integration/NextPlugin.ts
import type { NextConfig } from "next";
import { Parser } from "../parser/Parser";

let hasScheduled = false;

export default function myPlugin(options?: { includeNodeModules?: boolean }) {
  return function wrapNextConfig(nextConfig: NextConfig): NextConfig {
    if (hasScheduled) {
      console.log("🟡 Skipping parser: already scheduled.");
      return nextConfig;
    }
    hasScheduled = true;

    setImmediate(() => {
      const parser = new Parser(options);
      parser
        .parseProject()
        .catch((err) => console.error("❌ Parser error:", err));
    });

    return {
      ...nextConfig
    };
  };
}

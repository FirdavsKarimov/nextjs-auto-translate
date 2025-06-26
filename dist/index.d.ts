import type { NextConfig } from "next";
export interface PluginOptions {
    includeNodeModules?: boolean;
    targetLocales?: string[];
    outputDir?: string;
}
export default function myPlugin(options?: PluginOptions): (nextConfig: NextConfig) => NextConfig;

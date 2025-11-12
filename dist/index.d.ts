import { LanguageCode } from "./data/languageMap.js";
export { LanguageCode } from "./data/languageMap.js";
export interface PluginOptions {
    defaultLocale: LanguageCode;
    targetLocales: LanguageCode[];
    includeNodeModules?: boolean;
    outputDir?: string;
}
export default function myPlugin(options: PluginOptions): (nextConfig: Partial<Record<string, any>>) => {
    webpack: import("next/dist/server/config-shared.js").NextJsWebpackConfig | null | undefined;
};

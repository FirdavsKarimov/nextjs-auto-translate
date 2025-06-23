import { Parser } from "../parser/Parser";
let hasScheduled = false;
export default function myPlugin(options) {
    return function wrapNextConfig(nextConfig) {
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

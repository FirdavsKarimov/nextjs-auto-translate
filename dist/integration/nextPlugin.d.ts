import type { NextConfig } from "next";
export default function myPlugin(options?: {
    includeNodeModules?: boolean;
}): (nextConfig: NextConfig) => NextConfig;

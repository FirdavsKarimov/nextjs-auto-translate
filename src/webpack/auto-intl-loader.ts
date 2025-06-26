// src/webpack/auto-intl-loader.ts
import type { LoaderContext } from "webpack";
import { transformProject } from "../transformer/Injector.js";
import { ScopeMap } from "../types.js";

interface LoaderOptions {
  sourceMap: ScopeMap;
}

export default function loader(
  this: LoaderContext<LoaderOptions>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();

  try {
    const result = transformProject(source, {
      sourceMap: options.sourceMap,
      filePath: this.resourcePath
    });
    callback(null, result);
  } catch (err) {
    console.error("🔴 Auto-intl plugin error:", err);
    this.emitError(err as Error);
  }
}

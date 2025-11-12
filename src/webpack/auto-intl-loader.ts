// src/webpack/auto-intl-loader.ts
import { transformProject } from "../transformer/Injector.js";
import { wrapLayoutWithIntl } from "../transformer/LayoutWrapper.js";
import { ScopeMap } from "../types.js";

interface LoaderOptions {
  sourceMap: ScopeMap;
}

export default function loader(
  this: any,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();
  try {
    // First, automatically wrap layout with IntlWrapper
    let result = wrapLayoutWithIntl(source, this.resourcePath);
    
    // Then, transform the project with translation injections
    result = transformProject(result, {
      sourceMap: options.sourceMap,
      filePath: this.resourcePath
    });
    
    callback(null, result);
  } catch (err) {
    console.error("🔴 Auto-intl plugin error:", err);
    this.emitError(err as Error);
  }
}

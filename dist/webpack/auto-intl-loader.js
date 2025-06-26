import { transformProject } from "../transformer/Injector.js";
export default function loader(source) {
    const options = this.getOptions();
    const callback = this.async();
    try {
        const result = transformProject(source, {
            sourceMap: options.sourceMap,
            filePath: this.resourcePath
        });
        callback(null, result);
    }
    catch (err) {
        console.error("🔴 Auto-intl plugin error:", err);
        this.emitError(err);
    }
}

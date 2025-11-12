import path from "path";
import fs from "fs/promises";
class Dictionary {
    constructor(locale) {
        this.dictionary = {
            version: "",
            files: {}
        };
        this.load = async () => {
            const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR;
            if (!outputDir) {
                throw new Error("ALGEBRAS_INTL_OUTPUT_DIR is not set");
            }
            const dictionaryJsonPath = path.join(process.cwd(), outputDir, "dictionary.json");
            console.log("[Dictionary] Loading from:", dictionaryJsonPath);
            const dictionaryJson = await fs.readFile(dictionaryJsonPath, "utf8");
            const parsed = JSON.parse(dictionaryJson);
            console.log("[Dictionary] Loaded files:", Object.keys(parsed.files));
            // Return a completely new plain object without any class instance references
            return {
                version: parsed.version,
                files: Object.fromEntries(Object.entries(parsed.files).map(([filePath, fileData]) => [
                    filePath,
                    {
                        entries: Object.fromEntries(Object.entries(fileData.entries).map(([entryKey, entryData]) => [
                            entryKey,
                            {
                                content: { ...entryData.content },
                                hash: entryData.hash
                            }
                        ]))
                    }
                ]))
            };
        };
        this.setLocale = (locale) => {
            this.locale = locale;
        };
        this.locale = locale;
    }
}
export default Dictionary;

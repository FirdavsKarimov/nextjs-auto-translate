import path from "path";
import fs from "fs/promises";
import { DictStructure } from "../types.js";

class Dictionary {
  private locale: string;
  private dictionary: DictStructure = {
    version: "",
    files: {}
  };

  constructor(locale: string) {
    this.locale = locale;
  }

  load = async (): Promise<DictStructure> => {
    const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR;
    if (!outputDir) {
      throw new Error("ALGEBRAS_INTL_OUTPUT_DIR is not set");
    }

    const dictionaryJsonPath = path.join(
      process.cwd(),
      outputDir,
      "dictionary.json"
    );
    console.log("[Dictionary] Loading from:", dictionaryJsonPath);
    const dictionaryJson = await fs.readFile(dictionaryJsonPath, "utf8");
    const parsed = JSON.parse(dictionaryJson) as DictStructure;
    console.log("[Dictionary] Loaded files:", Object.keys(parsed.files));

    // Return a completely new plain object without any class instance references
    return {
      version: parsed.version,
      files: Object.fromEntries(
        Object.entries(parsed.files).map(([filePath, fileData]) => [
          filePath,
          {
            entries: Object.fromEntries(
              Object.entries(fileData.entries).map(([entryKey, entryData]) => [
                entryKey,
                {
                  content: { ...entryData.content },
                  hash: entryData.hash
                }
              ])
            )
          }
        ])
      )
    };
  };

  setLocale = (locale: string) => {
    this.locale = locale;
  };
}

export default Dictionary;

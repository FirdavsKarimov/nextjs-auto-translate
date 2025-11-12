import fs from "fs";
import path from "path";
import { ScopeMap } from "../types.js";

export interface DictionaryGeneratorOptions {
  defaultLocale: string;
  targetLocales: string[];
  outputDir: string;
}

export interface DictionaryEntry {
  content: Record<string, string>;
  hash: string;
}

export interface DictionaryFile {
  entries: Record<string, DictionaryEntry>;
}

export interface Dictionary {
  version: number;
  files: Record<string, DictionaryFile>;
}

// Fake translation service - returns original text as placeholder
class MockTranslationService {
  translate(text: string, targetLocale: string): string {
    // For now, just return the original text with a locale prefix
    // In a real implementation, this would call an actual translation API
    if (targetLocale === "en") {
      return text;
    }
    return `[${targetLocale.toUpperCase()}] ${text}`;
  }
}

export class DictionaryGenerator {
  private translationService = new MockTranslationService();

  constructor(private options: DictionaryGeneratorOptions) {}

  generateDictionary(sourceMap: ScopeMap): string {
    const allLocales = [
      this.options.defaultLocale,
      ...this.options.targetLocales
    ];
    console.log(
      `[DictionaryGenerator] Generating dictionary for locales: ${allLocales.join(
        ", "
      )}`
    );

    const dictionary: Dictionary = {
      version: 0.1,
      files: {}
    };

    // Process each file
    for (const [filePath, fileData] of Object.entries(sourceMap.files)) {
      dictionary.files[filePath] = {
        entries: {}
      };

      // Process each scope in the file
      for (const [scopePath, scopeData] of Object.entries(fileData.scopes)) {
        const translations: Record<string, string> = {};

        // Generate translations for each locale
        for (const locale of allLocales) {
          try {
            translations[locale] = this.translationService.translate(
              scopeData.content,
              locale
            );
          } catch (error) {
            console.warn(
              `[DictionaryGenerator] Failed to translate "${scopeData.content}" to ${locale}:`,
              error
            );
            // Fallback to original content
            translations[locale] = scopeData.content;
          }
        }

        dictionary.files[filePath].entries[scopePath] = {
          content: translations,
          hash: scopeData.hash
        };
      }
    }

    // Write dictionary files
    const outputPath = this.writeDictionaryFiles(dictionary);
    const dictionaryJsonPath = path.join(outputPath, "dictionary.json");

    return dictionaryJsonPath;
  }

  private writeDictionaryFiles(dictionary: Dictionary): string {
    const outputPath = path.resolve(process.cwd(), this.options.outputDir);

    // Ensure output directory exists
    fs.mkdirSync(outputPath, { recursive: true });

    // Write dictionary.json file (for debugging/inspection)
    const dictionaryJsonPath = path.join(outputPath, "dictionary.json");
    fs.writeFileSync(
      dictionaryJsonPath,
      JSON.stringify(dictionary, null, 2),
      "utf-8"
    );

    const totalEntries = Object.values(dictionary.files).reduce(
      (count, file) => count + Object.keys(file.entries).length,
      0
    );

    console.log(
      `[DictionaryGenerator] Generated dictionary with ${totalEntries} entries across ${
        Object.keys(dictionary.files).length
      } files`
    );
    console.log(
      `[DictionaryGenerator] Dictionary files written to: ${outputPath}`
    );

    return outputPath;
  }
}

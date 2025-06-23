// src/translator/Translator.ts
import { ScopeMap, Dictionary } from "../types";

export interface ITranslateProvider {
  translateText(text: string, targetLang: string): Promise<string>;
}

export class Translator {
  constructor(private provider: ITranslateProvider) {}

  async translate(
    source: ScopeMap,
    targetLocales: string[]
  ): Promise<Dictionary> {
    const result: Dictionary = {};

    for (const locale of targetLocales) {
      result[locale] = {};

      // Iterate through files and their scopes
      for (const filePath in source.files) {
        const fileScopes = source.files[filePath].scopes;
        for (const scope in fileScopes) {
          // Create a unique key combining file path and scope
          const scopeKey = `${filePath}::${scope}`;
          result[locale][scopeKey] = await this.provider.translateText(
            fileScopes[scope].content,
            locale
          );
        }
      }
    }

    return result;
  }
}

export interface Dictionary {
    version: number;
    files: {
        [filePath: string]: {
            entries: {
                [scopePath: string]: {
                    content: Record<string, string>;
                    hash: string;
                };
            };
        };
    };
}
export declare class DictionaryLoader {
    private dictionaryPath;
    private dictionary;
    private loadPromise;
    constructor(dictionaryPath?: string);
    /**
     * Load the dictionary from the specified path
     */
    loadDictionary(): Promise<Dictionary | null>;
    private _loadDictionary;
    /**
     * Get a translation for a specific file, scope, and locale
     */
    getTranslation(filePath: string, scopePath: string, locale?: string): Promise<string | null>;
    /**
     * Get all available locales from the dictionary
     */
    getAvailableLocales(): Promise<string[]>;
    /**
     * Get all translation entries for a specific file
     */
    getFileTranslations(filePath: string, locale?: string): Promise<Record<string, string>>;
    /**
     * Check if a translation exists
     */
    hasTranslation(filePath: string, scopePath: string, locale?: string): Promise<boolean>;
}
export declare const defaultDictionaryLoader: DictionaryLoader;

export class DictionaryLoader {
    constructor(dictionaryPath = "./intl/dictionary.js") {
        this.dictionaryPath = dictionaryPath;
        this.dictionary = null;
        this.loadPromise = null;
    }
    /**
     * Load the dictionary from the specified path
     */
    async loadDictionary() {
        if (this.dictionary) {
            return this.dictionary;
        }
        if (this.loadPromise) {
            return this.loadPromise;
        }
        this.loadPromise = this._loadDictionary();
        this.dictionary = await this.loadPromise;
        return this.dictionary;
    }
    async _loadDictionary() {
        try {
            // In a Node.js environment, you might use require() or dynamic import
            // In a browser environment, you might fetch the file
            const module = await import(this.dictionaryPath);
            return module.default;
        }
        catch (error) {
            console.warn("[DictionaryLoader] Failed to load dictionary:", error);
            return null;
        }
    }
    /**
     * Get a translation for a specific file, scope, and locale
     */
    async getTranslation(filePath, scopePath, locale = "en") {
        const dict = await this.loadDictionary();
        if (!dict)
            return null;
        const fileEntry = dict.files[filePath];
        if (!fileEntry) {
            console.warn(`[DictionaryLoader] File not found in dictionary: ${filePath}`);
            return null;
        }
        const scopeEntry = fileEntry.entries[scopePath];
        if (!scopeEntry) {
            console.warn(`[DictionaryLoader] Scope not found in dictionary: ${filePath} -> ${scopePath}`);
            return null;
        }
        const translation = scopeEntry.content[locale];
        if (!translation) {
            console.warn(`[DictionaryLoader] Translation not found for locale: ${locale}`);
            return null;
        }
        return translation;
    }
    /**
     * Get all available locales from the dictionary
     */
    async getAvailableLocales() {
        const dict = await this.loadDictionary();
        if (!dict)
            return [];
        const locales = new Set();
        for (const fileEntry of Object.values(dict.files)) {
            for (const scopeEntry of Object.values(fileEntry.entries)) {
                Object.keys(scopeEntry.content).forEach((locale) => locales.add(locale));
            }
        }
        return Array.from(locales);
    }
    /**
     * Get all translation entries for a specific file
     */
    async getFileTranslations(filePath, locale = "en") {
        const dict = await this.loadDictionary();
        if (!dict)
            return {};
        const fileEntry = dict.files[filePath];
        if (!fileEntry)
            return {};
        const translations = {};
        for (const [scopePath, scopeEntry] of Object.entries(fileEntry.entries)) {
            const translation = scopeEntry.content[locale];
            if (translation) {
                translations[scopePath] = translation;
            }
        }
        return translations;
    }
    /**
     * Check if a translation exists
     */
    async hasTranslation(filePath, scopePath, locale = "en") {
        const translation = await this.getTranslation(filePath, scopePath, locale);
        return translation !== null;
    }
}
// Export a default instance for convenience
export const defaultDictionaryLoader = new DictionaryLoader();

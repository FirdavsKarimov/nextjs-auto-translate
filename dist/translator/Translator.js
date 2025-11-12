export class Translator {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async translate(source, targetLocales) {
        const result = {};
        for (const locale of targetLocales) {
            result[locale] = {};
            // Iterate through files and their scopes
            for (const filePath in source.files) {
                const fileScopes = source.files[filePath].scopes;
                for (const scope in fileScopes) {
                    // Create a unique key combining file path and scope
                    const scopeKey = `${filePath}::${scope}`;
                    result[locale][scopeKey] = await this.provider.translateText(fileScopes[scope].content, locale);
                }
            }
        }
        return result;
    }
}

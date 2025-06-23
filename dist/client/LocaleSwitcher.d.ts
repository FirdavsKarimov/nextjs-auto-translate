interface LocaleSwitcherOptions {
    availableLocales?: string[];
    defaultLocale?: string;
    onLocaleChange?: (locale: string) => void;
}
export declare class LocaleSwitcher {
    private availableLocales;
    private currentLocale;
    private onLocaleChange?;
    constructor(options?: LocaleSwitcherOptions);
    private getCurrentLocale;
    setLocale(locale: string): void;
    getLocale(): string;
    getAvailableLocales(): string[];
    createSwitcherHTML(containerId: string): void;
}
export declare const defaultLocaleSwitcher: LocaleSwitcher;
export declare const setLocale: (locale: string) => void;
export declare const getLocale: () => string;
export declare const getAvailableLocales: () => string[];
export declare const createSwitcher: (containerId: string) => void;
export {};

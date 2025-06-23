import { ScopeMap, Dictionary } from "../types";
export interface ITranslateProvider {
    translateText(text: string, targetLang: string): Promise<string>;
}
export declare class Translator {
    private provider;
    constructor(provider: ITranslateProvider);
    translate(source: ScopeMap, targetLocales: string[]): Promise<Dictionary>;
}

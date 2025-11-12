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
export declare class DictionaryGenerator {
    private options;
    private translationService;
    constructor(options: DictionaryGeneratorOptions);
    generateDictionary(sourceMap: ScopeMap): string;
    private writeDictionaryFiles;
}

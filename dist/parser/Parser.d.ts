import { ParserOptions, ScopeMap } from "../types.js";
export declare class Parser {
    private options;
    private lockPath;
    private sourceStore;
    constructor(options?: ParserOptions & {
        outputDir?: string;
    });
    private findFilesSync;
    parseProject(): ScopeMap;
    private hasChanges;
}

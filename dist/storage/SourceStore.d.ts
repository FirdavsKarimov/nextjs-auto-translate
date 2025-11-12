import { ScopeMap } from "../types.js";
export declare class SourceStore {
    path: string;
    constructor(outputDir?: string);
    save(data: ScopeMap): void;
    load(): ScopeMap;
}

import { ScopeMap } from "../types";
export declare class SourceStore {
    path: string;
    save(data: ScopeMap): void;
    load(): ScopeMap;
}

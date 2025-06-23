export type ScopeData = {
    type: "text" | "element";
    hash: string;
    context: string;
    skip: boolean;
    overrides: Record<string, string>;
    content: string;
};
export type FileScopes = {
    scopes: {
        [scope: string]: ScopeData;
    };
};
export type ScopeMap = {
    version?: number;
    files: {
        [filePath: string]: FileScopes;
    };
};
export type Dictionary = {
    [locale: string]: {
        [scope: string]: string;
    };
};
export interface ParserOptions {
    includeNodeModules?: boolean;
}

export interface DictStructure {
    version: string;
    files: Record<string, {
        entries: Record<string, {
            content: Record<string, string>;
            hash: string;
        }>;
    }>;
}

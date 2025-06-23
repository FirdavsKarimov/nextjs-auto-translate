declare const fs: any;
declare const path: any;
interface LoaderContext {
    async(): (err: Error | null, result?: string) => void;
    getOptions(): any;
    rootContext?: string;
    resourcePath: string;
}

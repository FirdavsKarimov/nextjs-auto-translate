interface LoaderContext {
    async(): (err: Error | null, result?: string) => void;
    getOptions(): any;
    rootContext?: string;
    resourcePath: string;
}
export default function (this: LoaderContext, source: string): void;
export {};

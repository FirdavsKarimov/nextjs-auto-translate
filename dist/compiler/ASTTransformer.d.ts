interface TransformOptions {
    filePath: string;
    sourceMap: any;
}
export declare class ASTTransformer {
    /**
     * Transform code by replacing JSX elements with translatable text with IntlComponent
     */
    transformCode(code: string, options: TransformOptions): string;
    /**
     * Check if JSX element has translatable text content
     */
    private hasTranslatableText;
    /**
     * Generate scope path for JSX element (simplified version)
     */
    private generateScopePath;
    /**
     * Transform JSX element to use our IntlComponent
     */
    private transformJSXElement;
    /**
     * Get JSX element name
     */
    private getJSXElementName;
    /**
     * Extract variables from JSX expressions
     */
    private extractVariables;
    /**
     * Ensure IntlComponent import exists
     */
    private ensureIntlComponentImport;
}
export {};

import * as t from "@babel/types";
import { ScopeMap } from "../types";
export declare function injectTranslated(scope: string): t.JSXElement;
export declare function ensureImportTranslated(ast: t.File): void;
export declare function ensureImportLocalesSwitcher(ast: t.File): void;
export declare function injectLocaleSwitcher(ast: t.File): void;
export declare function transformProject(code: string, options: {
    sourceMap: ScopeMap;
    filePath: string;
}): any;

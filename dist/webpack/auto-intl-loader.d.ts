import type { LoaderContext } from "webpack";
import { ScopeMap } from "../types.js";
interface LoaderOptions {
    sourceMap: ScopeMap;
}
export default function loader(this: LoaderContext<LoaderOptions>, source: string): void;
export {};

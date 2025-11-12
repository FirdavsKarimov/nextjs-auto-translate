import { Dictionary } from "../types.js";
export declare class DictionaryStore {
    private path;
    save(data: Dictionary): void;
    load(): Dictionary;
    merge(newData: Dictionary): Dictionary;
}

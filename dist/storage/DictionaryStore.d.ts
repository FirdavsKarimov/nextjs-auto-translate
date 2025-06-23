import { Dictionary } from "../types";
export declare class DictionaryStore {
    private path;
    save(data: Dictionary): void;
    load(): Dictionary;
    merge(newData: Dictionary): Dictionary;
}

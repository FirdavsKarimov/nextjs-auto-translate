import { DictStructure } from "../types";
declare class Dictionary {
    private locale;
    private dictionary;
    constructor(locale: string);
    load: () => Promise<DictStructure>;
    setLocale: (locale: string) => void;
}
export default Dictionary;

import path from "path";
import fs from "fs/promises";
class Dictionary {
    constructor(locale) {
        this.dictionary = {
            version: "",
            files: {}
        };
        this.load = async () => {
            const dictionaryJsonPath = path.join(process.cwd(), "./src/intl", "dictionary.json");
            const dictionaryJson = await fs.readFile(dictionaryJsonPath, "utf8");
            this.dictionary = JSON.parse(dictionaryJson);
            return this.dictionary;
        };
        this.setLocale = (locale) => {
            this.locale = locale;
        };
        this.locale = locale;
    }
}
export default Dictionary;

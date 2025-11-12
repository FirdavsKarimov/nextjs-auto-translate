// src/storage/DictionaryStore.ts
import fs from "fs";
import path from "path";
export class DictionaryStore {
    path = path.resolve(process.cwd(), ".intl/dictionary.json");
    save(data) {
        fs.mkdirSync(path.dirname(this.path), { recursive: true });
        fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
    }
    load() {
        if (!fs.existsSync(this.path))
            return {};
        return JSON.parse(fs.readFileSync(this.path, "utf-8"));
    }
    merge(newData) {
        const existing = this.load();
        for (const locale of Object.keys(newData)) {
            existing[locale] = { ...existing[locale], ...newData[locale] };
        }
        return existing;
    }
}

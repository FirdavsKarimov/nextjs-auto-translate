// src/storage/DictionaryStore.ts
import fs from "fs";
import path from "path";
import { Dictionary } from "../types.js";

export class DictionaryStore {
  private path = path.resolve(process.cwd(), ".intl/dictionary.json");

  save(data: Dictionary): void {
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  load(): Dictionary {
    if (!fs.existsSync(this.path)) return {} as Dictionary;
    return JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  merge(newData: Dictionary): Dictionary {
    const existing = this.load();
    for (const locale of Object.keys(newData)) {
      existing[locale] = { ...existing[locale], ...newData[locale] };
    }
    return existing;
  }
}

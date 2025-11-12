// src/storage/SourceStore.ts
import fs from "fs";
import path from "path";
import { ScopeMap } from "../types.js";

export class SourceStore {
  public path: string;

  constructor(outputDir: string = ".intl") {
    this.path = path.resolve(process.cwd(), outputDir, "source.json");
  }

  save(data: ScopeMap): void {
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  load(): ScopeMap {
    if (!fs.existsSync(this.path)) {
      return { version: 0.1, files: {} };
    }

    try {
      const content = JSON.parse(fs.readFileSync(this.path, "utf-8"));

      // Check if it's the old format (flat structure)
      if (!content.files && !content.version) {
        console.log(
          "[SourceStore] Detected old format, migrating to new structure..."
        );
        // This is the old flat format, return empty new format to trigger re-parsing
        return { version: 0.1, files: {} };
      }

      // Ensure the structure has required fields
      return {
        version: content.version || 0.1,
        files: content.files || {}
      };
    } catch (error) {
      console.warn(
        "[SourceStore] Error reading source.json, starting fresh:",
        error
      );
      return { version: 0.1, files: {} };
    }
  }
}

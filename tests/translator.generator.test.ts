import { describe, it, expect } from "vitest";
import { DictionaryGenerator } from "../src/translator/DictionaryGenerator";
import type { ScopeMap } from "../src/types";
import fs from "fs";
import path from "path";

const tmpDir = ".intl-test";

const makeScopeMap = (): ScopeMap => ({
	files: {
		"src/C.tsx": {
			scopes: {
				"a/b/c": { 
					type: "text",
					content: "Hello", 
					hash: "h1",
					context: "",
					skip: false,
					overrides: {}
				},
			}
		}
	}
});

describe("DictionaryGenerator", () => {
	it("generates dictionary.json with target locales", () => {
		const gen = new DictionaryGenerator({ defaultLocale: "en" as any, targetLocales: ["es", "fr"] as any, outputDir: tmpDir });
		const out = gen.generateDictionary(makeScopeMap());
		expect(out).toContain(path.join(tmpDir, "dictionary.json"));
		const raw = fs.readFileSync(out, "utf-8");
		const json = JSON.parse(raw);
		expect(json.files["src/C.tsx"].entries["a/b/c"].content.en).toBe("Hello");
		expect(json.files["src/C.tsx"].entries["a/b/c"].content.es).toContain("[ES]");
	});

	for (let i = 0; i < 9; i++) {
		it(`mock translation prefixes non-en (${i+1})`, () => {
			const gen = new DictionaryGenerator({ defaultLocale: "en" as any, targetLocales: ["de"] as any, outputDir: tmpDir });
			const out = gen.generateDictionary(makeScopeMap());
			const raw = fs.readFileSync(out, "utf-8");
			const json = JSON.parse(raw);
			expect(json.files["src/C.tsx"].entries["a/b/c"].content.de.startsWith("[DE] ")).toBe(true);
		});
	}
});



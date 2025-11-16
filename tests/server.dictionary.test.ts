import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import Dictionary from "../src/runtime/server/Dictionary";

const outDir = "src/intl-test";

const writeDict = () => {
	const json = {
		version: "0.1",
		files: {
			"a": {
				entries: {
					"b": { content: { en: "Hi" }, hash: "h" }
				}
			}
		}
	};
	fs.mkdirSync(path.join(process.cwd(), outDir), { recursive: true });
	fs.writeFileSync(path.join(process.cwd(), outDir, "dictionary.json"), JSON.stringify(json));
};

describe("server Dictionary", () => {
	it("loads dictionary.json from env dir", async () => {
		process.env.ALGEBRAS_INTL_OUTPUT_DIR = outDir;
		writeDict();
		const d = new Dictionary("en");
		const obj: any = await d.load();
		expect(obj.version).toBe("0.1");
		expect(obj.files.a.entries.b.content.en).toBe("Hi");
	});

	for (let i = 0; i < 4; i++) {
		it(`re-loads (${i+1})`, async () => {
			process.env.ALGEBRAS_INTL_OUTPUT_DIR = outDir;
			writeDict();
			const d = new Dictionary("en");
			const obj: any = await d.load();
			expect(obj.files.a.entries.b.hash).toBe("h");
		});
	}
});



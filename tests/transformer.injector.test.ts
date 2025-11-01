import { describe, it, expect } from "vitest";
import { transformProject } from "../src/transformer/Injector";

describe("transformProject - stability", () => {
	it("returns original code when file not in scopeMap", () => {
		const code = "export default function App(){return <div>Hello</div>}";
		const result = transformProject(code, { filePath: `${process.cwd()}/other.tsx`, sourceMap: { files: {} } as any });
		expect(result).toBe(code);
	});

	it("returns original code on parse error", () => {
		const file = "src/Broken.tsx";
		const code = "export default () => <div>"; // invalid JSX
		const result = transformProject(code, { filePath: `${process.cwd()}/${file}`, sourceMap: { files: { [file]: { scopes: {} } } } as any });
		expect(result).toBe(code);
	});

	for (let i = 0; i < 19; i++) {
		it(`processes valid TSX without throwing (#${i+1})`, () => {
			const file = `src/R${i}.tsx`;
			const code = "export default function C(){return <main><h1>Hello</h1><p>World</p></main>}";
			const result = transformProject(code, { filePath: `${process.cwd()}/${file}`, sourceMap: { files: { [file]: { scopes: {} } } } as any });
			expect(typeof result).toBe("string");
		});
	}
});

import { describe, it, expect } from "vitest";
import loader from "../src/webpack/auto-intl-loader";

const runLoader = (code: string, opts: any) => new Promise<string>((resolve, reject) => {
	const ctx: any = {
		getOptions: () => opts,
		async: () => (err: any, result: string) => err ? reject(err) : resolve(result),
		resourcePath: `${process.cwd()}/src/X.tsx`,
		emitError: reject
	};
	(loader as any).call(ctx, code);
});

describe("webpack loader", () => {
	it("passes through when no scopes", async () => {
		const out = await runLoader("export default ()=> <div>Hello</div>", { sourceMap: { files: {} } });
		expect(out).toContain("Hello");
	});

	for (let i = 0; i < 4; i++) {
		it(`runs without throwing (${i+1})`, async () => {
			const out = await runLoader("export default ()=> <div>Hello</div>", { sourceMap: { files: {} } });
			expect(typeof out).toBe("string");
		});
	}
});



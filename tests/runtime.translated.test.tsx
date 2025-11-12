import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Translated from "../src/runtime/client/components/Translated";
import ClientProvider from "../src/runtime/client/Provider";
import type { DictStructure } from "../src/runtime/types";
import { LanguageCode } from "../src/data/languageMap";

const makeDict = (): DictStructure => ({
	version: "0.1",
	files: {
		"src/F.tsx": {
			entries: {
				"x/y": {
					content: {
						[LanguageCode.en]: "Hello",
						[LanguageCode.es]: "[ES] Hello"
					},
					hash: "h"
				}
			}
		}
	}
});

// Test wrapper that converts dictionary object to the expected props
const TestProvider = ({ dictionary, locale, children }: { dictionary: DictStructure; locale: string; children: React.ReactNode }) => {
	return (
		<ClientProvider dictJson={JSON.stringify(dictionary)} initialLocale={locale}>
			{children}
		</ClientProvider>
	);
};

describe("Translated component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders content for locale en", () => {
		render(
			<TestProvider dictionary={makeDict()} locale={LanguageCode.en}>
				<Translated tKey="src/F.tsx::x/y" />
			</TestProvider>
		);
		expect(screen.getByText("Hello")).toBeInTheDocument();
	});

	it("renders content for locale es", () => {
		render(
			<TestProvider dictionary={makeDict()} locale={LanguageCode.es}>
				<Translated tKey="src/F.tsx::x/y" />
			</TestProvider>
		);
		expect(screen.getByText("[ES] Hello")).toBeInTheDocument();
	});

	for (let i = 0; i < 8; i++) {
		it(`renders multiple times (${i+1})`, () => {
			render(
				<TestProvider dictionary={makeDict()} locale={LanguageCode.en}>
					<Translated tKey="src/F.tsx::x/y" />
				</TestProvider>
			);
			expect(screen.getByText("Hello")).toBeInTheDocument();
		});
	}
});

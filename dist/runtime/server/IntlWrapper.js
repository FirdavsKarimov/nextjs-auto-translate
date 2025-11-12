import { jsx as _jsx } from "react/jsx-runtime";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import AlgebrasIntlClientProvider from "../client/Provider.js";
import { LanguageCode } from "../../data/languageMap.js";
const IntlWrapper = async ({ children }) => {
    const cookieStore = await cookies();
    let cookiesLocale = cookieStore.get("locale")?.value || "en";
    if (!Object.values(LanguageCode).includes(cookiesLocale)) {
        cookiesLocale = "en";
    }
    // Load dictionary directly as JSON
    const outputDir = process.env.ALGEBRAS_INTL_OUTPUT_DIR || ".intl";
    const dictionaryPath = path.join(process.cwd(), outputDir, "dictionary.json");
    const dictionaryJson = await fs.readFile(dictionaryPath, "utf8");
    const dictionary = JSON.parse(dictionaryJson);
    // Create completely plain serializable object
    const dictData = JSON.stringify(dictionary);
    const parsedDict = JSON.parse(dictData);
    return (_jsx(AlgebrasIntlClientProvider, { dictJson: dictData, initialLocale: cookiesLocale, children: children }));
};
export default IntlWrapper;

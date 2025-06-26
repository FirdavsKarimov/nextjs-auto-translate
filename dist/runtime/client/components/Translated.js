"use client";
import { Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useAlgebrasIntl } from "../Provider";
const Translated = (props) => {
    const { tKey } = props;
    const [fileKey, entryKey] = tKey.split("::");
    const { dictionary, locale } = useAlgebrasIntl();
    // Check if the file exists in dictionary
    if (!dictionary.files[fileKey]) {
        console.error(`File "${fileKey}" not found in dictionary`);
        return _jsxs(_Fragment, { children: ["\uD83D\uDEAB File not found: ", fileKey] });
    }
    // Check if the entry exists in the file
    if (!dictionary.files[fileKey].entries[entryKey]) {
        console.error(`Entry "${entryKey}" not found in file "${fileKey}"`);
        return _jsxs(_Fragment, { children: ["\uD83D\uDEAB Entry not found: ", entryKey] });
    }
    // Check if the locale content exists
    const content = dictionary.files[fileKey].entries[entryKey].content[locale];
    if (!content) {
        console.error(`Content for locale "${locale}" not found in "${fileKey}::${entryKey}"`);
        return _jsxs(_Fragment, { children: ["\uD83D\uDEAB Content not found for locale: ", locale] });
    }
    return _jsxs(_Fragment, { children: ["\u2705 ", content] });
};
export default Translated;

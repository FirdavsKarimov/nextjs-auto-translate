"use client";
import { Fragment as _Fragment, jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { createElement } from "react";
import { useAlgebrasIntl } from "../Provider";
const Translated = (props) => {
    const { tKey } = props;
    const [fileKey, entryKey] = tKey.split("::");
    const { dictionary, locale } = useAlgebrasIntl();
    // Check if the file exists in dictionary
    if (!dictionary.files[fileKey]) {
        console.error(`File "${fileKey}" not found in dictionary`);
        console.error(`Available files:`, Object.keys(dictionary.files));
        console.error(`tKey was:`, tKey);
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
    // Parse content with <element:tag> syntax back into React elements
    const parseContent = (text) => {
        const elementRegex = /<element:(\w+)>(.*?)<\/element:\1>/gs;
        const parts = [];
        let lastIndex = 0;
        let match;
        let iterationCount = 0;
        const maxIterations = 100; // Prevent infinite loops
        while ((match = elementRegex.exec(text)) !== null) {
            // Safety check to prevent infinite loops
            if (++iterationCount > maxIterations) {
                console.error('Maximum iterations exceeded in parseContent');
                break;
            }
            // Add text before the element
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            // Add the element
            const tagName = match[1];
            const innerContent = match[2];
            parts.push(createElement(tagName, { key: match.index }, parseContent(innerContent)));
            lastIndex = elementRegex.lastIndex;
            // Safety check: if we're not advancing, break to prevent infinite loop
            if (lastIndex <= match.index) {
                console.error('Regex not advancing, breaking to prevent infinite loop');
                break;
            }
        }
        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return parts.length > 0 ? parts : text;
    };
    return _jsx(_Fragment, { children: parseContent(content) });
};
export default Translated;

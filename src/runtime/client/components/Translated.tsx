"use client";

import { useAlgebrasIntl } from "../Provider";

interface TranslatedProps {
  tKey: string;
}

const Translated = (props: TranslatedProps) => {
  const { tKey } = props;
  const [fileKey, entryKey] = tKey.split("::");

  const { dictionary, locale } = useAlgebrasIntl();

  // Check if the file exists in dictionary
  if (!dictionary.files[fileKey]) {
    console.error(`File "${fileKey}" not found in dictionary`);
    return <>🚫 File not found: {fileKey}</>;
  }

  // Check if the entry exists in the file
  if (!dictionary.files[fileKey].entries[entryKey]) {
    console.error(`Entry "${entryKey}" not found in file "${fileKey}"`);
    return <>🚫 Entry not found: {entryKey}</>;
  }

  // Check if the locale content exists
  const content = dictionary.files[fileKey].entries[entryKey].content[locale];
  if (!content) {
    console.error(
      `Content for locale "${locale}" not found in "${fileKey}::${entryKey}"`
    );
    return <>🚫 Content not found for locale: {locale}</>;
  }

  return <>✅ {content}</>;
};

export default Translated;

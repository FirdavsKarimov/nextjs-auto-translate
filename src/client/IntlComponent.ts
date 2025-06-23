// src/client/IntlComponent.ts
interface Dictionary {
  version: number;
  files: {
    [filePath: string]: {
      entries: {
        [scopePath: string]: {
          content: Record<string, string>;
          hash: string;
        };
      };
    };
  };
}

interface IntlComponentProps {
  $as: string;
  $filePath: string;
  $scopePath: string;
  $variables?: Record<string, any>;
  locale?: string;
  [key: string]: any;
}

// Cache for dictionary to avoid multiple loads
let dictionaryCache: Dictionary | null = null;
let dictionaryPromise: Promise<Dictionary | null> | null = null;

const loadDictionary = async (): Promise<Dictionary | null> => {
  if (dictionaryCache) return dictionaryCache;
  if (dictionaryPromise) return dictionaryPromise;

  dictionaryPromise = (async () => {
    try {
      // Try to dynamically import the dictionary
      // The path will be relative to where this component is used
      // @ts-ignore - Dynamic import path resolved at runtime
      const module = await import("./intl/dictionary.js");
      dictionaryCache = module.default;
      return dictionaryCache;
    } catch (error) {
      console.warn("[IntlComponent] Failed to load dictionary:", error);
      return null;
    }
  })();

  return dictionaryPromise;
};

// Get locale from various sources
const getCurrentLocale = (): string => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocale = urlParams.get("locale");
    if (urlLocale) return urlLocale;

    const savedLocale = localStorage.getItem("algebras-auto-intl-locale");
    if (savedLocale) return savedLocale;
  }

  return "en";
};

// Parse content and replace variables
const parseContent = (
  content: string,
  variables?: Record<string, any>
): string => {
  if (!content) return "";

  let processedContent = content;

  // Replace variables
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      processedContent = processedContent.replace(regex, String(value));
    });
  }

  // For now, we'll keep the element tags as-is
  // In a more sophisticated implementation, we'd parse them into actual React elements
  return processedContent;
};

// Simple component factory function
export const createIntlComponent = () => {
  const IntlComponent = (props: IntlComponentProps) => {
    const {
      $as,
      $filePath,
      $scopePath,
      $variables,
      locale: propLocale,
      ...restProps
    } = props;

    const currentLocale = propLocale || getCurrentLocale();

    // For now, return a promise-based approach
    // In a real React environment, this would use useState/useEffect
    loadDictionary().then((dictionary) => {
      if (!dictionary) return;

      const fileEntry = dictionary.files[$filePath];
      if (!fileEntry) {
        console.warn(
          `[IntlComponent] File not found in dictionary: ${$filePath}`
        );
        return;
      }

      const scopeEntry = fileEntry.entries[$scopePath];
      if (!scopeEntry) {
        console.warn(
          `[IntlComponent] Scope not found in dictionary: ${$filePath} -> ${$scopePath}`
        );
        return;
      }

      const content =
        scopeEntry.content[currentLocale] || scopeEntry.content["en"];
      if (content) {
        const translatedContent = parseContent(content, $variables);
        // Update the element content if we have access to the DOM
        // This is a simplified approach
        console.log(
          `[IntlComponent] Translation for ${$scopePath}:`,
          translatedContent
        );
      }
    });

    // Return basic props for now - in a real implementation this would be a proper React component
    return {
      type: $as,
      props: restProps,
      content: "Loading translation..."
    };
  };

  return IntlComponent;
};

// Export a utility for setting locale
export const setLocale = (locale: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("algebras-auto-intl-locale", locale);
    // Optionally reload the page or trigger re-render
    window.location.reload();
  }
};

export const getAvailableLocales = async (): Promise<string[]> => {
  const dictionary = await loadDictionary();
  if (!dictionary) return ["en"];

  const locales = new Set<string>();
  Object.values(dictionary.files).forEach((file) => {
    Object.values(file.entries).forEach((entry) => {
      Object.keys(entry.content).forEach((locale) => locales.add(locale));
    });
  });

  return Array.from(locales);
};

export default createIntlComponent;

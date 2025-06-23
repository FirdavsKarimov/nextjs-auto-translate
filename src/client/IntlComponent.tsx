import React, { useState, useEffect, useMemo } from "react";

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
  $as: string | React.ComponentType<any>;
  $filePath: string;
  $scopePath: string;
  $variables?: Record<string, any>;
  locale?: string;
  [key: string]: any; // For preserving original props
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
      const module = await import("../intl/dictionary.js");
      dictionaryCache = module.default;
      return dictionaryCache;
    } catch (error) {
      console.warn("[IntlComponent] Failed to load dictionary:", error);
      return null;
    }
  })();

  return dictionaryPromise;
};

// Get locale from various sources (URL, localStorage, etc.)
const getCurrentLocale = (): string => {
  // Check URL params first
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocale = urlParams.get("locale");
    if (urlLocale) return urlLocale;

    // Check localStorage
    const savedLocale = localStorage.getItem("algebras-auto-intl-locale");
    if (savedLocale) return savedLocale;
  }

  return "en"; // Default fallback
};

// Parse content with embedded elements like <element:code>content</element:code>
const parseContent = (
  content: string,
  variables?: Record<string, any>
): React.ReactNode => {
  if (!content) return null;

  // Replace variables first
  let processedContent = content;
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      processedContent = processedContent.replace(regex, String(value));
    });
  }

  // Parse element tags
  const elementPattern = /<element:(\w+)>([^<]*)<\/element:\1>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = elementPattern.exec(processedContent)) !== null) {
    // Add text before the element
    if (match.index > lastIndex) {
      const textPart = processedContent.substring(lastIndex, match.index);
      if (textPart) {
        parts.push(textPart);
      }
    }

    // Add the element
    const elementName = match[1];
    const elementContent = match[2];
    const key = `element-${keyCounter++}`;

    switch (elementName.toLowerCase()) {
      case "br":
        parts.push(<br key={key} />);
        break;
      case "code":
        parts.push(<code key={key}>{elementContent}</code>);
        break;
      case "strong":
        parts.push(<strong key={key}>{elementContent}</strong>);
        break;
      case "em":
        parts.push(<em key={key}>{elementContent}</em>);
        break;
      case "span":
        parts.push(<span key={key}>{elementContent}</span>);
        break;
      default:
        // For unknown elements, just render the content
        parts.push(<span key={key}>{elementContent}</span>);
    }

    lastIndex = elementPattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < processedContent.length) {
    const remainingText = processedContent.substring(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  return parts.length === 0 ? processedContent : parts;
};

export const IntlComponent: React.FC<IntlComponentProps> = ({
  $as,
  $filePath,
  $scopePath,
  $variables,
  locale: propLocale,
  ...restProps
}) => {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLocale = propLocale || getCurrentLocale();

  useEffect(() => {
    loadDictionary().then((dict) => {
      setDictionary(dict);
      setLoading(false);
      if (!dict) {
        setError("Failed to load dictionary");
      }
    });
  }, []);

  const translatedContent = useMemo(() => {
    if (!dictionary || loading || error) return null;

    const fileEntry = dictionary.files[$filePath];
    if (!fileEntry) {
      console.warn(
        `[IntlComponent] File not found in dictionary: ${$filePath}`
      );
      return null;
    }

    const scopeEntry = fileEntry.entries[$scopePath];
    if (!scopeEntry) {
      console.warn(
        `[IntlComponent] Scope not found in dictionary: ${$filePath} -> ${$scopePath}`
      );
      return null;
    }

    const content = scopeEntry.content[currentLocale];
    if (!content) {
      // Fallback to English if available
      const englishContent = scopeEntry.content["en"];
      if (englishContent) {
        return parseContent(englishContent, $variables);
      }
      console.warn(
        `[IntlComponent] Translation not found for locale: ${currentLocale}`
      );
      return null;
    }

    return parseContent(content, $variables);
  }, [
    dictionary,
    loading,
    error,
    $filePath,
    $scopePath,
    currentLocale,
    $variables
  ]);

  if (loading) {
    // During loading, we could render a placeholder or the original content
    return React.createElement($as as any, restProps, "Loading...");
  }

  if (error || !translatedContent) {
    // Fallback: render the element without translated content
    return React.createElement($as as any, restProps, "Translation not found");
  }

  // Render the translated content using the original element type
  return React.createElement($as as any, restProps, translatedContent);
};

export default IntlComponent;

"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
import { DictStructure } from "../types.js";
import { LanguageCode } from "../../data/languageMap.js";

const context = createContext<{
  dictionary: DictStructure;
  locale: string;
  setLocale: (locale: string) => void;
}>({
  dictionary: {
    version: "",
    files: {}
  },
  locale: "en",
  setLocale: () => {}
});

export const useAlgebrasIntl = () => {
  const ctx = useContext(context);
  
  const getLocales = () => {
    const entries = Object.values(ctx.dictionary.files)[0]?.entries;
    if (!entries) return [];
    const content = Object.values(entries)[0]?.content;
    if (!content) return [];
    return Object.keys(content);
  };
  
  return {
    ...ctx,
    getLocales
  };
};

interface AlgebrasIntlProviderProps {
  children: ReactNode;
  dictJson: string;
  initialLocale: string;
}

const AlgebrasIntlClientProvider = (props: AlgebrasIntlProviderProps) => {
  const [dictionary] = useState<DictStructure>(() => JSON.parse(props.dictJson));
  const [locale, setLocaleState] = useState<string>(props.initialLocale);

  useEffect(() => {
    document.cookie = `locale=${locale}; path=/;`;
  }, [locale]);

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
  }, []);

  const contextValue = useMemo(() => ({
    dictionary,
    locale,
    setLocale
  }), [dictionary, locale, setLocale]);

  return (
    <context.Provider value={contextValue}>
      {props.children}
    </context.Provider>
  );
};

export default AlgebrasIntlClientProvider;

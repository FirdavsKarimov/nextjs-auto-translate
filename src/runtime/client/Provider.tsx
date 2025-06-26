"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { DictStructure } from "../types";

const context = createContext<{
  dictionary: DictStructure;
  locale: string;
  setLocale: (locale: string) => void;
}>({
  dictionary: {
    version: "",
    files: {}
  },
  locale: "",
  setLocale: () => {}
});

export const useAlgebrasIntl = () => {
  return useContext(context);
};

interface AlgebrasIntlProviderProps {
  children: ReactNode;
  dictionary: DictStructure;
  locale: string;
}

const AlgebrasIntlClientProvider = (props: AlgebrasIntlProviderProps) => {
  console.log("provider mounted");
  const [locale, setLocale] = useState(props.locale);

  useEffect(() => {
    document.cookie = `locale=${locale}; path=/;`;
  }, [locale]);

  return (
    <context.Provider
      value={{ dictionary: props.dictionary, locale, setLocale }}
    >
      {props.children}
    </context.Provider>
  );
};

export default AlgebrasIntlClientProvider;

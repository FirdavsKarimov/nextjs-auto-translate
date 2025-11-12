"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
const context = createContext({
    dictionary: {
        version: "",
        files: {}
    },
    locale: "en",
    setLocale: () => { }
});
export const useAlgebrasIntl = () => {
    const ctx = useContext(context);
    const getLocales = () => {
        const entries = Object.values(ctx.dictionary.files)[0]?.entries;
        if (!entries)
            return [];
        const content = Object.values(entries)[0]?.content;
        if (!content)
            return [];
        return Object.keys(content);
    };
    return {
        ...ctx,
        getLocales
    };
};
const AlgebrasIntlClientProvider = (props) => {
    const [dictionary] = useState(() => JSON.parse(props.dictJson));
    const [locale, setLocaleState] = useState(props.initialLocale);
    useEffect(() => {
        document.cookie = `locale=${locale}; path=/;`;
    }, [locale]);
    const setLocale = useCallback((newLocale) => {
        setLocaleState(newLocale);
    }, []);
    const contextValue = useMemo(() => ({
        dictionary,
        locale,
        setLocale
    }), [dictionary, locale, setLocale]);
    return (_jsx(context.Provider, { value: contextValue, children: props.children }));
};
export default AlgebrasIntlClientProvider;

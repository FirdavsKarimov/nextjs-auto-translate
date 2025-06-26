"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
const context = createContext({
    dictionary: {
        version: "",
        files: {}
    },
    locale: "",
    setLocale: () => { }
});
export const useAlgebrasIntl = () => {
    return useContext(context);
};
const AlgebrasIntlClientProvider = (props) => {
    console.log("provider mounted");
    const [locale, setLocale] = useState(props.locale);
    useEffect(() => {
        document.cookie = `locale=${locale}; path=/;`;
    }, [locale]);
    return (_jsx(context.Provider, { value: { dictionary: props.dictionary, locale, setLocale }, children: props.children }));
};
export default AlgebrasIntlClientProvider;

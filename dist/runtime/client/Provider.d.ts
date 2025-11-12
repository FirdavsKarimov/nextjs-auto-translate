import { ReactNode } from "react";
import { DictStructure } from "../types.js";
export declare const useAlgebrasIntl: () => {
    getLocales: () => string[];
    dictionary: DictStructure;
    locale: string;
    setLocale: (locale: string) => void;
};
interface AlgebrasIntlProviderProps {
    children: ReactNode;
    dictJson: string;
    initialLocale: string;
}
declare const AlgebrasIntlClientProvider: (props: AlgebrasIntlProviderProps) => import("react/jsx-runtime").JSX.Element;
export default AlgebrasIntlClientProvider;

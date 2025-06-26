import { ReactNode } from "react";
import { DictStructure } from "../types";
export declare const useAlgebrasIntl: () => {
    dictionary: DictStructure;
    locale: string;
    setLocale: (locale: string) => void;
};
interface AlgebrasIntlProviderProps {
    children: ReactNode;
    dictionary: DictStructure;
    locale: string;
}
declare const AlgebrasIntlClientProvider: (props: AlgebrasIntlProviderProps) => import("react/jsx-runtime").JSX.Element;
export default AlgebrasIntlClientProvider;

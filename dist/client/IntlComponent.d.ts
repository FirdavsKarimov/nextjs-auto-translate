interface IntlComponentProps {
    $as: string;
    $filePath: string;
    $scopePath: string;
    $variables?: Record<string, any>;
    locale?: string;
    [key: string]: any;
}
export declare const createIntlComponent: () => (props: IntlComponentProps) => {
    type: string;
    props: {
        [key: string]: any;
    };
    content: string;
};
export declare const setLocale: (locale: string) => void;
export declare const getAvailableLocales: () => Promise<string[]>;
export default createIntlComponent;

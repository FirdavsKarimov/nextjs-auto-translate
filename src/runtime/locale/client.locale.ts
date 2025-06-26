export const getLocale = () => {
  const match = document.cookie.match(/(^|;) ?locale=([^;]*)/);
  return match?.[2] ?? navigator.language.split("-")[0] ?? "en";
};

export const setLocale = (locale: string) => {
  document.cookie = `locale=${locale}; path=/`;
};

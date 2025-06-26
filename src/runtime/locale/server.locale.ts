import { headers, cookies } from "next/headers";

export const getLocale = async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return (
    cookieStore.get("locale")?.value ||
    headerStore.get("accept-language")?.split(",")[0].split("-")[0] ||
    "en"
  );
};

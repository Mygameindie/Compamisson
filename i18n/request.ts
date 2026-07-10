import { getRequestConfig } from "next-intl/server";

// Single-locale setup for now: everything renders in English, but every
// user-facing string already flows through next-intl. Adding Thai later is
// a matter of creating messages/th.json and switching on locale routing.
export default getRequestConfig(async () => {
  const locale = "en";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

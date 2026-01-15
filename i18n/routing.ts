import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["vi", "en"],

  // Default locale
  defaultLocale: "vi",

  // Locale prefix strategy
  localePrefix: "always",
});

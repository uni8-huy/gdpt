"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const locales = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLocale = locales.find((l) => l.code === locale);

  return (
    <div className="relative group">
      <button className="flex items-center justify-center w-9 h-9 text-lg rounded-md hover:bg-muted transition-colors">
        {currentLocale?.flag}
      </button>
      <div className="absolute right-0 top-full mt-1 w-40 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {locales.map((l) => (
          <button
            key={l.code}
            onClick={() => handleChange(l.code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${
              locale === l.code ? "bg-muted font-medium" : ""
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

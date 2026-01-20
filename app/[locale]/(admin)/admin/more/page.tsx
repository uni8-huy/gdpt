import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Calendar, Bell, Upload, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminMorePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav");

  const moreItems = [
    { href: "/admin/events", icon: Calendar, label: t("events") },
    { href: "/admin/announcements", icon: Bell, label: t("announcements") },
    { href: "/admin/import", icon: Upload, label: t("import") },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("more")}</h1>

      <Card>
        <CardContent className="p-0">
          {moreItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-4 hover:bg-muted transition-colors ${
                index !== moreItems.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

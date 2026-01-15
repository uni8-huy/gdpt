import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { Link } from "@/i18n/navigation";
import { columns } from "./columns";
import { getEvents } from "@/lib/actions/event-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "event" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");

  const events = await getEvents();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý sự kiện và hoạt động
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sự kiện
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={events}
        searchKey="title"
        searchPlaceholder="Tìm theo tiêu đề..."
      />
    </div>
  );
}

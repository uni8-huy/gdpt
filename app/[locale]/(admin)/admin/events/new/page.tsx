import { setRequestLocale, getTranslations } from "next-intl/server";
import { EventForm } from "../event-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "event" });
  return {
    title: `Thêm ${t("title")} - Admin`,
  };
}

export default async function NewEventPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Thêm sự kiện mới</h1>
      <EventForm locale={locale} />
    </div>
  );
}

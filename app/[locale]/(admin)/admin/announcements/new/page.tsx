import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AnnouncementForm } from "../announcement-form";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "announcement" });
  return {
    title: `Thêm ${t("title")} - Admin`,
  };
}

export default async function NewAnnouncementPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole("ADMIN", locale);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Thêm thông báo mới</h1>
      <AnnouncementForm authorId={session.user.id} locale={locale} />
    </div>
  );
}

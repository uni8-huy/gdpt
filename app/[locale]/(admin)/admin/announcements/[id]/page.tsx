import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AnnouncementForm } from "../announcement-form";
import { getAnnouncement } from "@/lib/actions/announcement-actions";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  return {
    title: announcement ? `${announcement.title} - Admin` : "Thông báo - Admin",
  };
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await requireRole("ADMIN", locale);
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa: {announcement.title}</h1>
      <AnnouncementForm
        announcement={announcement}
        authorId={session.user.id}
        locale={locale}
      />
    </div>
  );
}

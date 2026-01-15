import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { EventForm } from "../event-form";
import { getEvent } from "@/lib/actions/event-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  return {
    title: event ? `${event.title} - Admin` : "Sự kiện - Admin",
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa: {event.title}</h1>
      <EventForm event={event} locale={locale} />
    </div>
  );
}

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  LandingNavbar,
  LandingHero,
  LandingAbout,
  LandingPrograms,
  LandingEvents,
  LandingAnnouncements,
  LandingContact,
  LandingFooter,
} from "@/components/landing";

// Force dynamic rendering - page fetches from database
export const dynamic = "force-dynamic";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: `${t("appFullName")} | ${t("appName")}`,
    description: t("appDescription"),
    openGraph: {
      title: t("appFullName"),
      description: t("appDescription"),
      type: "website",
    },
  };
}

// Fetch public events
async function getPublicEvents() {
  return db.event.findMany({
    where: {
      isPublic: true,
      startDate: {
        gte: new Date(), // Only future events
      },
    },
    orderBy: {
      startDate: "asc",
    },
    take: 6,
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      location: true,
    },
  });
}

// Fetch public announcements
async function getPublicAnnouncements() {
  return db.announcement.findMany({
    where: {
      isPublished: true,
      isPublic: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
    select: {
      id: true,
      title: true,
      content: true,
      publishedAt: true,
    },
  });
}

export default async function HomePage() {
  // Fetch data in parallel
  const [session, events, announcements] = await Promise.all([
    getSession(),
    getPublicEvents(),
    getPublicAnnouncements(),
  ]);

  const isLoggedIn = !!session;
  const userRole = session?.user?.role ?? undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar isLoggedIn={isLoggedIn} userRole={userRole} />
      <main className="flex-1">
        <LandingHero isLoggedIn={isLoggedIn} />
        <LandingAbout />
        <LandingPrograms />
        <LandingEvents events={events} />
        <LandingAnnouncements announcements={announcements} />
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}

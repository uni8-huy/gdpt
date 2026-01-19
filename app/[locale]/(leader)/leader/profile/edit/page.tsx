import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/session";
import { getMyProfile } from "@/lib/actions/profile-actions";
import { ProfileEditForm } from "./profile-edit-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  return {
    title: `${common("edit")} ${t("profile")}`,
  };
}

export default async function ProfileEditPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole(["LEADER", "ADMIN"], locale);
  const profile = await getMyProfile(session.user.id);

  const t = await getTranslations("leader");
  const common = await getTranslations("common");

  if (!profile) {
    notFound();
  }

  const translations = {
    editProfile: `${common("edit")} ${t("name")}`,
    basicInfo: t("basicInfo"),
    name: t("name"),
    dharmaName: t("dharmaName"),
    yearOfBirth: t("yearOfBirth"),
    fullDateOfBirth: t("fullDateOfBirth"),
    placeOfOrigin: t("placeOfOrigin"),
    gdptInfo: t("gdptInfo"),
    gdptJoinDate: t("gdptJoinDate"),
    quyYDate: t("quyYDate"),
    quyYName: t("quyYName"),
    contactInfo: t("contactInfo"),
    phone: t("phone"),
    address: t("address"),
    educationWork: t("educationWork"),
    education: t("education"),
    occupation: t("occupation"),
    notes: t("notes"),
    unit: t("unit"),
    level: t("level"),
    common: {
      save: common("save"),
      saving: common("saving"),
      cancel: common("cancel"),
      back: common("back"),
      tryAgain: common("tryAgain"),
    },
  };

  // Format dates for form
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const initialData = {
    name: profile.name,
    dharmaName: profile.dharmaName || "",
    yearOfBirth: profile.yearOfBirth,
    fullDateOfBirth: formatDateForInput(profile.fullDateOfBirth),
    placeOfOrigin: profile.placeOfOrigin || "",
    gdptJoinDate: formatDateForInput(profile.gdptJoinDate),
    quyYDate: formatDateForInput(profile.quyYDate),
    quyYName: profile.quyYName || "",
    phone: profile.phone || "",
    address: profile.address || "",
    education: profile.education || "",
    occupation: profile.occupation || "",
    notes: profile.notes || "",
  };

  const readOnlyData = {
    unit: profile.unit.name,
    level: profile.level || "",
  };

  return (
    <ProfileEditForm
      userId={session.user.id}
      initialData={initialData}
      readOnlyData={readOnlyData}
      translations={translations}
    />
  );
}

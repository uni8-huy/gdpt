import { setRequestLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmissionsTable } from "./submissions-table";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submissions" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function AdminSubmissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const t = await getTranslations("submissions");
  const student = await getTranslations("student");
  const common = await getTranslations("common");

  const [submissions, units] = await Promise.all([
    db.studentSubmission.findMany({
      include: {
        parent: { select: { id: true, name: true, email: true } },
        reviewer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.unit.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("adminDescription")}</p>
      </div>

      <SubmissionsTable
        submissions={submissions}
        units={units}
        reviewerId={session.user.id}
        locale={locale}
        translations={{
          all: t("all"),
          pending: t("pending"),
          approved: t("approved"),
          rejected: t("rejected"),
          revised: t("revised"),
          noSubmissions: t("noSubmissions"),
          name: student("name"),
          dharmaName: student("dharmaName"),
          dateOfBirth: student("dateOfBirth"),
          gender: student("gender"),
          unit: student("unit"),
          class: student("class"),
          notes: student("notes"),
          submissionNotes: t("submissionNotes"),
          parentName: t("parentName"),
          parentEmail: t("parentEmail"),
          submittedOn: t("submittedOn"),
          reviewedOn: t("reviewedOn"),
          reviewedBy: t("reviewedBy"),
          reviewNotes: t("reviewNotes"),
          status: t("status"),
          approve: t("approve"),
          reject: t("reject"),
          rejectReason: t("rejectReason"),
          approving: t("approving"),
          rejecting: t("rejecting"),
          cancel: common("cancel"),
          male: common("male"),
          female: common("female"),
          noClass: student("noClass"),
          reviewSubmission: t("reviewSubmission"),
          parentInfo: t("parentInfo"),
          submittedData: t("submittedData"),
          actions: common("actions"),
          review: t("review"),
        }}
      />
    </div>
  );
}

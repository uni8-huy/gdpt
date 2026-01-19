import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RegisterChildForm } from "./register-child-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submissions" });
  return {
    title: `${t("registerChild")} - Parent`,
  };
}

export default async function RegisterChildPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const t = await getTranslations("submissions");
  const student = await getTranslations("student");
  const common = await getTranslations("common");

  const units = await db.unit.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("registerChild")}</h1>
        <p className="text-muted-foreground mt-2">
          Please fill in your child's information. The administration will review and approve your registration.
        </p>
      </div>

      <RegisterChildForm
        parentId={session.user.id}
        units={units}
        translations={{
          name: student("name"),
          dharmaName: student("dharmaName"),
          dateOfBirth: student("dateOfBirth"),
          gender: student("gender"),
          unit: student("unit"),
          class: student("class"),
          selectClass: student("selectClass"),
          noClass: student("noClass"),
          notes: student("notes"),
          selectUnit: student("selectUnit"),
          male: common("male"),
          female: common("female"),
          submissionNotes: t("submissionNotes"),
          submitRegistration: t("submitRegistration"),
          common: {
            save: common("save"),
            saving: common("saving"),
            cancel: common("cancel"),
            tryAgain: common("tryAgain"),
          },
        }}
      />
    </div>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMySubmissions } from "@/lib/actions/submission-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submissions" });
  return {
    title: `${t("mySubmissions")} - Parent`,
  };
}

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "default";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "destructive";
    case "REVISED":
      return "secondary";
    default:
      return "outline";
  }
}

export default async function SubmissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const t = await getTranslations("submissions");
  const common = await getTranslations("common");

  const submissions = await getMySubmissions(session.user.id);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("mySubmissions")}</h1>
          <p className="text-muted-foreground mt-2">{t("submissionsDescription")}</p>
        </div>
        <Button asChild>
          <Link href="/parent/children/register">{t("registerChild")}</Link>
        </Button>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const data = submission.submittedData as any;
            return (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{data.name}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(submission.status)}>
                      {t(submission.status.toLowerCase())}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("submittedOn")}</span>
                        <span>{formatDate(submission.createdAt, locale)}</span>
                      </div>
                      {submission.reviewedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("reviewedOn")}</span>
                          <span>{formatDate(submission.reviewedAt, locale)}</span>
                        </div>
                      )}
                      {data.dharmaName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("dharmaName")}</span>
                          <span>{data.dharmaName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("dateOfBirth")}</span>
                        <span>{formatDate(new Date(data.dateOfBirth), locale)}</span>
                      </div>
                    </div>

                    {submission.submissionNotes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm">
                          <span className="font-medium text-muted-foreground">{t("yourNotes")}:</span>{" "}
                          {submission.submissionNotes}
                        </p>
                      </div>
                    )}

                    {submission.reviewNotes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm">
                          <span className="font-medium text-muted-foreground">{t("reviewNotes")}:</span>{" "}
                          {submission.reviewNotes}
                        </p>
                      </div>
                    )}

                    {submission.status === "REJECTED" && (
                      <div className="pt-3">
                        <Button asChild size="sm">
                          <Link href={`/parent/children/submissions/${submission.id}/resubmit`}>
                            {t("editAndResubmit")}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t("noSubmissions")}</p>
            <Button asChild className="mt-4">
              <Link href="/parent/children/register">{t("registerChild")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

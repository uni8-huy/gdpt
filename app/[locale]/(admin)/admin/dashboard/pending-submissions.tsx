import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPendingSubmissions } from "@/lib/actions/submission-actions";

interface PendingSubmissionsProps {
  translations: {
    pendingRegistrations: string;
    noPending: string;
    viewAll: string;
    submittedOn: string;
  };
  locale: string;
}

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export async function PendingSubmissions({ translations: t, locale }: PendingSubmissionsProps) {
  const submissions = await getPendingSubmissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.pendingRegistrations}</span>
          <Badge variant="default">{submissions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t.noPending}</p>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 5).map((submission) => {
              const data = submission.submittedData as any;
              return (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.parent.name} • {formatDate(submission.createdAt, locale)}
                    </p>
                  </div>
                </div>
              );
            })}
            {submissions.length > 5 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/submissions">{t.viewAll}</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionReviewDialog } from "./submission-review-dialog";

interface Submission {
  id: string;
  status: string;
  submittedData: any;
  submissionNotes: string | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  parent: {
    id: string;
    name: string;
    email: string;
  };
  reviewer: {
    name: string;
  } | null;
}

interface SubmissionsTableProps {
  submissions: Submission[];
  units: Array<{ id: string; name: string }>;
  reviewerId: string;
  locale: string;
  translations: {
    all: string;
    pending: string;
    approved: string;
    rejected: string;
    revised: string;
    noSubmissions: string;
    name: string;
    dharmaName: string;
    dateOfBirth: string;
    gender: string;
    unit: string;
    class: string;
    notes: string;
    submissionNotes: string;
    parentName: string;
    parentEmail: string;
    submittedOn: string;
    reviewedOn: string;
    reviewedBy: string;
    reviewNotes: string;
    status: string;
    approve: string;
    reject: string;
    rejectReason: string;
    approving: string;
    rejecting: string;
    cancel: string;
    male: string;
    female: string;
    noClass: string;
    reviewSubmission: string;
    parentInfo: string;
    submittedData: string;
    actions: string;
    review: string;
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

export function SubmissionsTable({
  submissions,
  units,
  reviewerId,
  locale,
  translations: t,
}: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filterSubmissions = (status?: string) => {
    if (!status) return submissions;
    return submissions.filter((s) => s.status === status);
  };

  const handleReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const SubmissionCard = ({ submission }: { submission: Submission }) => {
    const data = submission.submittedData;
    const unit = units.find((u) => u.id === data.unitId);

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{data.name}</h3>
              <p className="text-sm text-muted-foreground">{submission.parent.name}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(submission.status)}>
              {t[submission.status.toLowerCase() as keyof typeof t] || submission.status}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.submittedOn}</span>
              <span>{formatDate(submission.createdAt, locale)}</span>
            </div>
            {submission.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.reviewedOn}</span>
                <span>{formatDate(submission.reviewedAt, locale)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.unit}</span>
              <span>{unit?.name || data.unitId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.dateOfBirth}</span>
              <span>{formatDate(new Date(data.dateOfBirth), locale)}</span>
            </div>
          </div>

          {(submission.status === "PENDING" || submission.status === "REVISED") && (
            <Button onClick={() => handleReview(submission)} className="w-full" size="sm">
              {t.review}
            </Button>
          )}

          {submission.reviewNotes && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">{t.reviewNotes}:</span> {submission.reviewNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            {t.all} ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="PENDING">
            {t.pending} ({filterSubmissions("PENDING").length})
          </TabsTrigger>
          <TabsTrigger value="REVISED">
            {t.revised} ({filterSubmissions("REVISED").length})
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            {t.approved} ({filterSubmissions("APPROVED").length})
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            {t.rejected} ({filterSubmissions("REJECTED").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">{t.noSubmissions}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </TabsContent>

        {["PENDING", "REVISED", "APPROVED", "REJECTED"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-6">
            {filterSubmissions(status).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">{t.noSubmissions}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterSubmissions(status).map((submission) => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {selectedSubmission && (
        <SubmissionReviewDialog
          submission={selectedSubmission}
          reviewerId={reviewerId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          translations={t}
          units={units}
          locale={locale}
        />
      )}
    </>
  );
}

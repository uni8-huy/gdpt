"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { approveSubmission, rejectSubmission } from "@/lib/actions/submission-actions";

interface SubmissionReviewDialogProps {
  submission: {
    id: string;
    status: string;
    submittedData: any;
    submissionNotes: string | null;
    parent: {
      name: string;
      email: string;
    };
    createdAt: Date;
  };
  reviewerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    reviewSubmission: string;
    parentInfo: string;
    submittedData: string;
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
  };
  units: Array<{ id: string; name: string }>;
  locale: string;
}

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function SubmissionReviewDialog({
  submission,
  reviewerId,
  open,
  onOpenChange,
  translations: t,
  units,
  locale,
}: SubmissionReviewDialogProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const data = submission.submittedData;
  const unit = units.find((u) => u.id === data.unitId);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      await approveSubmission(submission.id, reviewerId);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve submission");
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    setError(null);

    try {
      await rejectSubmission(submission.id, reviewerId, rejectNotes);
      onOpenChange(false);
      setShowRejectForm(false);
      setRejectNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject submission");
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.reviewSubmission}</DialogTitle>
          <DialogDescription>
            {t.submittedOn}: {formatDate(submission.createdAt, locale)}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Parent Info */}
          <div>
            <h3 className="font-semibold mb-3">{t.parentInfo}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.parentName}</span>
                <span>{submission.parent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.parentEmail}</span>
                <span>{submission.parent.email}</span>
              </div>
            </div>
          </div>

          {/* Submitted Data */}
          <div>
            <h3 className="font-semibold mb-3">{t.submittedData}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.name}</span>
                <span className="font-medium">{data.name}</span>
              </div>
              {data.dharmaName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.dharmaName}</span>
                  <span>{data.dharmaName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.dateOfBirth}</span>
                <span>{formatDate(new Date(data.dateOfBirth), locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.gender}</span>
                <span>{data.gender === "MALE" ? t.male : t.female}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.unit}</span>
                <span>{unit?.name || data.unitId}</span>
              </div>
              {data.classId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.class}</span>
                  <span>{data.classId}</span>
                </div>
              )}
              {data.notes && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">{t.notes}:</span>
                  <p className="mt-1">{data.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submission Notes */}
          {submission.submissionNotes && (
            <div>
              <h3 className="font-semibold mb-2">{t.submissionNotes}</h3>
              <p className="text-sm text-muted-foreground">{submission.submissionNotes}</p>
            </div>
          )}

          {/* Actions */}
          {!showRejectForm ? (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1"
              >
                {isApproving ? t.approving : t.approve}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                className="flex-1"
              >
                {t.reject}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="rejectNotes">{t.rejectReason}</Label>
                <Textarea
                  id="rejectNotes"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  disabled={isRejecting}
                  rows={4}
                  placeholder="Please provide a clear reason for rejection..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isRejecting || !rejectNotes.trim()}
                  className="flex-1"
                >
                  {isRejecting ? t.rejecting : t.reject}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectNotes("");
                    setError(null);
                  }}
                  disabled={isRejecting}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

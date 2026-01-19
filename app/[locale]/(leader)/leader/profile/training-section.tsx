"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addMyTrainingRecord, deleteMyTrainingRecord } from "@/lib/actions/profile-actions";

type TrainingRecord = {
  id: string;
  campName: string;
  year: number;
  region: string | null;
  level: string;
  notes: string | null;
};

interface TrainingSectionProps {
  userId: string;
  records: TrainingRecord[];
  translations: {
    training: string;
    campName: string;
    year: string;
    region: string;
    level: string;
    add: string;
    delete: string;
    noData: string;
    notes: string;
  };
}

export function TrainingSection({ userId, records, translations: t }: TrainingSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    campName: "",
    year: new Date().getFullYear(),
    region: "",
    level: "",
    notes: "",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFormData({
        campName: "",
        year: new Date().getFullYear(),
        region: "",
        level: "",
        notes: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addMyTrainingRecord(userId, {
        campName: formData.campName,
        year: formData.year,
        region: formData.region || undefined,
        level: formData.level,
        notes: formData.notes || undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add training record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);

    try {
      await deleteMyTrainingRecord(userId, deleteId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete training record:", error);
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.training}</CardTitle>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.add} {t.training}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campName">{t.campName} *</Label>
                  <Input
                    id="campName"
                    value={formData.campName}
                    onChange={(e) => setFormData({ ...formData, campName: e.target.value })}
                    placeholder="Trại A Dục, Lộc Uyển, ..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">{t.level} *</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="Bậc Tín, Bậc Tập, ..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">{t.year} *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min={1900}
                      max={new Date().getFullYear()}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">{t.region}</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="BHD TW, BHD Miền, ..."
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t.notes}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !formData.campName || !formData.level}>
                    {t.add}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-3 space-y-1 group relative"
                >
                  <div className="font-medium">{record.campName}</div>
                  <div className="text-sm">
                    {t.level}: <Badge variant="outline">{record.level}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t.year} {record.year}
                    {record.region && ` - ${record.region}`}
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground">
                      {record.notes}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setDeleteId(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t.noData}</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.delete}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

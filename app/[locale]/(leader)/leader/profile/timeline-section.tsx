"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMyTimelineEntry, deleteMyTimelineEntry } from "@/lib/actions/profile-actions";
import { getUnitsWithHierarchy } from "@/lib/actions/unit-actions";

type TimelineEntry = {
  id: string;
  role: string;
  startYear: number;
  endYear: number | null;
  notes: string | null;
  unit: { id: string; name: string };
};

interface TimelineSectionProps {
  userId: string;
  entries: TimelineEntry[];
  translations: {
    timeline: string;
    role: string;
    unit: string;
    startYear: string;
    endYear: string;
    current: string;
    add: string;
    delete: string;
    noData: string;
    notes: string;
    selectUnit: string;
  };
}

export function TimelineSection({ userId, entries, translations: t }: TimelineSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    role: "",
    unitId: "",
    startYear: new Date().getFullYear(),
    endYear: "",
    notes: "",
  });

  const loadUnits = async () => {
    const data = await getUnitsWithHierarchy();
    setUnits(data.map((u) => ({ id: u.id, name: u.name })));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && units.length === 0) {
      loadUnits();
    }
    if (!newOpen) {
      setFormData({
        role: "",
        unitId: "",
        startYear: new Date().getFullYear(),
        endYear: "",
        notes: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addMyTimelineEntry(userId, {
        role: formData.role,
        unitId: formData.unitId,
        startYear: formData.startYear,
        endYear: formData.endYear ? parseInt(formData.endYear) : null,
        notes: formData.notes || undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add timeline entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);

    try {
      await deleteMyTimelineEntry(userId, deleteId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete timeline entry:", error);
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.timeline}</CardTitle>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.add} {t.timeline}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">{t.role} *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Đội trưởng, Huynh trưởng, ..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">{t.unit} *</Label>
                  <Select
                    value={formData.unitId}
                    onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectUnit} />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startYear">{t.startYear} *</Label>
                    <Input
                      id="startYear"
                      type="number"
                      value={formData.startYear}
                      onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endYear">{t.endYear}</Label>
                    <Input
                      id="endYear"
                      type="number"
                      value={formData.endYear}
                      onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      placeholder={t.current}
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
                  <Button type="submit" disabled={isLoading || !formData.role || !formData.unitId}>
                    {t.add}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 border-l-2 border-primary pl-4 pb-4 group"
                >
                  <div className="flex-1">
                    <div className="font-medium">{entry.role}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.unit.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {entry.startYear} - {entry.endYear || t.current}
                    </div>
                    {entry.notes && (
                      <p className="text-sm mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(entry.id)}
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

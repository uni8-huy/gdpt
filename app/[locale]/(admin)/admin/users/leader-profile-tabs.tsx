"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Plus, Trash2 } from "lucide-react";
import {
  updateLeaderProfile,
  type LeaderProfileData,
} from "@/lib/actions/user-actions";
import {
  addTimelineEntry,
  deleteTimelineEntry,
  addTrainingRecord,
  deleteTrainingRecord,
} from "@/lib/actions/leader-actions";

const leaderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dharmaName: z.string().optional(),
  yearOfBirth: z.number().min(1900).max(new Date().getFullYear()),
  unitId: z.string().min(1, "Please select a unit"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  fullDateOfBirth: z.string().optional(),
  placeOfOrigin: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gdptJoinDate: z.string().optional(),
  quyYDate: z.string().optional(),
  quyYName: z.string().optional(),
  level: z.string().optional(),
  notes: z.string().optional(),
});

const LEVELS = ["Tập", "Tín", "Tấn", "Dũng", "Kiên", "Trì", "Định", "Lực"];

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

type Unit = { id: string; name: string };
type LeaderProfile = {
  id: string;
  userId: string;
  name: string;
  dharmaName: string | null;
  yearOfBirth: number;
  unitId: string;
  status: "ACTIVE" | "INACTIVE";
  fullDateOfBirth: Date | null;
  placeOfOrigin: string | null;
  education: string | null;
  occupation: string | null;
  phone: string | null;
  address: string | null;
  gdptJoinDate: Date | null;
  quyYDate: Date | null;
  quyYName: string | null;
  level: string | null;
  notes: string | null;
  unit: { id: string; name: string };
  timeline: Array<{
    id: string;
    role: string;
    unit: { id: string; name: string };
    startYear: number;
    endYear: number | null;
    notes: string | null;
  }>;
  trainingRecords: Array<{
    id: string;
    campName: string;
    year: number;
    region: string | null;
    level: string;
    notes: string | null;
  }>;
};

interface LeaderProfileTabsProps {
  leaderProfile: LeaderProfile;
  units: Unit[];
  translations: {
    summary: string;
    personal: string;
    gdpt: string;
    contact: string;
    timeline: string;
    training: string;
    name: string;
    dharmaName: string;
    yearOfBirth: string;
    fullDateOfBirth: string;
    unit: string;
    level: string;
    status: string;
    placeOfOrigin: string;
    education: string;
    occupation: string;
    phone: string;
    address: string;
    gdptJoinDate: string;
    quyYDate: string;
    quyYName: string;
    notes: string;
    save: string;
    saving: string;
    cancel: string;
    active: string;
    inactive: string;
    selectUnit: string;
    selectLevel: string;
    addTimeline: string;
    addTraining: string;
    role: string;
    startYear: string;
    endYear: string;
    current: string;
    campName: string;
    year: string;
    region: string;
    delete: string;
    noTimeline: string;
    noTraining: string;
  };
  onShowTimelineDialog?: () => void;
  onShowTrainingDialog?: () => void;
}

export function LeaderProfileTabs({
  leaderProfile,
  units,
  translations: t,
  onShowTimelineDialog,
  onShowTrainingDialog,
}: LeaderProfileTabsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaderProfileData>({
    resolver: zodResolver(leaderSchema),
    defaultValues: {
      name: leaderProfile.name,
      dharmaName: leaderProfile.dharmaName || "",
      yearOfBirth: leaderProfile.yearOfBirth,
      unitId: leaderProfile.unitId,
      status: leaderProfile.status,
      fullDateOfBirth: formatDateForInput(leaderProfile.fullDateOfBirth),
      placeOfOrigin: leaderProfile.placeOfOrigin || "",
      education: leaderProfile.education || "",
      occupation: leaderProfile.occupation || "",
      phone: leaderProfile.phone || "",
      address: leaderProfile.address || "",
      gdptJoinDate: formatDateForInput(leaderProfile.gdptJoinDate),
      quyYDate: formatDateForInput(leaderProfile.quyYDate),
      quyYName: leaderProfile.quyYName || "",
      level: leaderProfile.level || "",
      notes: leaderProfile.notes || "",
    },
  });

  const onSubmit = async (data: LeaderProfileData) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateLeaderProfile(leaderProfile.id, data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    if (!confirm("Are you sure you want to delete this timeline entry?")) return;

    setIsLoading(true);
    try {
      await deleteTimelineEntry(timelineId, leaderProfile.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm("Are you sure you want to delete this training record?")) return;

    setIsLoading(true);
    try {
      await deleteTrainingRecord(trainingId, leaderProfile.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">{t.summary}</TabsTrigger>
          <TabsTrigger value="personal">{t.personal}</TabsTrigger>
          <TabsTrigger value="gdpt">{t.gdpt}</TabsTrigger>
          <TabsTrigger value="contact">{t.contact}</TabsTrigger>
          <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
          <TabsTrigger value="training">{t.training}</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name} *</Label>
              <Input id="name" {...register("name")} disabled={isLoading} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dharmaName">{t.dharmaName}</Label>
              <Input id="dharmaName" {...register("dharmaName")} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label>{t.unit} *</Label>
              <Select
                value={watch("unitId")}
                onValueChange={(value) => setValue("unitId", value)}
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
              {errors.unitId && (
                <p className="text-sm text-destructive">{errors.unitId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.level}</Label>
              <Select
                value={watch("level") || "none"}
                onValueChange={(value) => setValue("level", value === "none" ? "" : value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectLevel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.status}</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as "ACTIVE" | "INACTIVE")}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t.active}</SelectItem>
                  <SelectItem value="INACTIVE">{t.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yearOfBirth">{t.yearOfBirth} *</Label>
              <Input
                id="yearOfBirth"
                type="number"
                {...register("yearOfBirth", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.yearOfBirth && (
                <p className="text-sm text-destructive">{errors.yearOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDateOfBirth">{t.fullDateOfBirth}</Label>
              <Input
                id="fullDateOfBirth"
                type="date"
                {...register("fullDateOfBirth")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeOfOrigin">{t.placeOfOrigin}</Label>
              <Input id="placeOfOrigin" {...register("placeOfOrigin")} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">{t.education}</Label>
              <Input id="education" {...register("education")} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">{t.occupation}</Label>
              <Input id="occupation" {...register("occupation")} disabled={isLoading} />
            </div>
          </div>
        </TabsContent>

        {/* GDPT Tab */}
        <TabsContent value="gdpt" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gdptJoinDate">{t.gdptJoinDate}</Label>
              <Input
                id="gdptJoinDate"
                type="date"
                {...register("gdptJoinDate")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quyYDate">{t.quyYDate}</Label>
              <Input
                id="quyYDate"
                type="date"
                {...register("quyYDate")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="quyYName">{t.quyYName}</Label>
              <Input id="quyYName" {...register("quyYName")} disabled={isLoading} />
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input id="phone" {...register("phone")} disabled={isLoading} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{t.address}</Label>
              <Input id="address" {...register("address")} disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">{t.timeline}</h3>
            <Button
              type="button"
              size="sm"
              onClick={onShowTimelineDialog}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addTimeline}
            </Button>
          </div>

          {leaderProfile.timeline.length > 0 ? (
            <div className="space-y-3">
              {leaderProfile.timeline.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
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
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTimeline(entry.id)}
                        disabled={isLoading}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noTimeline}</p>
          )}
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">{t.training}</h3>
            <Button
              type="button"
              size="sm"
              onClick={onShowTrainingDialog}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addTraining}
            </Button>
          </div>

          {leaderProfile.trainingRecords.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {leaderProfile.trainingRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{record.campName}</div>
                        <div className="text-sm">
                          {t.level}: <span className="font-medium">{record.level}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.year} {record.year}
                          {record.region && ` - ${record.region}`}
                        </div>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTraining(record.id)}
                        disabled={isLoading}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noTraining}</p>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}

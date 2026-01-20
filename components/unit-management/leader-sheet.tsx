"use client";

import { useState, useEffect } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  createLeader,
  updateLeader,
  type LeaderFormData,
} from "@/lib/actions/leader-actions";

const leaderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dharmaName: z.string().optional(),
  yearOfBirth: z.number().min(1900).max(new Date().getFullYear()),
  unitId: z.string().min(1, "Unit is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
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

type Unit = { id: string; name: string };
type AvailableUser = { id: string; name: string | null; email: string };

interface Leader {
  id: string;
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
}

interface LeaderSheetProps {
  unitId: string;
  leader: Leader | null;
  allUnits: Unit[];
  availableUsers: AvailableUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    addTitle: string;
    editTitle: string;
    selectUser: string;
    noAvailableUsers: string;
    basicInfo: string;
    name: string;
    dharmaName: string;
    yearOfBirth: string;
    fullDateOfBirth: string;
    unit: string;
    level: string;
    status: string;
    contact: string;
    phone: string;
    address: string;
    gdptInfo: string;
    gdptJoinDate: string;
    quyYDate: string;
    quyYName: string;
    other: string;
    placeOfOrigin: string;
    education: string;
    occupation: string;
    notes: string;
    active: string;
    inactive: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
}

export function LeaderSheet({
  unitId,
  leader,
  allUnits,
  availableUsers,
  open,
  onOpenChange,
  translations: t,
}: LeaderSheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaderFormData>({
    resolver: zodResolver(leaderSchema),
    defaultValues: {
      name: "",
      dharmaName: "",
      yearOfBirth: new Date().getFullYear() - 25,
      unitId: unitId,
      status: "ACTIVE",
      fullDateOfBirth: "",
      placeOfOrigin: "",
      education: "",
      occupation: "",
      phone: "",
      address: "",
      gdptJoinDate: "",
      quyYDate: "",
      quyYName: "",
      level: "",
      notes: "",
    },
  });

  // Reset form when leader changes or sheet opens
  useEffect(() => {
    if (open) {
      if (leader) {
        reset({
          name: leader.name,
          dharmaName: leader.dharmaName || "",
          yearOfBirth: leader.yearOfBirth,
          unitId: leader.unitId,
          status: leader.status,
          fullDateOfBirth: formatDateForInput(leader.fullDateOfBirth),
          placeOfOrigin: leader.placeOfOrigin || "",
          education: leader.education || "",
          occupation: leader.occupation || "",
          phone: leader.phone || "",
          address: leader.address || "",
          gdptJoinDate: formatDateForInput(leader.gdptJoinDate),
          quyYDate: formatDateForInput(leader.quyYDate),
          quyYName: leader.quyYName || "",
          level: leader.level || "",
          notes: leader.notes || "",
        });
        setSelectedUserId(null);
      } else {
        reset({
          name: "",
          dharmaName: "",
          yearOfBirth: new Date().getFullYear() - 25,
          unitId: unitId,
          status: "ACTIVE",
          fullDateOfBirth: "",
          placeOfOrigin: "",
          education: "",
          occupation: "",
          phone: "",
          address: "",
          gdptJoinDate: "",
          quyYDate: "",
          quyYName: "",
          level: "",
          notes: "",
        });
        setSelectedUserId(null);
      }
      setError(null);
    }
  }, [open, leader, unitId, reset]);

  // Auto-fill name from selected user
  useEffect(() => {
    if (selectedUserId && !leader) {
      const selectedUser = availableUsers.find((u) => u.id === selectedUserId);
      if (selectedUser?.name) {
        setValue("name", selectedUser.name);
      }
    }
  }, [selectedUserId, availableUsers, leader, setValue]);

  const onSubmit = async (data: LeaderFormData) => {
    if (!leader && !selectedUserId) {
      setError(t.selectUser);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (leader) {
        await updateLeader(leader.id, data);
      } else {
        await createLeader(selectedUserId!, data);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const isNewLeader = !leader;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{leader ? t.editTitle : t.addTitle}</SheetTitle>
          <SheetDescription>
            {leader ? `${t.editTitle}: ${leader.name}` : t.addTitle}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* User Selection (new leader only) */}
          {isNewLeader && (
            <div className="space-y-2">
              <Label>{t.selectUser} *</Label>
              {availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.noAvailableUsers}</p>
              ) : (
                <Select
                  value={selectedUserId || ""}
                  onValueChange={setSelectedUserId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectUser} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Separator />

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium">{t.basicInfo}</h4>
            <div className="grid gap-4 grid-cols-2">
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
            </div>
            <div className="grid gap-4 grid-cols-2">
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
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>{t.unit} *</Label>
                <Select
                  value={watch("unitId")}
                  onValueChange={(value) => setValue("unitId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">{t.level}</Label>
                <Input id="level" {...register("level")} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.status} *</Label>
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

          <Separator />

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-medium">{t.contact}</h4>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input id="phone" {...register("phone")} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Input id="address" {...register("address")} disabled={isLoading} />
              </div>
            </div>
          </div>

          <Separator />

          {/* GDPT Info */}
          <div className="space-y-4">
            <h4 className="font-medium">{t.gdptInfo}</h4>
            <div className="grid gap-4 grid-cols-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="quyYName">{t.quyYName}</Label>
              <Input id="quyYName" {...register("quyYName")} disabled={isLoading} />
            </div>
          </div>

          <Separator />

          {/* Other */}
          <div className="space-y-4">
            <h4 className="font-medium">{t.other}</h4>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placeOfOrigin">{t.placeOfOrigin}</Label>
                <Input id="placeOfOrigin" {...register("placeOfOrigin")} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">{t.education}</Label>
                <Input id="education" {...register("education")} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">{t.occupation}</Label>
              <Input id="occupation" {...register("occupation")} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea id="notes" {...register("notes")} disabled={isLoading} rows={3} />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || (isNewLeader && availableUsers.length === 0)}
              className="flex-1"
            >
              {isLoading ? t.common.saving : t.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

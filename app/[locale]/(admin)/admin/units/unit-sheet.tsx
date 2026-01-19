"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createUnit,
  updateUnit,
  type UnitFormData,
} from "@/lib/actions/unit-actions";

const unitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

type Unit = { id: string; name: string };

interface UnitSheetProps {
  unit?: {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
  };
  allUnits: Unit[];
  translations: {
    addNew: string;
    edit: string;
    name: string;
    description: string;
    parentUnit: string;
    selectParent: string;
    noParent: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
  trigger?: "button" | "icon";
}

export function UnitSheet({ unit, allUnits, translations: t, trigger = "button" }: UnitSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out current unit and its children from parent options
  const parentOptions = allUnits.filter((u) => u.id !== unit?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: unit?.name || "",
      description: unit?.description || "",
      parentId: unit?.parentId || null,
    },
  });

  const onSubmit = async (data: UnitFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (unit) {
        await updateUnit(unit.id, data);
      } else {
        await createUnit(data);
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset({
        name: unit?.name || "",
        description: unit?.description || "",
        parentId: unit?.parentId || null,
      });
      setError(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger === "icon" ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            {t.edit}
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t.addNew}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{unit ? t.edit : t.addNew}</SheetTitle>
          <SheetDescription>
            {unit ? `${t.edit}: ${unit.name}` : t.addNew}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t.name} *</Label>
            <Input id="name" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Input
              id="description"
              {...register("description")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.parentUnit}</Label>
            <Select
              value={watch("parentId") || "none"}
              onValueChange={(value) =>
                setValue("parentId", value === "none" ? null : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectParent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.noParent}</SelectItem>
                {parentOptions.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? t.common.saving : t.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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

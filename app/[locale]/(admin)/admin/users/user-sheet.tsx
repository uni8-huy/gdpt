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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUser, updateUser } from "@/lib/actions/user-actions";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserSheetProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  translations: {
    addNew: string;
    edit: string;
    name: string;
    email: string;
    createSuccess: string;
    updateSuccess: string;
    temporaryPassword: string;
    copyPassword: string;
    passwordCopied: string;
    passwordNote: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      tryAgain: string;
    };
  };
  trigger?: "button" | "icon";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserSheet({
  user,
  translations: t,
  trigger = "button",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UserSheetProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Update existing user
        await updateUser(user.id, data);
        setOpen(false);
        reset();
        router.refresh();
      } else {
        // Create new user
        const result = await createUser(data);
        if (result.tempPassword) {
          setTempPassword(result.tempPassword);
          setShowPasswordDialog(true);
          // Don't close sheet yet - wait for password dialog to close
          setOpen(false);
          reset();
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset({
        name: user?.name || "",
        email: user?.email || "",
      });
      setError(null);
    }
  };

  const copyToClipboard = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        {!isControlled && (
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
        )}
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{user ? t.edit : t.addNew}</SheetTitle>
            <SheetDescription>
              {user ? `${t.edit}: ${user.name}` : t.addNew}
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
              <Label htmlFor="email">{t.email} *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={isLoading || !!user}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              {user && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed after creation
                </p>
              )}
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

      {/* Password Display Dialog (shown after creating new user) */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createSuccess}</DialogTitle>
            <DialogDescription>{t.passwordNote}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">{t.temporaryPassword}</p>
              <div className="flex gap-2">
                <Input value={tempPassword || ""} readOnly className="font-mono" />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? t.passwordCopied : t.copyPassword}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

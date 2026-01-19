"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUnit } from "@/lib/actions/unit-actions";

interface DeleteUnitButtonProps {
  unitId: string;
  unitName: string;
  translations: {
    delete: string;
    deleting: string;
    cancel: string;
    deleteConfirm: string;
    deleteWarning: string;
    deleteErrorHasChildren: string;
    deleteErrorHasMembers: string;
  };
}

export function DeleteUnitButton({
  unitId,
  unitName,
  translations: t,
}: DeleteUnitButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUnit(unitId);
      router.push("/admin/units");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("đơn vị con") || message.includes("child")) {
        setError(t.deleteErrorHasChildren);
      } else if (message.includes("đoàn sinh") || message.includes("huynh trưởng") || message.includes("students") || message.includes("leaders")) {
        setError(t.deleteErrorHasMembers);
      } else {
        setError(message);
      }
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          {t.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteWarning.replace("{name}", unitName)}
            {error && (
              <span className="block mt-2 text-destructive font-medium">
                {error}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t.deleting : t.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

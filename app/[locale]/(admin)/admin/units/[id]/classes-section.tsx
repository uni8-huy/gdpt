"use client";

import { useState } from "react";
import { Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassSheet } from "./class-sheet";

interface ClassesSectionProps {
  unitId: string;
  classes: Array<{ id: string; name: string; _count: { students: number } }>;
  translations: {
    classes: string;
    addClass: string;
    noClasses: string;
    classSheet: {
      createTitle: string;
      editTitle: string;
      name: string;
      studentCount: string;
      deleteConfirm: string;
      deleteWarning: string;
      save: string;
      cancel: string;
      delete: string;
      saving: string;
      deleting: string;
      tryAgain: string;
    };
  };
}

export function ClassesSection({
  unitId,
  classes,
  translations: t,
}: ClassesSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<typeof classes[0] | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t.classes}</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setSelectedClass(null);
            setSheetOpen(true);
          }}
        >
          {t.addClass}
        </Button>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <p className="text-muted-foreground">{t.noClasses}</p>
        ) : (
          <div className="space-y-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors"
              >
                <div>
                  <span className="font-medium">{cls.name}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    <Users className="inline h-3 w-3 mr-1" />
                    {cls._count.students}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedClass(cls);
                      setSheetOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ClassSheet
        unitId={unitId}
        cls={selectedClass}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        translations={t.classSheet}
      />
    </Card>
  );
}

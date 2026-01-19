"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NoProfileProps {
  translations: {
    noProfile: string;
  };
}

export function NoProfile({ translations: t }: NoProfileProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">{t.noProfile}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

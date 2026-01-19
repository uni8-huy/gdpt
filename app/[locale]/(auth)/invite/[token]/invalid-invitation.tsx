"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvalidInvitationProps {
  translations: {
    title: string;
    description: string;
    reasons: string;
    expired: string;
    cancelled: string;
    used: string;
    incorrect: string;
    contactAdmin: string;
    login: string;
  };
}

export function InvalidInvitation({ translations: t }: InvalidInvitationProps) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium">{t.reasons}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t.expired}</li>
            <li>{t.cancelled}</li>
            <li>{t.used}</li>
            <li>{t.incorrect}</li>
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{t.contactAdmin}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/login">{t.login}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

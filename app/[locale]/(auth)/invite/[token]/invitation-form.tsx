"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Role } from "@prisma/client";
import { acceptInvitation } from "@/lib/actions/invitation-actions";

interface InvitationFormProps {
  token: string;
  invitation: {
    email: string;
    name: string | null;
    role: Role;
    unitName?: string;
  };
  translations: {
    welcome: string;
    email: string;
    role: string;
    unit: string;
    yourName: string;
    password: string;
    confirmPassword: string;
    passwordHint: string;
    createAccount: string;
    alreadyHaveAccount: string;
    acceptSuccess: string;
    redirecting: string;
    common: {
      login: string;
      tryAgain: string;
    };
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
  };
}

export function InvitationForm({ token, invitation, translations: t }: InvitationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: invitation.name || "",
    password: "",
    confirmPassword: "",
  });

  const getRoleLabel = (role: Role) => {
    return t.roles[role.toLowerCase() as keyof typeof t.roles];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await acceptInvitation(token, {
        name: formData.name,
        password: formData.password,
      });
      setIsSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>{t.acceptSuccess}</CardTitle>
          <CardDescription>{t.redirecting}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t.welcome}</CardTitle>
        <CardDescription>
          <div className="mt-2 space-y-1">
            <p>
              <span className="font-medium">{t.email}:</span> {invitation.email}
            </p>
            <p>
              <span className="font-medium">{t.role}:</span>{" "}
              <Badge variant="outline">{getRoleLabel(invitation.role)}</Badge>
            </p>
            {invitation.unitName && (
              <p>
                <span className="font-medium">{t.unit}:</span> {invitation.unitName}
              </p>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t.yourName} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password} *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{t.passwordHint}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword} *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "..." : t.createAccount}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t.alreadyHaveAccount}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t.common.login}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

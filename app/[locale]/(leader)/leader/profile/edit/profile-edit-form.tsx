"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { updateMyProfile } from "@/lib/actions/profile-actions";

interface ProfileEditFormProps {
  userId: string;
  initialData: {
    name: string;
    dharmaName: string;
    yearOfBirth: number;
    fullDateOfBirth: string;
    placeOfOrigin: string;
    gdptJoinDate: string;
    quyYDate: string;
    quyYName: string;
    phone: string;
    address: string;
    education: string;
    occupation: string;
    notes: string;
  };
  readOnlyData: {
    unit: string;
    level: string;
  };
  translations: {
    editProfile: string;
    basicInfo: string;
    name: string;
    dharmaName: string;
    yearOfBirth: string;
    fullDateOfBirth: string;
    placeOfOrigin: string;
    gdptInfo: string;
    gdptJoinDate: string;
    quyYDate: string;
    quyYName: string;
    contactInfo: string;
    phone: string;
    address: string;
    educationWork: string;
    education: string;
    occupation: string;
    notes: string;
    unit: string;
    level: string;
    common: {
      save: string;
      saving: string;
      cancel: string;
      back: string;
      tryAgain: string;
    };
  };
}

export function ProfileEditForm({
  userId,
  initialData,
  readOnlyData,
  translations: t,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateMyProfile(userId, {
        name: formData.name,
        dharmaName: formData.dharmaName || undefined,
        yearOfBirth: formData.yearOfBirth,
        fullDateOfBirth: formData.fullDateOfBirth || undefined,
        placeOfOrigin: formData.placeOfOrigin || undefined,
        gdptJoinDate: formData.gdptJoinDate || undefined,
        quyYDate: formData.quyYDate || undefined,
        quyYName: formData.quyYName || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        education: formData.education || undefined,
        occupation: formData.occupation || undefined,
        notes: formData.notes || undefined,
      });
      router.push("/leader/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.tryAgain);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leader/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t.editProfile}</h1>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t.basicInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dharmaName">{t.dharmaName}</Label>
                <Input
                  id="dharmaName"
                  value={formData.dharmaName}
                  onChange={(e) => setFormData({ ...formData, dharmaName: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearOfBirth">{t.yearOfBirth} *</Label>
                <Input
                  id="yearOfBirth"
                  type="number"
                  value={formData.yearOfBirth}
                  onChange={(e) => setFormData({ ...formData, yearOfBirth: parseInt(e.target.value) })}
                  min={1900}
                  max={new Date().getFullYear()}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullDateOfBirth">{t.fullDateOfBirth}</Label>
                <Input
                  id="fullDateOfBirth"
                  type="date"
                  value={formData.fullDateOfBirth}
                  onChange={(e) => setFormData({ ...formData, fullDateOfBirth: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placeOfOrigin">{t.placeOfOrigin}</Label>
                <Input
                  id="placeOfOrigin"
                  value={formData.placeOfOrigin}
                  onChange={(e) => setFormData({ ...formData, placeOfOrigin: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.unit}</Label>
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                  <span className="text-muted-foreground">{readOnlyData.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground">Managed by admin</p>
              </div>
            </div>

            {readOnlyData.level && (
              <div className="space-y-2">
                <Label>{t.level}</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{readOnlyData.level}</Badge>
                  <span className="text-xs text-muted-foreground">Managed by admin</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GDPT Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t.gdptInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gdptJoinDate">{t.gdptJoinDate}</Label>
                <Input
                  id="gdptJoinDate"
                  type="date"
                  value={formData.gdptJoinDate}
                  onChange={(e) => setFormData({ ...formData, gdptJoinDate: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quyYDate">{t.quyYDate}</Label>
                <Input
                  id="quyYDate"
                  type="date"
                  value={formData.quyYDate}
                  onChange={(e) => setFormData({ ...formData, quyYDate: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quyYName">{t.quyYName}</Label>
              <Input
                id="quyYName"
                value={formData.quyYName}
                onChange={(e) => setFormData({ ...formData, quyYName: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t.contactInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t.address}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Education & Work */}
        <Card>
          <CardHeader>
            <CardTitle>{t.educationWork}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="education">{t.education}</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">{t.occupation}</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t.notes}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/leader/profile">{t.common.cancel}</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </div>
  );
}

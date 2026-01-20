"use client";

import { useState, useMemo } from "react";
import { Building2, Users, UserCheck, BookOpen, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { UnitSheet } from "./unit-sheet";

type Unit = {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
  _count: { students: number; leaders: number; classes: number };
};

type UnitBasic = {
  id: string;
  name: string;
};

interface UnitsClientWrapperProps {
  units: Unit[];
  allUnits: UnitBasic[];
  translations: {
    title: string;
    searchPlaceholder: string;
    filterAll: string;
    filterRoot: string;
    parentUnit: string;
    students: string;
    leaders: string;
    classes: string;
    noUnits: string;
    totalUnits: string;
    totalStudents: string;
    totalLeaders: string;
    viewDetails: string;
    sheetTranslations: {
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
  };
}

export function UnitsClientWrapper({ units, allUnits, translations: t }: UnitsClientWrapperProps) {
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("all");

  // Calculate stats
  const stats = useMemo(() => ({
    totalUnits: units.length,
    totalStudents: units.reduce((sum, u) => sum + u._count.students, 0),
    totalLeaders: units.reduce((sum, u) => sum + u._count.leaders, 0),
    totalClasses: units.reduce((sum, u) => sum + u._count.classes, 0),
  }), [units]);

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch = unit.name.toLowerCase().includes(search.toLowerCase()) ||
        unit.description?.toLowerCase().includes(search.toLowerCase());

      const matchesParent = parentFilter === "all" ||
        (parentFilter === "root" && !unit.parentId) ||
        unit.parentId === parentFilter;

      return matchesSearch && matchesParent;
    });
  }, [units, search, parentFilter]);

  // Get parent units for filter dropdown
  const parentUnits = useMemo(() => {
    return units.filter((u) => u.children.length > 0);
  }, [units]);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalUnits}</p>
                <p className="text-2xl font-bold">{stats.totalUnits}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalStudents}</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalLeaders}</p>
                <p className="text-2xl font-bold">{stats.totalLeaders}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.classes}</p>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          <Select value={parentFilter} onValueChange={setParentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterAll}</SelectItem>
              <SelectItem value="root">{t.filterRoot}</SelectItem>
              {parentUnits.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <UnitSheet allUnits={allUnits} translations={t.sheetTranslations} />
      </div>

      {/* Units Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    <Link
                      href={`/admin/units/${unit.id}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {unit.name}
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </CardTitle>
                  {unit.parent && (
                    <p className="text-sm text-muted-foreground truncate">
                      {t.parentUnit}: {unit.parent.name}
                    </p>
                  )}
                </div>
                <UnitSheet
                  unit={{ id: unit.id, name: unit.name, description: unit.description, parentId: unit.parentId }}
                  allUnits={allUnits}
                  translations={t.sheetTranslations}
                  trigger="icon"
                />
              </div>
            </CardHeader>
            <CardContent>
              {unit.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {unit.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{unit._count.students} {t.students}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>{unit._count.leaders} {t.leaders}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  <span>{unit._count.classes} {t.classes}</span>
                </div>
              </div>
              {unit.children.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {unit.children.slice(0, 3).map((child) => (
                    <Badge key={child.id} variant="outline" className="text-xs">
                      {child.name}
                    </Badge>
                  ))}
                  {unit.children.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{unit.children.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredUnits.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              {search || parentFilter !== "all" ? (
                <p>No units match your search</p>
              ) : (
                <p>{t.noUnits}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

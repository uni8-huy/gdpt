import { getTranslations, setRequestLocale } from "next-intl/server";
import { Building2, Users, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { getUnitsWithHierarchy } from "@/lib/actions/unit-actions";
import { db } from "@/lib/db";
import { UnitSheet } from "./unit-sheet";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "unit" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function UnitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [units, allUnits, t, common] = await Promise.all([
    getUnitsWithHierarchy(),
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getTranslations("unit"),
    getTranslations("common"),
  ]);

  const sheetTranslations = {
    addNew: t("addNew"),
    edit: common("edit"),
    name: t("name"),
    description: t("description"),
    parentUnit: t("parentUnit"),
    selectParent: t("selectParent"),
    noParent: t("noParent"),
    common: {
      save: common("save"),
      saving: common("saving"),
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <UnitSheet allUnits={allUnits} translations={sheetTranslations} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <Card key={unit.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  <Link
                    href={`/admin/units/${unit.id}`}
                    className="hover:underline"
                  >
                    {unit.name}
                  </Link>
                </CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              {unit.parent && (
                <p className="text-sm text-muted-foreground">
                  {t("parentUnit")}: {unit.parent.name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {unit.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {unit.description}
                </p>
              )}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{unit._count.students} {t("students")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>{unit._count.leaders} {t("leaders")}</span>
                </div>
              </div>
              {unit.children.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {unit.children.map((child) => (
                    <Badge key={child.id} variant="outline">
                      {child.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {units.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("noUnits")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

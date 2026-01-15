import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus, Building2, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { getUnitsWithHierarchy } from "@/lib/actions/unit-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: "Đơn vị - Admin",
  };
}

export default async function UnitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const units = await getUnitsWithHierarchy();

  // Build tree structure
  const rootUnits = units.filter((u) => !u.parentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý đơn vị</h1>
        <Button asChild>
          <Link href="/admin/units/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm đơn vị
          </Link>
        </Button>
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
                  Thuộc: {unit.parent.name}
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
                  <span>{unit._count.students} đoàn sinh</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>{unit._count.leaders} huynh trưởng</span>
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
              Chưa có đơn vị nào. Hãy thêm đơn vị đầu tiên.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

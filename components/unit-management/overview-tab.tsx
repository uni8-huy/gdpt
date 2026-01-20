import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Users, UserCheck, GraduationCap } from "lucide-react";

interface OverviewTabProps {
  unit: {
    id: string;
    name: string;
    description: string | null;
    parent?: { id: string; name: string } | null;
    children?: { id: string; name: string }[];
    students?: { id: string }[];
    leaders?: { id: string }[];
    _count?: {
      classes?: number;
    };
  };
  classCount: number;
  translations: {
    basicInfo: string;
    statistics: string;
    childUnits: string;
    name: string;
    description: string;
    parentUnit: string;
    students: string;
    leaders: string;
    classes: string;
  };
}

export function OverviewTab({ unit, classCount, translations: t }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t.basicInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.name}</span>
              <span className="font-medium">{unit.name}</span>
            </div>
            {unit.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.description}</span>
                <span>{unit.description}</span>
              </div>
            )}
            {unit.parent && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.parentUnit}</span>
                <Link
                  href={`/admin/units/${unit.parent.id}`}
                  className="hover:underline text-primary"
                >
                  {unit.parent.name}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t.statistics}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">{t.students}</span>
              </div>
              <Badge variant="secondary">{unit.students?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">{t.leaders}</span>
              </div>
              <Badge variant="secondary">{unit.leaders?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-500" />
                <span className="text-muted-foreground">{t.classes}</span>
              </div>
              <Badge variant="secondary">{classCount}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Child Units */}
      {unit.children && unit.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.childUnits}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unit.children.map((child) => (
                <Link key={child.id} href={`/admin/units/${child.id}`}>
                  <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                    {child.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

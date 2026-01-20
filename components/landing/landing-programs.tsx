import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, User, GraduationCap } from "lucide-react";

export function LandingPrograms() {
  const t = useTranslations("landing.programs");

  const programs = [
    {
      icon: Baby,
      key: "oanhVu",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: User,
      key: "thieu",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: GraduationCap,
      key: "thanh",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <section id="programs" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {programs.map((program) => (
            <Card
              key={program.key}
              className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <CardHeader className="text-center pb-2">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full ${program.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <program.icon className={`h-8 w-8 ${program.color}`} />
                </div>
                <CardTitle className="text-xl">
                  {t(`${program.key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="secondary" className="mb-4">
                  {t(`${program.key}.age`)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t(`${program.key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BookOpen, Users } from "lucide-react";

export function LandingAbout() {
  const t = useTranslations("landing.about");

  const values = [
    {
      icon: Heart,
      title: t("value1"),
      description: t("value1Desc"),
    },
    {
      icon: BookOpen,
      title: t("value2"),
      description: t("value2Desc"),
    },
    {
      icon: Users,
      title: t("value3"),
      description: t("value3Desc"),
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t("mission")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("missionText")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold">{t("values")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {values.map((value, index) => (
            <Card
              key={index}
              className="border-none shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

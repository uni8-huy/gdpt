import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function LandingContact() {
  const t = useTranslations("landing.contact");

  const contactItems = [
    {
      icon: MapPin,
      label: t("address"),
      // Placeholder - should be configured via environment or CMS
      value: "123 Example Street, City, State 12345",
    },
    {
      icon: Phone,
      label: t("phone"),
      value: "(123) 456-7890",
    },
    {
      icon: Mail,
      label: t("email"),
      value: "contact@gdpt.org",
    },
    {
      icon: Clock,
      label: t("hours"),
      value: t("hoursText"),
    },
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {contactItems.map((item, index) => (
            <Card
              key={index}
              className="border-none shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

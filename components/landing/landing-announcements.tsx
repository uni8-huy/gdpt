import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedAt: Date | null;
}

interface LandingAnnouncementsProps {
  announcements: Announcement[];
}

export function LandingAnnouncements({
  announcements,
}: LandingAnnouncementsProps) {
  const t = useTranslations("landing.announcements");

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {announcements.length > 0 ? (
          <>
            <div className="max-w-4xl mx-auto space-y-4">
              {announcements.map((announcement, index) => (
                <Card
                  key={announcement.id}
                  className={`hover:shadow-md transition-shadow ${
                    index === 0 ? "border-primary/50" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {index === 0 && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bell className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <CardTitle
                            className={`${index === 0 ? "text-lg" : "text-base"}`}
                          >
                            {announcement.title}
                          </CardTitle>
                          {announcement.publishedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(announcement.publishedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={index === 0 ? "" : "pt-0"}>
                    <p className="text-sm text-muted-foreground">
                      {truncateContent(announcement.content)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <a href="/login">
                  {t("viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            {t("noAnnouncements")}
          </div>
        )}
      </div>
    </section>
  );
}

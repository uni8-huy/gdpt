import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, UserCheck, Calendar } from "lucide-react";

interface StatsCardsProps {
  stats: {
    users: number;
    students: number;
    leaders: number;
    events: number;
  };
  labels?: {
    users?: string;
    students?: string;
    leaders?: string;
    events?: string;
  };
}

export function StatsCards({ stats, labels }: StatsCardsProps) {
  const cards = [
    {
      title: labels?.users || "Người dùng",
      value: stats.users,
      icon: Users,
      description: "Tổng số tài khoản",
    },
    {
      title: labels?.students || "Đoàn sinh",
      value: stats.students,
      icon: GraduationCap,
      description: "Đang sinh hoạt",
    },
    {
      title: labels?.leaders || "Huynh trưởng",
      value: stats.leaders,
      icon: UserCheck,
      description: "Đang hoạt động",
    },
    {
      title: labels?.events || "Sự kiện",
      value: stats.events,
      icon: Calendar,
      description: "Tổng số sự kiện",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

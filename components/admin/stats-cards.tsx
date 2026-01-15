import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, UserCheck, Calendar } from "lucide-react";

interface StatsCardsProps {
  stats: {
    users: number;
    students: number;
    leaders: number;
    events: number;
  };
  labels: {
    users: string;
    usersDesc: string;
    students: string;
    studentsDesc: string;
    leaders: string;
    leadersDesc: string;
    events: string;
    eventsDesc: string;
  };
}

export function StatsCards({ stats, labels }: StatsCardsProps) {
  const cards = [
    {
      title: labels.users,
      value: stats.users,
      icon: Users,
      description: labels.usersDesc,
    },
    {
      title: labels.students,
      value: stats.students,
      icon: GraduationCap,
      description: labels.studentsDesc,
    },
    {
      title: labels.leaders,
      value: stats.leaders,
      icon: UserCheck,
      description: labels.leadersDesc,
    },
    {
      title: labels.events,
      value: stats.events,
      icon: Calendar,
      description: labels.eventsDesc,
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

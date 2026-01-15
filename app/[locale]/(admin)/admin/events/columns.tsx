"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { Link } from "@/i18n/navigation";

type Event = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isPublic: boolean;
  targetRoles: string[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/events/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("title")}
        </Link>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {formatDate(row.original.startDate)}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Địa điểm",
    cell: ({ row }) => {
      const location = row.getValue("location") as string | null;
      return location ? (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {location}
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "isPublic",
    header: "Công khai",
    cell: ({ row }) => {
      const isPublic = row.getValue("isPublic") as boolean;
      return (
        <Badge variant={isPublic ? "success" : "secondary"}>
          {isPublic ? "Công khai" : "Nội bộ"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "targetRoles",
    header: "Đối tượng",
    cell: ({ row }) => {
      const roles = row.original.targetRoles;
      const roleLabels: Record<string, string> = {
        ADMIN: "Admin",
        LEADER: "HT",
        PARENT: "PH",
      };
      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role) => (
            <Badge key={role} variant="outline" className="text-xs">
              {roleLabels[role] || role}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/events/${row.original.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

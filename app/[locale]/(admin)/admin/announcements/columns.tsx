"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { Link } from "@/i18n/navigation";

type Announcement = {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt: Date | null;
  targetRoles: string[];
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/announcements/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("title")}
        </Link>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") as boolean;
      return (
        <Badge variant={isPublished ? "success" : "secondary"}>
          {isPublished ? "Đã đăng" : "Nháp"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày đăng" />
    ),
    cell: ({ row }) => {
      const publishedAt = row.original.publishedAt;
      return publishedAt ? (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3" />
          {formatDate(publishedAt)}
        </div>
      ) : (
        "-"
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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return formatDate(row.original.createdAt);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/announcements/${row.original.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { Link } from "@/i18n/navigation";

type Student = {
  id: string;
  name: string;
  dharmaName: string | null;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  className: string | null;
  status: "ACTIVE" | "INACTIVE";
  unit: { id: string; name: string };
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Họ tên" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/students/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("name")}
        </Link>
      );
    },
  },
  {
    accessorKey: "dharmaName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pháp danh" />
    ),
    cell: ({ row }) => {
      return row.getValue("dharmaName") || "-";
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày sinh" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("dateOfBirth") as Date;
      return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
    },
  },
  {
    accessorKey: "gender",
    header: "Giới tính",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return gender === "MALE" ? "Nam" : "Nữ";
    },
  },
  {
    accessorKey: "unit.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đơn vị" />
    ),
    cell: ({ row }) => {
      return row.original.unit?.name || "-";
    },
  },
  {
    accessorKey: "className",
    header: "Lớp",
    cell: ({ row }) => {
      return row.getValue("className") || "-";
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
          {status === "ACTIVE" ? "Hoạt động" : "Nghỉ"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/students/${row.original.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

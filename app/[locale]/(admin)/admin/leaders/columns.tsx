"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { Link } from "@/i18n/navigation";

type Leader = {
  id: string;
  name: string;
  dharmaName: string | null;
  yearOfBirth: number;
  level: string | null;
  status: "ACTIVE" | "INACTIVE";
  unit: { id: string; name: string };
  user: { email: string } | null;
  _count: { timeline: number; trainingRecords: number };
};

export const columns: ColumnDef<Leader>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Họ tên" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/leaders/${row.original.id}`}
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
    accessorKey: "yearOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Năm sinh" />
    ),
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
    accessorKey: "level",
    header: "Bậc",
    cell: ({ row }) => {
      return row.getValue("level") || "-";
    },
  },
  {
    id: "timeline",
    header: "Sinh hoạt",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.original._count.timeline} giai đoạn
        </Badge>
      );
    },
  },
  {
    id: "training",
    header: "Tu học",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.original._count.trainingRecords} trại
        </Badge>
      );
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
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/leaders/${row.original.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

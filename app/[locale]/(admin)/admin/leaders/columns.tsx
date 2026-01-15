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

export type LeaderColumnsTranslations = {
  name: string;
  dharmaName: string;
  yearOfBirth: string;
  unit: string;
  level: string;
  timeline: string;
  training: string;
  status: string;
  active: string;
  inactive: string;
  phases: string;
  camps: string;
};

export function createColumns(
  translations: LeaderColumnsTranslations
): ColumnDef<Leader>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations.name} />
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
        <DataTableColumnHeader column={column} title={translations.dharmaName} />
      ),
      cell: ({ row }) => {
        return row.getValue("dharmaName") || "-";
      },
    },
    {
      accessorKey: "yearOfBirth",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations.yearOfBirth} />
      ),
    },
    {
      accessorKey: "unit.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations.unit} />
      ),
      cell: ({ row }) => {
        return row.original.unit?.name || "-";
      },
    },
    {
      accessorKey: "level",
      header: translations.level,
      cell: ({ row }) => {
        return row.getValue("level") || "-";
      },
    },
    {
      id: "timeline",
      header: translations.timeline,
      cell: ({ row }) => {
        return (
          <Badge variant="outline">
            {row.original._count.timeline} {translations.phases}
          </Badge>
        );
      },
    },
    {
      id: "training",
      header: translations.training,
      cell: ({ row }) => {
        return (
          <Badge variant="outline">
            {row.original._count.trainingRecords} {translations.camps}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: translations.status,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
            {status === "ACTIVE" ? translations.active : translations.inactive}
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
}

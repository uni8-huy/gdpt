"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { Link } from "@/i18n/navigation";

export type Student = {
  id: string;
  name: string;
  dharmaName: string | null;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
  unit: { id: string; name: string };
  class: { id: string; name: string } | null;
  parents: { parent: { id: string; name: string; email: string } }[];
};

export type StudentColumnsTranslations = {
  name: string;
  dharmaName: string;
  dateOfBirth: string;
  gender: string;
  unit: string;
  class: string;
  status: string;
  male: string;
  female: string;
  active: string;
  inactive: string;
};

export function createColumns(
  translations: StudentColumnsTranslations,
  locale: string
): ColumnDef<Student>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations.name} />
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
        <DataTableColumnHeader column={column} title={translations.dharmaName} />
      ),
      cell: ({ row }) => {
        return row.getValue("dharmaName") || "-";
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations.dateOfBirth} />
      ),
      cell: ({ row }) => {
        const date = row.getValue("dateOfBirth") as Date;
        return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US").format(new Date(date));
      },
    },
    {
      accessorKey: "gender",
      header: translations.gender,
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        return gender === "MALE" ? translations.male : translations.female;
      },
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
      accessorKey: "class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations.class} />
      ),
      cell: ({ row }) => {
        const cls = row.original.class;
        return cls ? cls.name : <span className="text-muted-foreground">-</span>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.class?.id);
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
}

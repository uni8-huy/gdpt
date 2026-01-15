"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { createColumns, type LeaderColumnsTranslations } from "./columns";

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

interface LeadersDataTableProps {
  data: Leader[];
  translations: LeaderColumnsTranslations & {
    searchPlaceholder: string;
  };
}

export function LeadersDataTable({ data, translations }: LeadersDataTableProps) {
  const columns = useMemo(
    () => createColumns(translations),
    [translations]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder={translations.searchPlaceholder}
    />
  );
}

"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { createColumns, type StudentColumnsTranslations } from "./columns";

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

interface StudentsDataTableProps {
  data: Student[];
  translations: StudentColumnsTranslations & {
    searchPlaceholder: string;
  };
  locale: string;
}

export function StudentsDataTable({ data, translations, locale }: StudentsDataTableProps) {
  const columns = useMemo(
    () => createColumns(translations, locale),
    [translations, locale]
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

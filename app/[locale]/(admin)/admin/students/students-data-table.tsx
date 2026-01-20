"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/admin/data-table";
import { createColumns, type StudentColumnsTranslations, type Student } from "./columns";

export type { Student };

interface StudentsDataTableProps {
  data: Student[];
  translations: StudentColumnsTranslations & {
    searchPlaceholder: string;
    noData: string;
  };
  locale: string;
  onRowClick?: (student: Student) => void;
}

export function StudentsDataTable({ data, translations, locale, onRowClick }: StudentsDataTableProps) {
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
      noDataMessage={translations.noData}
      onRowClick={onRowClick}
    />
  );
}

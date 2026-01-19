"use client";

import { useState } from "react";
import { StudentsDataTable, type Student } from "./students-data-table";
import { StudentDetailSheet } from "./student-detail-sheet";
import { StudentSheet } from "./student-sheet";

type ParentBasic = {
  id: string;
  name: string;
  email: string;
};

type Unit = {
  id: string;
  name: string;
};

type StudentsClientWrapperProps = {
  students: Student[];
  allParents: ParentBasic[];
  units: Unit[];
  locale: string;
  tableTranslations: Parameters<typeof StudentsDataTable>[0]["translations"];
  detailSheetTranslations: Parameters<typeof StudentDetailSheet>[0]["translations"];
  sheetTranslations: Parameters<typeof StudentSheet>[0]["translations"];
};

export function StudentsClientWrapper({
  students,
  allParents,
  units,
  locale,
  tableTranslations,
  detailSheetTranslations,
  sheetTranslations,
}: StudentsClientWrapperProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
    setDetailSheetOpen(true);
  };

  const handleEditClick = () => {
    setDetailSheetOpen(false);
    setEditSheetOpen(true);
  };

  return (
    <>
      <StudentsDataTable
        data={students}
        translations={tableTranslations}
        locale={locale}
        onRowClick={handleRowClick}
      />
      <StudentDetailSheet
        student={selectedStudent}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        allParents={allParents}
        onEditClick={handleEditClick}
        translations={detailSheetTranslations}
      />
      {selectedStudent && (
        <StudentSheet
          student={{
            id: selectedStudent.id,
            name: selectedStudent.name,
            dharmaName: selectedStudent.dharmaName,
            dateOfBirth: selectedStudent.dateOfBirth,
            gender: selectedStudent.gender,
            unitId: selectedStudent.unit.id,
            classId: selectedStudent.class?.id || null,
            status: selectedStudent.status,
            notes: selectedStudent.notes,
          }}
          units={units}
          translations={sheetTranslations}
          trigger="icon"
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
        />
      )}
    </>
  );
}

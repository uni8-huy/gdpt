"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { StudentSheet } from "./student-sheet";
import { deleteStudent } from "@/lib/actions/student-actions";

interface Student {
  id: string;
  name: string;
  dharmaName: string | null;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE";
  unitId: string;
  classId: string | null;
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
  class: { id: string; name: string } | null;
}

interface Class {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

interface StudentsTabProps {
  unitId: string;
  students: Student[];
  classes: Class[];
  allUnits: Unit[];
  canDelete?: boolean;
  canMoveUnit?: boolean;
  translations: {
    title: string;
    searchPlaceholder: string;
    allClasses: string;
    allStatuses: string;
    addStudent: string;
    noStudents: string;
    noResults: string;
    active: string;
    inactive: string;
    male: string;
    female: string;
    deleteConfirm: string;
    deleteWarning: string;
    sheet: {
      addTitle: string;
      editTitle: string;
      name: string;
      dharmaName: string;
      dateOfBirth: string;
      gender: string;
      unit: string;
      class: string;
      selectClass: string;
      noClass: string;
      status: string;
      notes: string;
      male: string;
      female: string;
      active: string;
      inactive: string;
      common: {
        save: string;
        saving: string;
        cancel: string;
        tryAgain: string;
        delete: string;
        deleting: string;
      };
    };
  };
}

export function StudentsTab({
  unitId,
  students,
  classes,
  allUnits,
  canDelete = true,
  canMoveUnit = true,
  translations: t,
}: StudentsTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.dharmaName?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchClass = classFilter === "all" || s.class?.id === classFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setSheetOpen(true);
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setSheetOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete.id);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete student:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t.allClasses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allClasses}</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder={t.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              <SelectItem value="ACTIVE">{t.active}</SelectItem>
              <SelectItem value="INACTIVE">{t.inactive}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t.addStudent}
        </Button>
      </div>

      {/* Students list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.title} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noStudents}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noResults}</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{student.name}</span>
                      {student.dharmaName && (
                        <span className="text-muted-foreground text-sm truncate">
                          ({student.dharmaName})
                        </span>
                      )}
                      <Badge
                        variant={student.status === "ACTIVE" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {student.status === "ACTIVE" ? t.active : t.inactive}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{formatDate(student.dateOfBirth)}</span>
                      <span>{student.gender === "MALE" ? t.male : t.female}</span>
                      {student.class && (
                        <Badge variant="outline" className="text-xs">
                          {student.class.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(student)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(student)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Sheet */}
      <StudentSheet
        unitId={unitId}
        student={selectedStudent}
        classes={classes}
        allUnits={allUnits}
        canMoveUnit={canMoveUnit}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        translations={t.sheet}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToDelete && (
                <>
                  <strong>{studentToDelete.name}</strong>
                  <br />
                  {t.deleteWarning}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t.sheet.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t.sheet.common.deleting : t.sheet.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link2, Unlink, Users, User } from "lucide-react";
import {
  linkParentToStudent,
  unlinkParentFromStudent,
} from "@/lib/actions/parent-student-actions";

type Parent = {
  id: string;
  name: string;
  email: string;
};

type StudentWithParents = {
  id: string;
  name: string;
  dharmaName: string | null;
  unit: { name: string };
  parents: Array<{
    id: string;
    relation: string;
    parent: { id: string; name: string; email: string };
  }>;
};

type Props = {
  parents: Parent[];
  students: StudentWithParents[];
};

export function ParentStudentManager({ parents, students }: Props) {
  const t = useTranslations("admin.parents");
  const [isPending, startTransition] = useTransition();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [relation, setRelation] = useState("Parent");

  const handleLink = () => {
    if (!selectedStudent || !selectedParent) return;

    startTransition(async () => {
      const result = await linkParentToStudent(
        selectedParent,
        selectedStudent,
        relation
      );
      if (result.success) {
        setSelectedParent("");
        setRelation("Parent");
      }
    });
  };

  const handleUnlink = (parentId: string, studentId: string) => {
    startTransition(async () => {
      await unlinkParentFromStudent(parentId, studentId);
    });
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Students List */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("studentsList")}
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`w-full text-left p-3 rounded-md border transition-colors ${
                selectedStudent === student.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
            >
              <div className="font-medium">{student.name}</div>
              {student.dharmaName && (
                <div className="text-sm text-muted-foreground">
                  {student.dharmaName}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {student.unit.name}
              </div>
              {student.parents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {student.parents.map((p) => (
                    <span
                      key={p.id}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {p.parent.name} ({p.relation})
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Student & Link Form */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("linkParent")}
        </h2>

        {selectedStudentData ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{selectedStudentData.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedStudentData.unit.name}
              </div>
            </div>

            {/* Current Parents */}
            {selectedStudentData.parents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {t("currentParents")}
                </h3>
                <div className="space-y-2">
                  {selectedStudentData.parents.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{p.parent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {p.parent.email} - {p.relation}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleUnlink(p.parent.id, selectedStudentData.id)
                        }
                        disabled={isPending}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                        title={t("unlink")}
                      >
                        <Unlink className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link New Parent Form */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-medium">{t("addParent")}</h3>

              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t("selectParent")}</option>
                {parents
                  .filter(
                    (p) =>
                      !selectedStudentData.parents.some(
                        (sp) => sp.parent.id === p.id
                      )
                  )
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} ({parent.email})
                    </option>
                  ))}
              </select>

              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Parent">{t("relationParent")}</option>
                <option value="Guardian">{t("relationGuardian")}</option>
                <option value="Grandparent">{t("relationGrandparent")}</option>
                <option value="Other">{t("relationOther")}</option>
              </select>

              <button
                onClick={handleLink}
                disabled={isPending || !selectedParent}
                className="w-full flex items-center justify-center gap-2 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                <Link2 className="h-4 w-4" />
                {t("linkButton")}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {t("selectStudentPrompt")}
          </div>
        )}
      </div>
    </div>
  );
}

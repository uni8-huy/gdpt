"use client";

import { useState } from "react";
import { UsersDataTable } from "./users-data-table";
import { UserDetailSheet } from "./user-detail-sheet";
import { UserSheet } from "./user-sheet";
import { RoleChangeDialog } from "./role-change-dialog";
import type { UserWithRelations } from "@/lib/actions/user-actions";

type StudentBasic = {
  id: string;
  name: string;
  unit?: { name: string };
};

type Unit = {
  id: string;
  name: string;
};

type UsersClientWrapperProps = {
  users: UserWithRelations[];
  currentUserId: string;
  allStudents?: StudentBasic[];
  units?: Unit[];
  translations: Parameters<typeof UsersDataTable>[0]["translations"];
  detailSheetTranslations: Parameters<typeof UserDetailSheet>[0]["translations"];
  userSheetTranslations: Parameters<typeof UserSheet>[0]["translations"];
  roleChangeTranslations: Parameters<typeof RoleChangeDialog>[0]["translations"];
};

export function UsersClientWrapper({
  users,
  currentUserId,
  allStudents = [],
  units = [],
  translations,
  detailSheetTranslations,
  userSheetTranslations,
  roleChangeTranslations,
}: UsersClientWrapperProps) {
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);

  const handleRowClick = (user: UserWithRelations) => {
    setSelectedUser(user);
    setDetailSheetOpen(true);
  };

  const handleEditClick = () => {
    setDetailSheetOpen(false);
    setEditSheetOpen(true);
  };

  const handleRoleChangeClick = () => {
    setDetailSheetOpen(false);
    setRoleChangeOpen(true);
  };

  return (
    <>
      <UsersDataTable
        users={users}
        currentUserId={currentUserId}
        onRowClick={handleRowClick}
        translations={translations}
      />
      <UserDetailSheet
        user={selectedUser}
        currentUserId={currentUserId}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        allStudents={allStudents}
        units={units}
        onEditClick={handleEditClick}
        onRoleChangeClick={handleRoleChangeClick}
        translations={detailSheetTranslations}
      />
      {selectedUser && (
        <>
          <UserSheet
            user={{
              id: selectedUser.id,
              name: selectedUser.name,
              email: selectedUser.email,
            }}
            translations={userSheetTranslations}
            trigger="icon"
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
          />
          <RoleChangeDialog
            user={{
              id: selectedUser.id,
              name: selectedUser.name,
              role: selectedUser.role,
              leaderProfile: selectedUser.leaderProfile,
              parentLinks: selectedUser.parentLinks,
            }}
            currentUserId={currentUserId}
            units={units}
            open={roleChangeOpen}
            onOpenChange={setRoleChangeOpen}
            translations={roleChangeTranslations}
          />
        </>
      )}
    </>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { getUsers } from "@/lib/actions/user-actions";
import { getInvitations } from "@/lib/actions/invitation-actions";
import { getUnitsWithHierarchy } from "@/lib/actions/unit-actions";
import { getStudents } from "@/lib/actions/student-actions";
import { requireRole } from "@/lib/session";
import { UsersClientWrapper } from "./users-client-wrapper";
import { UserSheet } from "./user-sheet";
import { InviteDialog } from "./invite-dialog";
import { InvitationsTab } from "./invitations-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "users" });
  return {
    title: `${t("management")} - Admin`,
  };
}

export default async function UsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole("ADMIN", locale);
  const [users, invitations, units, students] = await Promise.all([
    getUsers(),
    getInvitations(),
    getUnitsWithHierarchy(),
    getStudents(),
  ]);

  const [t, common, roles, status, invitationT] = await Promise.all([
    getTranslations("users"),
    getTranslations("common"),
    getTranslations("roles"),
    getTranslations("status"),
    getTranslations("invitation"),
  ]);

  const translations = {
    title: t("management"),
    name: t("name"),
    email: t("email"),
    role: t("role"),
    createdAt: t("createdAt"),
    actions: t("actions"),
    viewDetails: t("viewDetails"),
    changeRole: t("changeRole"),
    resetPassword: t("resetPassword"),
    deleteUser: t("deleteUser"),
    currentRole: t("currentRole"),
    newRole: t("newRole"),
    roleChangeConfirm: t("roleChangeConfirm"),
    roleChangeWarning: t("roleChangeWarning"),
    roleChangeSuccess: t("roleChangeSuccess"),
    roleChangeLeaderWarning: t("roleChangeLeaderWarning"),
    roleChangeAdminWarning: t("roleChangeAdminWarning"),
    lastAdminWarning: t("lastAdminWarning"),
    resetPasswordConfirm: t("resetPasswordConfirm"),
    resetPasswordDesc: t("resetPasswordDesc"),
    resetPasswordSuccess: t("resetPasswordSuccess"),
    temporaryPassword: t("temporaryPassword"),
    copyPassword: t("copyPassword"),
    passwordCopied: t("passwordCopied"),
    passwordResetNote: t("passwordResetNote"),
    deleteConfirm: t("deleteConfirm"),
    deleteWarning: t("deleteWarning"),
    deleteSuccess: t("deleteSuccess"),
    cannotDeleteSelf: t("cannotDeleteSelf"),
    filterByRole: t("filterByRole"),
    allRoles: t("allRoles"),
    statusHeader: t("status"),
    leaderProfile: t("leaderProfile"),
    linkedStudents: t("linkedStudents"),
    noLinkedStudents: t("noLinkedStudents"),
    viewLeaderProfile: t("viewLeaderProfile"),
    invite: t("invite"),
    invitations: t("invitations"),
    common: {
      search: common("search"),
      searchPlaceholder: common("searchPlaceholder"),
      cancel: common("cancel"),
      delete: common("delete"),
      deleting: common("deleting"),
      save: common("save"),
      saving: common("saving"),
      noData: common("noData"),
      tryAgain: common("tryAgain"),
    },
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
    status: {
      active: status("active"),
      inactive: status("inactive"),
    },
  };

  const inviteTranslations = {
    invite: invitationT("title"),
    create: invitationT("create"),
    email: invitationT("email"),
    name: invitationT("name"),
    role: invitationT("role"),
    unit: invitationT("unit"),
    selectUnit: invitationT("selectUnit"),
    optional: invitationT("optional"),
    createSuccess: invitationT("createSuccess"),
    shareLink: invitationT("shareLink"),
    expiresIn7Days: invitationT("expiresIn7Days"),
    inviteDetails: invitationT("inviteDetails"),
    copyLink: invitationT("copyLink"),
    linkCopied: invitationT("linkCopied"),
    common: {
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
  };

  const invitationsTabTranslations = {
    email: invitationT("email"),
    role: invitationT("role"),
    unit: invitationT("unit"),
    expires: invitationT("expires"),
    expired: invitationT("expired"),
    days: invitationT("days"),
    pending: invitationT("pending"),
    used: invitationT("used"),
    cancel: invitationT("cancel"),
    resend: invitationT("resend"),
    copyLink: invitationT("copyLink"),
    linkCopied: invitationT("linkCopied"),
    noInvitations: invitationT("noInvitations"),
    common: {
      cancel: common("cancel"),
      delete: common("delete"),
      deleting: common("deleting"),
    },
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
  };

  const unitsList = units.map((u) => ({ id: u.id, name: u.name }));

  const userSheetTranslations = {
    addNew: t("addNew"),
    edit: t("edit"),
    name: t("name"),
    email: t("email"),
    createSuccess: t("createSuccess"),
    updateSuccess: t("updateSuccess"),
    temporaryPassword: t("temporaryPassword"),
    copyPassword: t("copyPassword"),
    passwordCopied: t("passwordCopied"),
    passwordNote: t("passwordNote"),
    common: {
      save: common("save"),
      saving: common("saving"),
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  const detailSheetTranslations = {
    viewDetails: t("viewDetails"),
    basicInfo: t("basicInfo"),
    email: t("email"),
    role: t("role"),
    createdAt: t("createdAt"),
    leaderProfile: t("leaderProfile"),
    unit: t("unit"),
    level: t("level"),
    dharmaName: t("dharmaName"),
    viewFullProfile: t("viewFullProfile"),
    noLeaderProfile: t("noLeaderProfile"),
    linkedStudents: t("linkedStudents"),
    noLinkedStudents: t("noLinkedStudents"),
    linkStudent: t("linkStudent"),
    selectStudent: t("selectStudent"),
    unlink: t("unlink"),
    edit: t("edit"),
    changeRole: t("changeRole"),
    resetPassword: t("resetPassword"),
    deleteUser: t("deleteUser"),
    resetPasswordConfirm: t("resetPasswordConfirm"),
    resetPasswordDesc: t("resetPasswordDesc"),
    resetPasswordSuccess: t("resetPasswordSuccess"),
    temporaryPassword: t("temporaryPassword"),
    copyPassword: t("copyPassword"),
    passwordCopied: t("passwordCopied"),
    passwordResetNote: t("passwordResetNote"),
    deleteConfirm: t("deleteConfirm"),
    deleteWarning: t("deleteWarning"),
    cannotDeleteSelf: t("cannotDeleteSelf"),
    copyEmail: t("copyEmail"),
    emailCopied: t("emailCopied"),
    createLeaderProfile: t("createLeaderProfile"),
    leaderProfileTabs: {
      summary: t("leaderProfileTabs.summary"),
      personal: t("leaderProfileTabs.personal"),
      gdpt: t("leaderProfileTabs.gdpt"),
      contact: t("leaderProfileTabs.contact"),
      timeline: t("leaderProfileTabs.timeline"),
      training: t("leaderProfileTabs.training"),
      name: t("leaderProfileTabs.name"),
      dharmaName: t("leaderProfileTabs.dharmaName"),
      yearOfBirth: t("leaderProfileTabs.yearOfBirth"),
      fullDateOfBirth: t("leaderProfileTabs.fullDateOfBirth"),
      unit: t("leaderProfileTabs.unit"),
      level: t("leaderProfileTabs.level"),
      status: t("leaderProfileTabs.status"),
      placeOfOrigin: t("leaderProfileTabs.placeOfOrigin"),
      education: t("leaderProfileTabs.education"),
      occupation: t("leaderProfileTabs.occupation"),
      phone: t("leaderProfileTabs.phone"),
      address: t("leaderProfileTabs.address"),
      gdptJoinDate: t("leaderProfileTabs.gdptJoinDate"),
      quyYDate: t("leaderProfileTabs.quyYDate"),
      quyYName: t("leaderProfileTabs.quyYName"),
      notes: t("leaderProfileTabs.notes"),
      save: t("leaderProfileTabs.save"),
      saving: t("leaderProfileTabs.saving"),
      cancel: t("leaderProfileTabs.cancel"),
      active: t("leaderProfileTabs.active"),
      inactive: t("leaderProfileTabs.inactive"),
      selectUnit: t("leaderProfileTabs.selectUnit"),
      selectLevel: t("leaderProfileTabs.selectLevel"),
      addTimeline: t("leaderProfileTabs.addTimeline"),
      addTraining: t("leaderProfileTabs.addTraining"),
      role: t("leaderProfileTabs.role"),
      startYear: t("leaderProfileTabs.startYear"),
      endYear: t("leaderProfileTabs.endYear"),
      current: t("leaderProfileTabs.current"),
      campName: t("leaderProfileTabs.campName"),
      year: t("leaderProfileTabs.year"),
      region: t("leaderProfileTabs.region"),
      delete: t("leaderProfileTabs.delete"),
      noTimeline: t("leaderProfileTabs.noTimeline"),
      noTraining: t("leaderProfileTabs.noTraining"),
    },
    timelineDialog: {
      title: t("timelineDialog.title"),
      description: t("timelineDialog.description"),
      role: t("timelineDialog.role"),
      unit: t("timelineDialog.unit"),
      selectUnit: t("timelineDialog.selectUnit"),
      startYear: t("timelineDialog.startYear"),
      endYear: t("timelineDialog.endYear"),
      endYearOptional: t("timelineDialog.endYearOptional"),
      notes: t("timelineDialog.notes"),
      save: t("timelineDialog.save"),
      saving: t("timelineDialog.saving"),
      cancel: t("timelineDialog.cancel"),
    },
    trainingDialog: {
      title: t("trainingDialog.title"),
      description: t("trainingDialog.description"),
      campName: t("trainingDialog.campName"),
      year: t("trainingDialog.year"),
      region: t("trainingDialog.region"),
      regionOptional: t("trainingDialog.regionOptional"),
      level: t("trainingDialog.level"),
      notes: t("trainingDialog.notes"),
      save: t("trainingDialog.save"),
      saving: t("trainingDialog.saving"),
      cancel: t("trainingDialog.cancel"),
    },
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
    status: {
      active: status("active"),
      inactive: status("inactive"),
    },
    common: {
      cancel: common("cancel"),
      delete: common("delete"),
      deleting: common("deleting"),
      tryAgain: common("tryAgain"),
    },
  };

  // Map students for the detail sheet
  const allStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    unit: s.unit ? { name: s.unit.name } : undefined,
  }));

  const roleChangeTranslations = {
    title: t("roleChangeTitle"),
    description: t("roleChangeDescription"),
    currentRole: t("currentRole"),
    newRole: t("newRole"),
    selectRole: t("selectRole"),
    warnings: t("warnings"),
    fromLeaderWarning: t("fromLeaderWarning"),
    fromParentWarning: t("fromParentWarning"),
    toAdminWarning: t("toAdminWarning"),
    toLeaderPrompt: t("toLeaderPrompt"),
    selectUnit: t("selectUnit"),
    optional: t("optional"),
    confirm: t("confirm"),
    confirming: t("confirming"),
    success: t("roleChangeSuccess"),
    lastAdminWarning: t("lastAdminWarning"),
    cannotChangeSelf: t("cannotDeleteSelf"),
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
    common: {
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{translations.title}</h1>
        <InviteDialog
          currentUserId={session.user.id}
          units={unitsList}
          translations={inviteTranslations}
        />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">{t("title")}</TabsTrigger>
          <TabsTrigger value="invitations">{t("invitations")}</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersClientWrapper
            users={users}
            currentUserId={session.user.id}
            allStudents={allStudents}
            units={unitsList}
            translations={translations}
            detailSheetTranslations={detailSheetTranslations}
            userSheetTranslations={userSheetTranslations}
            roleChangeTranslations={roleChangeTranslations}
          />
        </TabsContent>
        <TabsContent value="invitations">
          <InvitationsTab
            invitations={invitations}
            currentUserId={session.user.id}
            translations={invitationsTabTranslations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

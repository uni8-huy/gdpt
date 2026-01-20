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
import { UserCheck, Plus, Search, Pencil, Trash2, Mail } from "lucide-react";
import { LeaderSheet } from "./leader-sheet";
import { deleteLeader } from "@/lib/actions/leader-actions";

interface Leader {
  id: string;
  name: string;
  dharmaName: string | null;
  yearOfBirth: number;
  unitId: string;
  status: "ACTIVE" | "INACTIVE";
  fullDateOfBirth: Date | null;
  placeOfOrigin: string | null;
  education: string | null;
  occupation: string | null;
  phone: string | null;
  address: string | null;
  gdptJoinDate: Date | null;
  quyYDate: Date | null;
  quyYName: string | null;
  level: string | null;
  notes: string | null;
  user: { email: string } | null;
}

interface Unit {
  id: string;
  name: string;
}

interface AvailableUser {
  id: string;
  name: string | null;
  email: string;
}

interface LeadersTabProps {
  unitId: string;
  leaders: Leader[];
  allUnits: Unit[];
  availableUsers: AvailableUser[];
  translations: {
    title: string;
    searchPlaceholder: string;
    allStatuses: string;
    addLeader: string;
    noLeaders: string;
    noResults: string;
    active: string;
    inactive: string;
    deleteConfirm: string;
    deleteWarning: string;
    sheet: {
      addTitle: string;
      editTitle: string;
      selectUser: string;
      noAvailableUsers: string;
      basicInfo: string;
      name: string;
      dharmaName: string;
      yearOfBirth: string;
      fullDateOfBirth: string;
      unit: string;
      level: string;
      status: string;
      contact: string;
      phone: string;
      address: string;
      gdptInfo: string;
      gdptJoinDate: string;
      quyYDate: string;
      quyYName: string;
      other: string;
      placeOfOrigin: string;
      education: string;
      occupation: string;
      notes: string;
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

export function LeadersTab({
  unitId,
  leaders,
  allUnits,
  availableUsers,
  translations: t,
}: LeadersTabProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return leaders.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.dharmaName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (l.user?.email.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leaders, search, statusFilter]);

  const handleEdit = (leader: Leader) => {
    setSelectedLeader(leader);
    setSheetOpen(true);
  };

  const handleAdd = () => {
    setSelectedLeader(null);
    setSheetOpen(true);
  };

  const handleDeleteClick = (leader: Leader) => {
    setLeaderToDelete(leader);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leaderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteLeader(leaderToDelete.id);
      setDeleteDialogOpen(false);
      setLeaderToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete leader:", error);
    } finally {
      setIsDeleting(false);
    }
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
          {t.addLeader}
        </Button>
      </div>

      {/* Leaders list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {t.title} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noLeaders}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noResults}</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((leader) => (
                <div
                  key={leader.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{leader.name}</span>
                      {leader.dharmaName && (
                        <span className="text-muted-foreground text-sm truncate">
                          ({leader.dharmaName})
                        </span>
                      )}
                      <Badge
                        variant={leader.status === "ACTIVE" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {leader.status === "ACTIVE" ? t.active : t.inactive}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{leader.yearOfBirth}</span>
                      {leader.level && (
                        <Badge variant="outline" className="text-xs">
                          {leader.level}
                        </Badge>
                      )}
                      {leader.user?.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />
                          {leader.user.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(leader)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(leader)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leader Sheet */}
      <LeaderSheet
        unitId={unitId}
        leader={selectedLeader}
        allUnits={allUnits}
        availableUsers={availableUsers}
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
              {leaderToDelete && (
                <>
                  <strong>{leaderToDelete.name}</strong>
                  {leaderToDelete.user?.email && (
                    <> ({leaderToDelete.user.email})</>
                  )}
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

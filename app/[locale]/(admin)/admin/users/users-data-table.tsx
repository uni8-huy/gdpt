"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { UserActionsDropdown } from "./user-actions-dropdown";
import { Role } from "@prisma/client";
import type { UserWithRelations } from "@/lib/actions/user-actions";

interface UsersDataTableProps {
  users: UserWithRelations[];
  currentUserId: string;
  onRowClick?: (user: UserWithRelations) => void;
  translations: {
    title: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    actions: string;
    viewDetails: string;
    changeRole: string;
    resetPassword: string;
    deleteUser: string;
    currentRole: string;
    newRole: string;
    roleChangeConfirm: string;
    roleChangeWarning: string;
    roleChangeSuccess: string;
    roleChangeLeaderWarning: string;
    roleChangeAdminWarning: string;
    lastAdminWarning: string;
    resetPasswordConfirm: string;
    resetPasswordDesc: string;
    resetPasswordSuccess: string;
    temporaryPassword: string;
    copyPassword: string;
    passwordCopied: string;
    passwordResetNote: string;
    deleteConfirm: string;
    deleteWarning: string;
    deleteSuccess: string;
    cannotDeleteSelf: string;
    filterByRole: string;
    allRoles: string;
    statusHeader: string;
    leaderProfile: string;
    linkedStudents: string;
    noLinkedStudents: string;
    viewLeaderProfile: string;
    invite: string;
    invitations: string;
    common: {
      search: string;
      searchPlaceholder: string;
      cancel: string;
      delete: string;
      deleting: string;
      save: string;
      saving: string;
      noData: string;
      tryAgain: string;
    };
    roles: {
      admin: string;
      leader: string;
      parent: string;
    };
    status: {
      active: string;
      inactive: string;
    };
  };
}

const roleColors: Record<Role, "destructive" | "default" | "secondary"> = {
  ADMIN: "destructive",
  LEADER: "default",
  PARENT: "secondary",
};

export function UsersDataTable({ users, currentUserId, onRowClick, translations: t }: UsersDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<UserWithRelations>[] = [
    {
      accessorKey: "name",
      header: t.name,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: t.role,
      cell: ({ row }) => {
        const role = row.original.role;
        const roleLabel = t.roles[role.toLowerCase() as keyof typeof t.roles];
        return (
          <Badge variant={roleColors[role]}>
            {roleLabel}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "emailVerified",
      header: t.statusHeader,
      cell: ({ row }) => {
        const isActive = row.original.emailVerified;
        return (
          <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-green-500 hover:bg-green-600" : ""}>
            {isActive ? t.status.active : t.status.inactive}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t.createdAt,
      cell: ({ row }) => {
        return new Intl.DateTimeFormat("vi-VN").format(new Date(row.original.createdAt));
      },
    },
    {
      id: "actions",
      header: t.actions,
      cell: ({ row }) => (
        <UserActionsDropdown
          user={row.original}
          currentUserId={currentUserId}
          onViewDetails={() => onRowClick?.(row.original)}
          translations={{
            viewDetails: t.viewDetails,
            viewLeaderProfile: t.viewLeaderProfile,
          }}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder={t.common.searchPlaceholder}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) =>
            table.getColumn("role")?.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filterByRole} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allRoles}</SelectItem>
            <SelectItem value="ADMIN">{t.roles.admin}</SelectItem>
            <SelectItem value="LEADER">{t.roles.leader}</SelectItem>
            <SelectItem value="PARENT">{t.roles.parent}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        // Prevent row click when clicking actions column
                        if (cell.column.id === "actions") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t.common.noData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}

"use client";

import { MoreHorizontal, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role } from "@prisma/client";
import { Link } from "@/i18n/navigation";

type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  leaderProfile: { id: string; name: string; unit: { name: string }; level: string | null; dharmaName: string | null } | null;
  parentLinks: { student: { id: string; name: string } }[];
};

interface UserActionsDropdownProps {
  user: User;
  currentUserId: string;
  onViewDetails: () => void;
  translations: {
    viewDetails: string;
    viewLeaderProfile: string;
  };
}

export function UserActionsDropdown({ user, onViewDetails, translations: t }: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          {t.viewDetails}
        </DropdownMenuItem>

        {user.leaderProfile && (
          <DropdownMenuItem asChild>
            <Link href={`/admin/leaders/${user.leaderProfile.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {t.viewLeaderProfile}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

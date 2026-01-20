"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbSegment {
  key: string;
  label?: string; // Dynamic label (e.g., unit name)
  href?: string;
}

interface BreadcrumbNavProps {
  // Optional dynamic segments to override auto-generated labels
  dynamicSegments?: Record<string, string>;
  // Portal type for correct path prefix
  portal: "admin" | "leader" | "parent";
}

// Map route segments to translation keys
const segmentTranslationKeys: Record<string, string> = {
  dashboard: "dashboard",
  students: "students",
  units: "units",
  users: "users",
  events: "events",
  announcements: "announcements",
  import: "import",
  submissions: "submissions",
  parents: "parents",
  profile: "profile",
  giapha: "giapha",
  calendar: "calendar",
  children: "children",
  contact: "contact",
  register: "register",
  edit: "edit",
};

export function BreadcrumbNav({ dynamicSegments = {}, portal }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const bc = useTranslations("breadcrumb");

  // Parse pathname into segments
  // e.g., /vi/admin/units/123 -> ["admin", "units", "123"]
  const pathParts = pathname.split("/").filter(Boolean);

  // Remove locale from path
  const withoutLocale = pathParts.slice(1);

  // Remove portal prefix
  const segments = withoutLocale.slice(1);

  // Build breadcrumb items
  const items: Array<{ label: string; href: string; isCurrent: boolean }> = [];

  // Always add Home first
  items.push({
    label: bc("home"),
    href: `/${portal}/dashboard`,
    isCurrent: segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard"),
  });

  // Build path progressively
  let currentPath = `/${portal}`;

  segments.forEach((segment, index) => {
    // Skip "dashboard" as it's already represented by Home
    if (segment === "dashboard") return;

    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Check for dynamic segment override first
    if (dynamicSegments[segment]) {
      items.push({
        label: dynamicSegments[segment],
        href: currentPath,
        isCurrent: isLast,
      });
    } else if (segmentTranslationKeys[segment]) {
      // Use translation for known segments
      items.push({
        label: t(segmentTranslationKeys[segment]),
        href: currentPath,
        isCurrent: isLast,
      });
    } else {
      // For dynamic IDs without override, skip showing raw ID
      // This handles cases like /units/[id] where we don't have the name yet
    }
  });

  // Don't render if only home
  if (items.length <= 1) {
    return null;
  }

  // Mobile: collapse middle items if more than 3
  const shouldCollapse = items.length > 3;
  const visibleItems = shouldCollapse
    ? [items[0], ...items.slice(-2)]
    : items;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          const isFirst = index === 0;
          const showEllipsis = shouldCollapse && index === 1;

          return (
            <BreadcrumbItem key={item.href}>
              {!isFirst && <BreadcrumbSeparator />}

              {showEllipsis && shouldCollapse && (
                <>
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <BreadcrumbSeparator />
                </>
              )}

              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="flex items-center gap-1">
                    {isFirst && <Home className="h-4 w-4" />}
                    {!isFirst && item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

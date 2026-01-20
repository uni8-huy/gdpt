"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type TabValue = "overview" | "classes" | "students" | "leaders";

interface UnitTabsWrapperProps {
  isAdmin: boolean;
  children: {
    overview: React.ReactNode;
    classes: React.ReactNode;
    students: React.ReactNode;
    leaders?: React.ReactNode;
  };
  translations: {
    overview: string;
    classes: string;
    students: string;
    leaders: string;
  };
}

function TabsInner({
  isAdmin,
  children,
  translations: t,
}: UnitTabsWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = (searchParams.get("tab") as TabValue) || "overview";

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [searchParams, router, pathname]
  );

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
        <TabsTrigger value="overview">{t.overview}</TabsTrigger>
        <TabsTrigger value="classes">{t.classes}</TabsTrigger>
        <TabsTrigger value="students">{t.students}</TabsTrigger>
        {isAdmin && <TabsTrigger value="leaders">{t.leaders}</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        {children.overview}
      </TabsContent>
      <TabsContent value="classes" className="mt-6">
        {children.classes}
      </TabsContent>
      <TabsContent value="students" className="mt-6">
        {children.students}
      </TabsContent>
      {isAdmin && children.leaders && (
        <TabsContent value="leaders" className="mt-6">
          {children.leaders}
        </TabsContent>
      )}
    </Tabs>
  );
}

export function UnitTabsWrapper(props: UnitTabsWrapperProps) {
  return (
    <Suspense fallback={<TabsSkeleton isAdmin={props.isAdmin} />}>
      <TabsInner {...props} />
    </Suspense>
  );
}

function TabsSkeleton({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="w-full">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 gap-1">
        <Skeleton className="h-8 w-24 rounded-sm" />
        <Skeleton className="h-8 w-20 rounded-sm" />
        <Skeleton className="h-8 w-24 rounded-sm" />
        {isAdmin && <Skeleton className="h-8 w-20 rounded-sm" />}
      </div>
      <div className="mt-6 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

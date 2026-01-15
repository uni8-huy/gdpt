import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { Link } from "@/i18n/navigation";
import { columns } from "./columns";
import { getStudents } from "@/lib/actions/student-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "student" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function StudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("student");

  const students = await getStudents();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/admin/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm đoàn sinh
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={students}
        searchKey="name"
        searchPlaceholder="Tìm theo tên..."
      />
    </div>
  );
}

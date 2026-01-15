import { setRequestLocale } from "next-intl/server";
import { ImportForm } from "./import-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: "Nhập dữ liệu - Admin",
  };
}

export default async function ImportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nhập dữ liệu</h1>
        <p className="text-muted-foreground">
          Nhập hàng loạt đoàn sinh hoặc huynh trưởng từ file CSV
        </p>
      </div>
      <ImportForm locale={locale} />
    </div>
  );
}

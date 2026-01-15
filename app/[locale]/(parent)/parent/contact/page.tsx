import { setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/session";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: "Liên hệ - Phụ huynh",
  };
}

export default async function ParentContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireRole(["PARENT", "ADMIN"], locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Liên hệ</h1>
        <p className="text-muted-foreground">
          Thông tin liên hệ Ban Điều Hành Gia Đình Phật Tử
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Điện thoại</div>
                <p className="text-sm text-muted-foreground">
                  Liên hệ trực tiếp Ban Điều Hành
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Email</div>
                <p className="text-sm text-muted-foreground">
                  Gửi email cho Ban Điều Hành
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Địa chỉ</div>
                <p className="text-sm text-muted-foreground">
                  Địa điểm sinh hoạt của Gia Đình Phật Tử
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thời gian sinh hoạt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Chủ nhật hàng tuần</div>
                <p className="text-sm text-muted-foreground">
                  Thời gian sinh hoạt định kỳ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lưu ý</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              Nếu có thắc mắc về thông tin con em, vui lòng liên hệ trực tiếp
              Huynh trưởng phụ trách
            </li>
            <li>
              Để cập nhật thông tin liên hệ hoặc thay đổi thông tin đăng ký, vui
              lòng gặp Ban Điều Hành
            </li>
            <li>
              Trong trường hợp khẩn cấp, vui lòng liên hệ số điện thoại Ban Điều
              Hành
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

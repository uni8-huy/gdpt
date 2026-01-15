"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  importStudents,
  importLeaders,
  getImportTemplate,
  type ImportResult,
} from "@/lib/actions/import-actions";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type ImportType = "students" | "leaders";

interface ImportFormProps {
  locale: string;
}

export function ImportForm({ locale }: ImportFormProps) {
  const [importType, setImportType] = useState<ImportType>("students");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [createUsers, setCreateUsers] = useState(true);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Parse CSV for preview
    Papa.parse<Record<string, string>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
      },
      error: (error) => {
        console.error("CSV Parse error:", error);
      },
    });
  }, []);

  const handleDownloadTemplate = async () => {
    const template = await getImportTemplate(importType);
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template-${importType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        setResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: parsed.errors.map((e) => `Lỗi parse: ${e.message}`),
        });
        return;
      }

      let importResult: ImportResult;
      if (importType === "students") {
        importResult = await importStudents(parsed.data as any);
      } else {
        importResult = await importLeaders(parsed.data as any, createUsers);
      }

      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "Lỗi không xác định"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Loại dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chọn loại dữ liệu cần nhập</Label>
            <Select
              value={importType}
              onValueChange={(v) => {
                setImportType(v as ImportType);
                resetForm();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Đoàn sinh</SelectItem>
                <SelectItem value="leaders">Huynh trưởng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {importType === "leaders" && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="createUsers"
                checked={createUsers}
                onCheckedChange={(checked) => setCreateUsers(checked === true)}
              />
              <Label htmlFor="createUsers" className="text-sm">
                Tự động tạo tài khoản người dùng từ email
              </Label>
            </div>
          )}

          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Tải mẫu CSV
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn file</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              {file ? (
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Nhấp để chọn file CSV</p>
                  <p className="text-sm text-muted-foreground">
                    Hoặc kéo thả file vào đây
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Xem trước (5 dòng đầu)</Label>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="px-3 py-2">
                            {value || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="w-full"
          >
            {isLoading ? (
              "Đang nhập..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Nhập dữ liệu
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : result.imported > 0 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Kết quả
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="success" className="text-sm">
                Đã nhập: {result.imported}
              </Badge>
              {result.skipped > 0 && (
                <Badge variant="secondary" className="text-sm">
                  Bỏ qua: {result.skipped}
                </Badge>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-destructive">Lỗi ({result.errors.length})</Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-destructive/5">
                  {result.errors.map((error, i) => (
                    <p key={i} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" onClick={resetForm}>
              Nhập tiếp
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Chọn loại dữ liệu cần nhập (Đoàn sinh hoặc Huynh trưởng)</p>
          <p>2. Tải file mẫu CSV để xem định dạng yêu cầu</p>
          <p>3. Điền dữ liệu vào file CSV theo đúng định dạng</p>
          <p>4. Tải file CSV lên và nhấn "Nhập dữ liệu"</p>
          <p className="font-medium text-foreground mt-4">Lưu ý:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Định dạng ngày sinh: DD/MM/YYYY hoặc YYYY-MM-DD</li>
            <li>Giới tính: Nam/Nữ hoặc Male/Female</li>
            <li>Tên đơn vị phải trùng khớp với đơn vị đã có trong hệ thống</li>
            <li>File CSV phải sử dụng encoding UTF-8</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

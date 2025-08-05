import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/types/product";
import { MissingItem } from "@/types/missing";
import { Sale } from "@/types/sale";
import { exportUtils, ExportData } from "@/utils/dataUtils";
import { Download, Upload, FileText, Database, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  missingItems: MissingItem[];
  sales: Sale[];
  onImportData: (data: { products?: Product[]; missingItems?: MissingItem[]; sales?: Sale[] }) => void;
}

export const DataManager = ({ 
  isOpen, 
  onClose, 
  products, 
  missingItems, 
  sales,
  onImportData 
}: DataManagerProps) => {
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExportJSON = () => {
    const exportData: ExportData = {
      products,
      missingItems,
      sales,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    exportUtils.downloadJSON(exportData);
    toast({
      title: "تم تصدير البيانات",
      description: "تم تحميل ملف JSON بجميع البيانات",
    });
  };

  const handleExportCSV = () => {
    exportUtils.downloadCSV(products);
    toast({
      title: "تم تصدير المنتجات",
      description: "تم تحميل ملف CSV بقائمة المنتجات",
    });
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف للاستيراد",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileContent = await importFile.text();
      const importedData = await exportUtils.importFromJSON(fileContent);
      
      onImportData({
        products: importedData.products,
        missingItems: importedData.missingItems,
        sales: importedData.sales
      });

      toast({
        title: "تم استيراد البيانات بنجاح",
        description: `تم استيراد ${importedData.products.length} منتج و ${importedData.missingItems?.length || 0} صنف مفقود و ${importedData.sales?.length || 0} عملية بيع`,
      });

      setImportFile(null);
      onClose();
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "فشل في قراءة البيانات. تأكد من صحة ملف JSON",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إدارة البيانات</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                تصدير البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleExportJSON} className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  تصدير جميع البيانات (JSON)
                </Button>
                
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  تصدير المنتجات (CSV)
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <div className="font-medium mb-2">ما سيتم تصديره:</div>
                <div className="space-y-1">
                  <div>• المنتجات: {products.length} منتج</div>
                  <div>• الأصناف المفقودة: {missingItems.length} صنف</div>
                  <div>• المبيعات: {sales.length} عملية بيع</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                استيراد البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div className="text-sm">
                  <div className="font-medium">تحذير:</div>
                  <div>سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة</div>
                </div>
              </div>

              <div>
                <Label htmlFor="import-file">اختر ملف JSON للاستيراد</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>

              {importFile && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <div className="font-medium">الملف المحدد:</div>
                  <div>{importFile.name}</div>
                  <div>الحجم: {(importFile.size / 1024).toFixed(2)} KB</div>
                </div>
              )}

              <Button 
                onClick={handleImport} 
                disabled={!importFile}
                variant="default"
                className="w-full"
              >
                استيراد البيانات
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
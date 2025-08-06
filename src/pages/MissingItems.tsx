import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MissingItemCard } from "@/components/MissingItemCard";
import { MissingItemFormComponent } from "@/components/MissingItemForm";
import { MissingItem, MissingItemForm as MissingItemFormType } from "@/types/missing";
import { Product } from "@/types/product";
import { Plus, Search, Download, Filter, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";


interface MissingItemsProps {
  products: Product[];
}

const MissingItems = ({ products }: MissingItemsProps) => {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Auto-detect out of stock items
  useEffect(() => {
    const outOfStockProducts = products.filter(p => p.quantity === 0);
    const existingMissingIds = missingItems.map(m => m.productId).filter(Boolean);
    
    outOfStockProducts.forEach(product => {
      if (!existingMissingIds.includes(product.id)) {
        const newMissingItem: MissingItem = {
          id: `auto-${product.id}-${Date.now()}`,
          productId: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          category: product.category,
          priority: 'medium',
          reason: 'out_of_stock',
          description: 'تم الكشف تلقائياً عند نفاد المخزون',
          supplier: product.supplier,
          estimatedPrice: product.price,
          image: product.image, // Include product image
          detectedAt: new Date(),
          isResolved: false
        };
        
        setMissingItems(prev => [...prev, newMissingItem]);
      }
    });
  }, [products, missingItems]);

  // Filter missing items
  const filteredItems = useMemo(() => {
    let items = missingItems;

    // Filter by tab
    if (activeTab === 'unresolved') {
      items = items.filter(item => !item.isResolved);
    } else if (activeTab === 'resolved') {
      items = items.filter(item => item.isResolved);
    }

    // Filter by search
    if (searchTerm) {
      items = items.filter(item =>
        item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by priority
    if (selectedPriority) {
      items = items.filter(item => item.priority === selectedPriority);
    }

    // Filter by reason
    if (selectedReason) {
      items = items.filter(item => item.reason === selectedReason);
    }

    return items;
  }, [missingItems, searchTerm, selectedPriority, selectedReason, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = missingItems.length;
    const unresolved = missingItems.filter(item => !item.isResolved).length;
    const urgent = missingItems.filter(item => item.priority === 'urgent' && !item.isResolved).length;
    const autoDetected = missingItems.filter(item => item.productId && !item.isResolved).length;

    return { total, unresolved, urgent, autoDetected };
  }, [missingItems]);

  const handleEdit = (item: MissingItem) => {
    // TODO: Open edit form
    toast({
      title: "تعديل الصنف المفقود",
      description: "سيتم تنفيذ هذه الميزة قريباً",
    });
  };

  const handleDelete = (id: string) => {
    setMissingItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "تم حذف الصنف المفقود",
      description: "تم حذف الصنف من قائمة المفقودات",
    });
  };

  const handleResolve = (id: string) => {
    setMissingItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, isResolved: true, resolvedAt: new Date() }
        : item
    ));
    toast({
      title: "تم حل المشكلة",
      description: "تم وضع علامة حل على الصنف المفقود",
    });
  };

  const handleAddMissingItem = (formData: MissingItemFormType) => {
    const newMissingItem: MissingItem = {
      id: `manual-${Date.now()}`,
      productId: undefined,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn,
      category: formData.category,
      priority: formData.priority,
      reason: formData.reason,
      description: formData.description,
      supplier: formData.supplier,
      estimatedPrice: formData.estimatedPrice,
      image: formData.image,
      detectedAt: new Date(),
      isResolved: false
    };

    setMissingItems(prev => [...prev, newMissingItem]);
    toast({
      title: "تم إضافة الصنف المفقود",
      description: "تم إضافة الصنف إلى قائمة المفقودات بنجاح",
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPriority('');
    setSelectedReason('');
  };

  const exportReport = () => {
    const reportData = {
      title: 'تقرير الأصناف المفقودة',
      generatedAt: new Date().toISOString(),
      stats,
      items: filteredItems
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `missing-items-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم تصدير التقرير",
      description: "تم تحميل تقرير الأصناف المفقودة",
    });
  };

  const handlePrint = () => {
    // Check if we have items to print
    if (filteredItems.length === 0) {
      toast({
        title: "لا توجد عناصر للطباعة",
        description: "لا توجد أصناف مفقودة تطابق المرشحات المحددة للطباعة",
        variant: "destructive",
      });
      return;
    }

    // Create print content
    const priorityLabels: Record<string, string> = {
      urgent: "عاجلة",
      high: "عالية", 
      medium: "متوسطة",
      low: "منخفضة"
    };
    const reasonLabels: Record<string, string> = {
      out_of_stock: "نفاد المخزون",
      damaged: "تالف",
      lost: "مفقود",
      other: "أخرى"
    };

    const printHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير الأصناف المفقودة</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            direction: rtl;
            background: white;
            color: black;
            padding: 20px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid black;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .header p {
            font-size: 14px;
            color: #666;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            border: 2px solid black;
            padding: 15px;
            text-align: center;
            background: #f5f5f5;
        }
        .stat-card h3 {
            font-size: 12px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        .stat-card .number {
            font-size: 20px;
            font-weight: bold;
        }
        .items {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .item {
            border: 1px solid black;
            padding: 12px;
            background: white;
            page-break-inside: avoid;
            display: flex;
            gap: 10px;
        }
        .item-image {
            width: 60px;
            height: 60px;
            border: 1px solid black;
            border-radius: 4px;
            object-fit: cover;
            flex-shrink: 0;
        }
        .item-placeholder {
            width: 60px;
            height: 60px;
            border: 1px solid black;
            border-radius: 4px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            flex-shrink: 0;
        }
        .item-content {
            flex: 1;
        }
        .item h3 {
            font-size: 14px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        .priority {
            display: inline-block;
            padding: 3px 8px;
            border: 1px solid black;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .details {
            font-size: 11px;
        }
        .details div {
            margin-bottom: 4px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .stats { grid-template-columns: repeat(2, 1fr); }
            .items { grid-template-columns: 1fr; }
            .item { flex-direction: row; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>تقرير الأصناف المفقودة</h1>
        <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}</p>
        <p>عدد العناصر: ${filteredItems.length}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <h3>إجمالي المفقودات</h3>
            <div class="number">${stats.total}</div>
        </div>
        <div class="stat-card">
            <h3>غير محلولة</h3>
            <div class="number">${stats.unresolved}</div>
        </div>
        <div class="stat-card">
            <h3>عاجلة</h3>
            <div class="number">${stats.urgent}</div>
        </div>
        <div class="stat-card">
            <h3>مكتشفة تلقائياً</h3>
            <div class="number">${stats.autoDetected}</div>
        </div>
    </div>

    <div class="items">
        ${filteredItems.map(item => `
            <div class="item">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.nameAr}" class="item-image" />` :
                    `<div class="item-placeholder">${item.nameAr.charAt(0)}</div>`
                }
                <div class="item-content">
                    <h3>${item.nameAr}</h3>
                    <div class="priority">${priorityLabels[item.priority] || item.priority}</div>
                    <div class="details">
                        <div><strong>السبب:</strong> ${reasonLabels[item.reason] || item.reason}</div>
                        <div><strong>الفئة:</strong> ${item.category}</div>
                        ${item.estimatedPrice ? `<div><strong>السعر المقدر:</strong> ${item.estimatedPrice.toLocaleString('ar-EG')} دج</div>` : ''}
                        ${item.supplier ? `<div><strong>المورد:</strong> ${item.supplier}</div>` : ''}
                        <div><strong>تاريخ الاكتشاف:</strong> ${new Date(item.detectedAt).toLocaleDateString('ar-EG')}</div>
                        ${item.description ? `<div><strong>الوصف:</strong> ${item.description}</div>` : ''}
                        <div><strong>الحالة:</strong> ${item.isResolved ? 'محلولة' : 'غير محلولة'}</div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        window.onload = function() {
            window.print();
            window.onafterprint = function() {
                window.close();
            };
        };
    </script>
</body>
</html>`;

    // Try to open new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      toast({
        title: "جاري الطباعة",
        description: `تم تحضير ${filteredItems.length} عنصر للطباعة`,
      });
    } else {
      // Fallback: Create blob URL and open in new tab
      const blob = new Blob([printHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');
      
      if (newTab) {
        toast({
          title: "جاري الطباعة",
          description: "تم فتح صفحة الطباعة في نافذة جديدة",
        });
      } else {
        toast({
          title: "خطأ في الطباعة",
          description: "يرجى السماح للنوافذ المنبثقة لتفعيل الطباعة",
          variant: "destructive",
        });
      }
      
      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground arabic-text">
              الأصناف المفقودة
            </h1>
            <p className="text-muted-foreground">
              تتبع وإدارة الأصناف المفقودة والنافدة
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={exportReport} variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير التقرير
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 ml-2" />
              إضافة صنف مفقود
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي المفقودات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">غير محلولة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-warning">{stats.unresolved}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">عاجلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-destructive">{stats.urgent}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">مكتشفة تلقائياً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-primary">{stats.autoDetected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الأصناف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="السبب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأسباب</SelectItem>
                  <SelectItem value="out_of_stock">نفاد المخزون</SelectItem>
                  <SelectItem value="damaged">تالف</SelectItem>
                  <SelectItem value="lost">مفقود</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="arabic-text">
              جميع الأصناف
              <Badge variant="secondary" className="mr-2">
                {missingItems.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unresolved" className="arabic-text">
              غير محلولة
              <Badge variant="destructive" className="mr-2">
                {stats.unresolved}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="arabic-text">
              محلولة
              <Badge variant="default" className="mr-2">
                {missingItems.filter(item => item.isResolved).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <MissingItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-16">
                <CardContent className="text-center">
                  <div className="text-lg font-semibold mb-2">لا توجد أصناف مفقودة</div>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedPriority || selectedReason
                      ? "لم يتم العثور على أصناف تطابق البحث"
                      : "لا توجد أصناف مفقودة حالياً"
                    }
                  </p>
                  {(searchTerm || selectedPriority || selectedReason) && (
                    <Button variant="outline" onClick={clearFilters}>
                      مسح الفلاتر
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Missing Item Form */}
        <MissingItemFormComponent
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddMissingItem}
        />
      </div>
    </div>
  );
};

export default MissingItems;
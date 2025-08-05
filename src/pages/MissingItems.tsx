import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MissingItemCard } from "@/components/MissingItemCard";
import { MissingItem, MissingItemForm } from "@/types/missing";
import { Product } from "@/types/product";
import { Plus, Search, Download, Filter, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for missing items
const mockMissingItems: MissingItem[] = [
  {
    id: '1',
    productId: '2',
    nameAr: 'قميص قطني أزرق',
    category: '2',
    priority: 'high',
    reason: 'out_of_stock',
    description: 'نفد المخزون بالكامل، يحتاج إعادة طلب',
    supplier: 'مصنع النسيج الحديث',
    estimatedPrice: 150,
    detectedAt: new Date('2024-01-15'),
    isResolved: false
  },
  {
    id: '2',
    nameAr: 'مكتب خشبي فاخر',
    category: '4',
    priority: 'medium',
    reason: 'damaged',
    description: 'تلف أثناء النقل',
    estimatedPrice: 2000,
    detectedAt: new Date('2024-01-10'),
    isResolved: false
  }
];

interface MissingItemsProps {
  products: Product[];
}

const MissingItems = ({ products }: MissingItemsProps) => {
  const [missingItems, setMissingItems] = useState<MissingItem[]>(mockMissingItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const getProductImage = (item: MissingItem) => {
      const product = products.find(p => p.id === item.productId);
      return product?.image || '';
    };

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير الأصناف المفقودة</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            direction: rtl; 
            text-align: right; 
            padding: 20px; 
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #ccc; 
          }
          .header h1 { 
            font-size: 28px; 
            color: #333; 
            margin-bottom: 10px; 
          }
          .header p { 
            color: #666; 
            font-size: 14px; 
          }
          .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-bottom: 30px; 
          }
          .stat-card { 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            text-align: center; 
          }
          .stat-card h3 { 
            font-size: 12px; 
            color: #666; 
            margin-bottom: 5px; 
          }
          .stat-card .number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #333; 
          }
          .items-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
            gap: 20px; 
          }
          .item-card { 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            padding: 15px; 
            background: #f9f9f9; 
          }
          .item-header { 
            display: flex; 
            align-items: center; 
            gap: 15px; 
            margin-bottom: 15px; 
          }
          .item-image { 
            width: 60px; 
            height: 60px; 
            border-radius: 8px; 
            object-fit: cover; 
            border: 1px solid #ddd; 
          }
          .item-placeholder { 
            width: 60px; 
            height: 60px; 
            border-radius: 8px; 
            background: #e0e0e0; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 20px; 
            color: #666; 
            border: 1px solid #ddd; 
          }
          .item-info h3 { 
            font-size: 16px; 
            color: #333; 
            margin-bottom: 5px; 
          }
          .item-details { 
            font-size: 12px; 
            color: #666; 
          }
          .item-details div { 
            margin-bottom: 5px; 
          }
          .priority { 
            display: inline-block; 
            padding: 3px 8px; 
            border-radius: 4px; 
            font-size: 10px; 
            font-weight: bold; 
          }
          .priority.urgent { background: #fee; color: #c00; }
          .priority.high { background: #fef0e6; color: #d46b08; }
          .priority.medium { background: #f6ffed; color: #52c41a; }
          .priority.low { background: #f0f5ff; color: #1890ff; }
          @media print {
            body { margin: 0; }
            .item-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الأصناف المفقودة</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('en-US')}</p>
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
        
        <div class="items-grid">
          ${filteredItems.map(item => {
            const image = getProductImage(item);
            const priorityLabels: Record<string, string> = {
              urgent: 'عاجلة',
              high: 'عالية', 
              medium: 'متوسطة',
              low: 'منخفضة'
            };
            const reasonLabels: Record<string, string> = {
              out_of_stock: 'نفاد المخزون',
              damaged: 'تالف',
              lost: 'مفقود',
              other: 'أخرى'
            };
            
            return `
              <div class="item-card">
                <div class="item-header">
                  ${image ? 
                    `<img src="${image}" alt="${item.nameAr}" class="item-image" />` :
                    `<div class="item-placeholder">${item.nameAr.charAt(0)}</div>`
                  }
                  <div class="item-info">
                    <h3>${item.nameAr}</h3>
                    <span class="priority ${item.priority}">${priorityLabels[item.priority] || item.priority}</span>
                  </div>
                </div>
                <div class="item-details">
                  <div><strong>السبب:</strong> ${reasonLabels[item.reason] || item.reason}</div>
                  ${item.estimatedPrice ? `<div><strong>السعر المقدر:</strong> ${item.estimatedPrice.toLocaleString('en-US')} DZD</div>` : ''}
                  ${item.supplier ? `<div><strong>المورد:</strong> ${item.supplier}</div>` : ''}
                  <div><strong>تاريخ الاكتشاف:</strong> ${item.detectedAt.toLocaleDateString('en-US')}</div>
                  ${item.description ? `<div><strong>الوصف:</strong> ${item.description}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    toast({
      title: "جاري الطباعة",
      description: "تم فتح نافذة الطباعة",
    });
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
            <Button className="bg-gradient-primary">
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
      </div>
    </div>
  );
};

export default MissingItems;
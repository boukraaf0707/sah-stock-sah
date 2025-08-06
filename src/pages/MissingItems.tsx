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
    // Create a temporary print stylesheet
    const printStyle = document.createElement('style');
    printStyle.id = 'missing-items-print-style';
    printStyle.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        .print-content, .print-content * { visibility: visible; }
        .print-content { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 100%; 
          background: white;
          color: black;
          font-family: Arial, sans-serif;
          direction: rtl;
          text-align: right;
        }
        .no-print { display: none !important; }
        .print-header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid #333; 
        }
        .print-header h1 { 
          font-size: 24px; 
          color: #000; 
          margin-bottom: 10px; 
          font-weight: bold;
        }
        .print-stats { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 15px; 
          margin-bottom: 30px; 
        }
        .print-stat-card { 
          padding: 10px; 
          border: 2px solid #000; 
          text-align: center; 
          background: #f5f5f5;
        }
        .print-stat-card h3 { 
          font-size: 12px; 
          color: #000; 
          margin-bottom: 5px; 
          font-weight: bold;
        }
        .print-stat-card .number { 
          font-size: 18px; 
          font-weight: bold; 
          color: #000; 
        }
        .print-items { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 15px; 
        }
        .print-item { 
          border: 1px solid #000; 
          padding: 10px; 
          background: white; 
          page-break-inside: avoid;
        }
        .print-item h3 { 
          font-size: 14px; 
          color: #000; 
          margin-bottom: 8px; 
          font-weight: bold;
        }
        .print-item-details { 
          font-size: 10px; 
          color: #000; 
          line-height: 1.3;
        }
        .print-item-details div { 
          margin-bottom: 3px; 
        }
        .print-priority { 
          display: inline-block; 
          padding: 2px 6px; 
          border: 1px solid #000; 
          font-size: 8px; 
          font-weight: bold; 
          margin-bottom: 5px;
        }
      }
    `;
    
    // Add the style to head
    document.head.appendChild(printStyle);
    
    // Create print content
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

    const printContent = `
      <div class="print-content" style="display: none;">
        <div class="print-header">
          <h1>تقرير الأصناف المفقودة</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')} - الوقت: ${new Date().toLocaleTimeString('ar-EG')}</p>
        </div>
        
        <div class="print-stats">
          <div class="print-stat-card">
            <h3>إجمالي المفقودات</h3>
            <div class="number">${stats.total}</div>
          </div>
          <div class="print-stat-card">
            <h3>غير محلولة</h3>
            <div class="number">${stats.unresolved}</div>
          </div>
          <div class="print-stat-card">
            <h3>عاجلة</h3>
            <div class="number">${stats.urgent}</div>
          </div>
          <div class="print-stat-card">
            <h3>مكتشفة تلقائياً</h3>
            <div class="number">${stats.autoDetected}</div>
          </div>
        </div>
        
        <div class="print-items">
          ${filteredItems.map(item => `
            <div class="print-item">
              <h3>${item.nameAr}</h3>
              <span class="print-priority">${priorityLabels[item.priority] || item.priority}</span>
              <div class="print-item-details">
                <div><strong>السبب:</strong> ${reasonLabels[item.reason] || item.reason}</div>
                <div><strong>الفئة:</strong> ${item.category}</div>
                ${item.estimatedPrice ? `<div><strong>السعر المقدر:</strong> ${item.estimatedPrice.toLocaleString('ar-EG')} دج</div>` : ''}
                ${item.supplier ? `<div><strong>المورد:</strong> ${item.supplier}</div>` : ''}
                <div><strong>تاريخ الاكتشاف:</strong> ${new Date(item.detectedAt).toLocaleDateString('ar-EG')}</div>
                ${item.description ? `<div><strong>الوصف:</strong> ${item.description}</div>` : ''}
                ${item.isResolved ? `<div><strong>حالة:</strong> محلولة</div>` : '<div><strong>حالة:</strong> غير محلولة</div>'}
              </div>
            </div>
          `).join('')}
        </div>
        
        ${filteredItems.length === 0 ? '<div style="text-align: center; padding: 40px; font-size: 16px;">لا توجد أصناف مفقودة للطباعة</div>' : ''}
      </div>
    `;
    
    // Add print content to body
    const printDiv = document.createElement('div');
    printDiv.innerHTML = printContent;
    document.body.appendChild(printDiv);
    
    // Trigger print
    setTimeout(() => {
      window.print();
      
      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(printDiv);
        const styleElement = document.getElementById('missing-items-print-style');
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
      }, 1000);
    }, 100);
    
    toast({
      title: "جاري الطباعة",
      description: "تم تحضير التقرير للطباعة",
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
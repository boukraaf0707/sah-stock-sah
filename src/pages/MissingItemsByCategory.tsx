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
import { Product, CATEGORIES } from "@/types/product";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MissingItemsByCategoryProps {
  products: Product[];
}

const MissingItemsByCategory = ({ products }: MissingItemsByCategoryProps) => {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]?.nameAr || '');
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
          estimatedPrice: product.buyingPrice,
          image: product.image,
          detectedAt: new Date(),
          isResolved: false
        };
        
        setMissingItems(prev => [...prev, newMissingItem]);
      }
    });
  }, [products, missingItems]);

  // Filter missing items by active category
  const filteredItems = useMemo(() => {
    let items = missingItems.filter(item => item.category === activeCategory);

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
  }, [missingItems, activeCategory, searchTerm, selectedPriority, selectedReason]);

  // Calculate statistics for each category
  const categoryStats = useMemo(() => {
    return CATEGORIES.map(category => {
      const categoryItems = missingItems.filter(item => item.category === category.nameAr);
      return {
        category: category.nameAr,
        total: categoryItems.length,
        unresolved: categoryItems.filter(item => !item.isResolved).length,
        urgent: categoryItems.filter(item => item.priority === 'urgent' && !item.isResolved).length
      };
    });
  }, [missingItems]);

  const handleEdit = (item: MissingItem) => {
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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground arabic-text">
              الأصناف المفقودة حسب الفئة
            </h1>
            <p className="text-muted-foreground">
              تتبع وإدارة الأصناف المفقودة مقسمة حسب فئات المنتجات
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-primary">
            <Plus className="w-4 h-4 ml-2" />
            إضافة صنف مفقود
          </Button>
        </div>

        {/* Category Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map(stat => (
            <Card 
              key={stat.category} 
              className={`cursor-pointer transition-all ${
                activeCategory === stat.category 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setActiveCategory(stat.category)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-right">{stat.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>المجموع:</span>
                  <span className="font-bold">{stat.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>غير محلولة:</span>
                  <span className="font-bold text-warning">{stat.unresolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>عاجلة:</span>
                  <span className="font-bold text-destructive">{stat.urgent}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية - {activeCategory}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الأصناف..."
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
                  <SelectItem value="out_of_stock">نفاد المخزون</SelectItem>
                  <SelectItem value="damaged">تالف</SelectItem>
                  <SelectItem value="lost">مفقود</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                مسح المرشحات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Missing Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <MissingItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResolve={handleResolve}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 text-muted-foreground mx-auto mb-4">📦</div>
            <h3 className="text-lg font-medium mb-2">لا توجد أصناف مفقودة</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedPriority || selectedReason
                ? `لا توجد أصناف مفقودة في فئة "${activeCategory}" تطابق المرشحات المحددة`
                : `لا توجد أصناف مفقودة في فئة "${activeCategory}"`
              }
            </p>
            {(!searchTerm && !selectedPriority && !selectedReason) && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة صنف مفقود
              </Button>
            )}
          </div>
        )}

        <MissingItemFormComponent
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddMissingItem}
        />
      </div>
    </div>
  );
};

export default MissingItemsByCategory;
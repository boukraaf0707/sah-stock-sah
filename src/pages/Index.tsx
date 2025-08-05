import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";
import { SearchBar } from "@/components/SearchBar";
import { StockAlerts } from "@/components/StockAlerts";
import { Product } from "@/types/product";
import { Plus, Package2, TrendingUp, AlertTriangle, BarChart3, Wifi, WifiOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

interface IndexProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const Index = ({ products, onUpdateProducts }: IndexProps) => {
  const isOnline = useOfflineStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nameAr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.minStock || 5)).length;

    return { totalProducts, totalValue, outOfStock, lowStock };
  }, [products]);

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onUpdateProducts([...products, newProduct]);
    toast({
      title: "تم إضافة المنتج بنجاح",
      description: `تم إضافة ${productData.nameAr} إلى المخزون`,
    });
  };

  const handleEditProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProduct) return;
    
    const updatedProducts = products.map(p => 
      p.id === editingProduct.id 
        ? { ...productData, id: p.id, createdAt: p.createdAt, updatedAt: new Date() }
        : p
    );
    onUpdateProducts(updatedProducts);
    setEditingProduct(undefined);
    toast({
      title: "تم تحديث المنتج بنجاح",
      description: `تم تحديث ${productData.nameAr}`,
    });
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    const updatedProducts = products.filter(p => p.id !== id);
    onUpdateProducts(updatedProducts);
    toast({
      title: "تم حذف المنتج",
      description: `تم حذف ${product?.nameAr || 'المنتج'} من المخزون`,
      variant: "destructive",
    });
  };

  const handleRestock = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header with Offline Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground arabic-text">
                نظام إدارة المخزون
              </h1>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-success" />
                ) : (
                  <WifiOff className="w-5 h-5 text-destructive" />
                )}
                <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                  {isOnline ? "متصل" : "غير متصل"}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              إدارة وتتبع منتجاتك بسهولة {!isOnline && "(وضع عدم الاتصال)"}
            </p>
          </div>
          <Button onClick={openAddForm} className="bg-gradient-primary border-0 shadow-medium">
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي المنتجات</CardTitle>
              <Package2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">قيمة المخزون</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">
                {stats.totalValue.toLocaleString('en-US')} DZD
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">منتجات نافدة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-destructive">
                {stats.outOfStock}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">مخزون منخفض</CardTitle>
              <BarChart3 className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-warning">
                {stats.lowStock}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="inventory" className="arabic-text">
              المخزون الحالي
            </TabsTrigger>
            <TabsTrigger value="alerts" className="arabic-text">
              تنبيهات المخزون
              {(stats.outOfStock + stats.lowStock) > 0 && (
                <Badge variant="destructive" className="mr-2 text-xs">
                  {stats.outOfStock + stats.lowStock}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {/* Search and Filters */}
            <SearchBar
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onSearchChange={setSearchTerm}
              onCategoryChange={setSelectedCategory}
              onClearFilters={clearFilters}
            />

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={openEditForm}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-16">
                <CardContent className="text-center">
                  <Package2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory 
                      ? "لم يتم العثور على منتجات تطابق البحث"
                      : "ابدأ بإضافة منتجات إلى مخزونك"
                    }
                  </p>
                  {searchTerm || selectedCategory ? (
                    <Button variant="outline" onClick={clearFilters}>
                      مسح الفلاتر
                    </Button>
                  ) : (
                    <Button onClick={openAddForm} className="bg-gradient-primary">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة منتج جديد
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts">
            <StockAlerts products={products} onRestock={handleRestock} />
          </TabsContent>
        </Tabs>

        {/* Product Form Modal */}
        <ProductForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          product={editingProduct}
          title={editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
        />
      </div>
    </div>
  );
};

export default Index;

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataManager } from "@/components/DataManager";
import { Product } from "@/types/product";
import { MissingItem } from "@/types/missing";
import { Sale } from "@/types/sale";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Calendar,
  DollarSign,
  Database,
  PieChart
} from "lucide-react";

interface ReportsProps {
  products: Product[];
  missingItems: MissingItem[];
  sales: Sale[];
  onImportData: (data: { products?: Product[]; missingItems?: MissingItem[]; sales?: Sale[] }) => void;
}

const Reports = ({ products, missingItems, sales, onImportData }: ReportsProps) => {
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Inventory stats
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.minStock || 5)).length;

    // Sales stats
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const thisMonthSales = sales.filter(sale => sale.createdAt >= thisMonth);
    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const lastMonthSales = sales.filter(sale => 
      sale.createdAt >= lastMonth && sale.createdAt < thisMonth
    );
    const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Missing items stats
    const totalMissingItems = missingItems.length;
    const unresolvedMissing = missingItems.filter(item => !item.isResolved).length;
    const urgentMissing = missingItems.filter(item => 
      item.priority === 'urgent' && !item.isResolved
    ).length;

    // Growth calculations
    const salesGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Category analysis
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, outOfStock: 0 };
      }
      acc[category].count++;
      acc[category].value += product.price * product.quantity;
      if (product.quantity === 0) {
        acc[category].outOfStock++;
      }
      return acc;
    }, {} as Record<string, { count: number; value: number; outOfStock: number }>);

    return {
      inventory: {
        totalProducts,
        totalValue,
        outOfStock,
        lowStock,
        categoryStats
      },
      sales: {
        totalSales,
        totalRevenue,
        thisMonthSales: thisMonthSales.length,
        thisMonthRevenue,
        lastMonthRevenue,
        salesGrowth
      },
      missing: {
        totalMissingItems,
        unresolvedMissing,
        urgentMissing
      }
    };
  }, [products, sales, missingItems]);

  const getSalesGrowthColor = (growth: number) => {
    if (growth > 0) return "text-success";
    if (growth < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground arabic-text">
              التقارير والتحليلات
            </h1>
            <p className="text-muted-foreground">
              نظرة شاملة على أداء المخزون والمبيعات
            </p>
          </div>
          <Button 
            onClick={() => setIsDataManagerOpen(true)}
            className="bg-gradient-primary"
          >
            <Database className="w-4 h-4 ml-2" />
            إدارة البيانات
          </Button>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.inventory.totalProducts}</div>
              <p className="text-xs text-muted-foreground text-right">
                قيمة: {stats.inventory.totalValue.toLocaleString('ar-SA')} ر.س
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي المبيعات</CardTitle>
              <ShoppingCart className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.sales.totalSales}</div>
              <p className="text-xs text-muted-foreground text-right">
                إيرادات: {stats.sales.totalRevenue.toLocaleString('ar-SA')} ر.س
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">تنبيهات المخزون</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-warning">
                {stats.inventory.outOfStock + stats.inventory.lowStock}
              </div>
              <p className="text-xs text-muted-foreground text-right">
                نافدة: {stats.inventory.outOfStock} | منخفضة: {stats.inventory.lowStock}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">الأصناف المفقودة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right text-destructive">
                {stats.missing.unresolvedMissing}
              </div>
              <p className="text-xs text-muted-foreground text-right">
                عاجلة: {stats.missing.urgentMissing}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              أداء المبيعات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.sales.thisMonthSales}
                </div>
                <div className="text-sm text-muted-foreground">مبيعات هذا الشهر</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.sales.thisMonthRevenue.toLocaleString('ar-SA')} ر.س
                </div>
                <div className="text-sm text-muted-foreground">إيرادات هذا الشهر</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getSalesGrowthColor(stats.sales.salesGrowth)}`}>
                  {stats.sales.salesGrowth > 0 ? '+' : ''}{stats.sales.salesGrowth.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">نمو الإيرادات</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              تحليل الفئات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.inventory.categoryStats).map(([categoryId, data]) => {
                const categoryName = categoryId === '1' ? 'إلكترونيات' :
                                   categoryId === '2' ? 'ملابس' :
                                   categoryId === '3' ? 'طعام ومشروبات' :
                                   categoryId === '4' ? 'أدوات منزلية' :
                                   categoryId === '5' ? 'كتب وقرطاسية' :
                                   categoryId === '6' ? 'صحة وجمال' : 'أخرى';

                return (
                  <div key={categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="text-right">
                      <div className="font-medium">{categoryName}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.count} منتج • {data.value.toLocaleString('ar-SA')} ر.س
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {data.outOfStock > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          نافدة: {data.outOfStock}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {data.count} منتج
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                تقرير شهري
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                تحليل الأداء
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                تقرير المبيعات
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setIsDataManagerOpen(true)}
              >
                <Database className="w-4 h-4" />
                إدارة البيانات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Manager Dialog */}
        <DataManager
          isOpen={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          products={products}
          missingItems={missingItems}
          sales={sales}
          onImportData={onImportData}
        />
      </div>
    </div>
  );
};

export default Reports;
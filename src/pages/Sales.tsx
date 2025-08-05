import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SalesForm } from "@/components/SalesForm";
import { Product } from "@/types/product";
import { Sale, SaleForm, PAYMENT_METHOD_LABELS } from "@/types/sale";
import { Plus, Search, TrendingUp, ShoppingCart, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock sales data
const mockSales: Sale[] = [
  {
    id: '1',
    items: [
      {
        productId: '1',
        productName: 'هاتف ذكي سامسونج غالكسي',
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500
      }
    ],
    totalAmount: 2500,
    customerName: 'أحمد محمد',
    customerPhone: '0501234567',
    paymentMethod: 'card',
    notes: 'عميل مميز',
    createdAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    items: [
      {
        productId: '3',
        productName: 'قهوة عربية فاخرة',
        quantity: 2,
        unitPrice: 85,
        totalPrice: 170
      }
    ],
    totalAmount: 170,
    paymentMethod: 'cash',
    createdAt: new Date('2024-01-15T14:20:00')
  }
];

interface SalesProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const Sales = ({ products, onUpdateProducts }: SalesProps) => {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter sales
  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    
    return sales.filter(sale =>
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone?.includes(searchTerm) ||
      sale.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sales, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const todaySales = sales.filter(sale => sale.createdAt >= todayStart).length;
    const todayRevenue = sales
      .filter(sale => sale.createdAt >= todayStart)
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    return { totalSales, totalRevenue, todaySales, todayRevenue };
  }, [sales]);

  const handleCreateSale = (saleData: SaleForm) => {
    // Create new sale
    const newSale: Sale = {
      id: Date.now().toString(),
      ...saleData,
      totalAmount: saleData.items.reduce((sum, item) => sum + item.totalPrice, 0),
      createdAt: new Date()
    };

    // Update product quantities
    const updatedProducts = products.map(product => {
      const saleItem = saleData.items.find(item => item.productId === product.id);
      if (saleItem) {
        return {
          ...product,
          quantity: Math.max(0, product.quantity - saleItem.quantity),
          updatedAt: new Date()
        };
      }
      return product;
    });

    setSales(prev => [newSale, ...prev]);
    onUpdateProducts(updatedProducts);

    toast({
      title: "تم إنشاء عملية البيع بنجاح",
      description: `إجمالي المبلغ: ${newSale.totalAmount.toLocaleString('en-US')} DZD`,
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground arabic-text">
              إدارة المبيعات
            </h1>
            <p className="text-muted-foreground">
              تسجيل ومتابعة عمليات البيع والإيرادات
            </p>
          </div>
          <Button 
            onClick={() => setIsSalesFormOpen(true)} 
            className="bg-gradient-primary"
          >
            <Plus className="w-4 h-4 ml-2" />
            عملية بيع جديدة
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي المبيعات</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.totalSales}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">
                {stats.totalRevenue.toLocaleString('en-US')} DZD
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">مبيعات اليوم</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.todaySales}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إيرادات اليوم</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">
                {stats.todayRevenue.toLocaleString('en-US')} DZD
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Sale Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              بيع سريع
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {/* Quick Action Buttons */}
               <Button 
                 onClick={() => setIsSalesFormOpen(true)}
                 className="w-full"
               >
                 <Plus className="w-4 h-4 ml-1" />
                 بيع جديد
               </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سجل المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length > 0 ? (
              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <Card key={sale.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-right">
                          <div className="font-semibold">
                            عملية بيع #{sale.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {sale.createdAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold">
                            {sale.totalAmount.toLocaleString('en-US')} DZD
                          </div>
                          <Badge variant="default">
                            {PAYMENT_METHOD_LABELS[sale.paymentMethod]}
                          </Badge>
                        </div>
                      </div>

                      {sale.customerName && (
                        <div className="text-sm text-muted-foreground mb-2">
                          العميل: {sale.customerName}
                          {sale.customerPhone && ` - ${sale.customerPhone}`}
                        </div>
                      )}

                      <div className="space-y-1">
                        {sale.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName}</span>
                            <span>
                              {item.quantity} × {item.unitPrice.toLocaleString('en-US')} = {item.totalPrice.toLocaleString('en-US')} DZD
                            </span>
                          </div>
                        ))}
                      </div>

                      {sale.notes && (
                        <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                          ملاحظات: {sale.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مبيعات</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "لم يتم العثور على مبيعات تطابق البحث"
                    : "لم يتم تسجيل أي مبيعات بعد"
                  }
                </p>
                <Button onClick={() => setIsSalesFormOpen(true)} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 ml-2" />
                  عملية بيع جديدة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Form */}
        <SalesForm
          isOpen={isSalesFormOpen}
          onClose={() => setIsSalesFormOpen(false)}
          onSubmit={handleCreateSale}
          products={products}
        />
      </div>
    </div>
  );
};

export default Sales;
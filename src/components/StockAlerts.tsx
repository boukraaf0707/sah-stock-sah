import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, CATEGORIES } from "@/types/product";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockAlertsProps {
  products: Product[];
  onRestock: (product: Product) => void;
}

export function StockAlerts({ products, onRestock }: StockAlertsProps) {
  const outOfStock = products.filter(p => p.quantity === 0);
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.minStock || 5));

  return (
    <div className="space-y-4" dir="rtl">
      {/* Out of Stock */}
      {outOfStock.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-destructive text-right">
              <AlertTriangle className="w-5 h-5 ml-2" />
              المنتجات النافدة ({outOfStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {outOfStock.map((product) => {
              const category = CATEGORIES.find(c => c.id === product.category);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium arabic-text">{product.nameAr}</p>
                      <p className="text-sm text-muted-foreground">{category?.nameAr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">نفد</Badge>
                    <Button
                      size="sm"
                      onClick={() => onRestock(product)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <RefreshCw className="w-3 h-3 ml-1" />
                      إعادة تخزين
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-warning text-right">
              <AlertTriangle className="w-5 h-5 ml-2" />
              المنتجات بمخزون منخفض ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.map((product) => {
              const category = CATEGORIES.find(c => c.id === product.category);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium arabic-text">{product.nameAr}</p>
                      <p className="text-sm text-muted-foreground">{category?.nameAr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {product.quantity} متبقي
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRestock(product)}
                      className="border-warning/30 text-warning hover:bg-warning/10"
                    >
                      <RefreshCw className="w-3 h-3 ml-1" />
                      إعادة تخزين
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {outOfStock.length === 0 && lowStock.length === 0 && (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-semibold text-success mb-1">جميع المنتجات متوفرة!</h3>
            <p className="text-sm text-muted-foreground">لا توجد منتجات تحتاج إلى إعادة تخزين حاليًا</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
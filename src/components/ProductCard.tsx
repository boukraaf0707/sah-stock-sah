import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, CATEGORIES } from "@/types/product";
import { Edit, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  dir?: "rtl" | "ltr";
}

export function ProductCard({ product, onEdit, onDelete, dir = "rtl" }: ProductCardProps) {
  const category = CATEGORIES.find(c => c.id === product.category);
  const isLowStock = product.quantity <= (product.minStock || 5);
  const isOutOfStock = product.quantity === 0;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-medium animate-fade-in",
      "bg-gradient-card border-border/50",
      dir === "rtl" && "text-right"
    )} dir={dir}>
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative mb-3 bg-muted rounded-lg overflow-hidden h-32 flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-muted-foreground" />
          )}
          
          {/* Stock Status Badge */}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              نفد المخزون
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge variant="outline" className="absolute top-2 left-2 bg-warning text-warning-foreground">
              مخزون منخفض
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm arabic-text line-clamp-1">
            {product.nameAr}
          </h3>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                category?.color === 'blue' && "bg-blue-100 text-blue-800",
                category?.color === 'purple' && "bg-purple-100 text-purple-800",
                category?.color === 'green' && "bg-green-100 text-green-800",
                category?.color === 'orange' && "bg-orange-100 text-orange-800",
                category?.color === 'indigo' && "bg-indigo-100 text-indigo-800",
                category?.color === 'pink' && "bg-pink-100 text-pink-800"
              )}
            >
              {category?.nameAr || product.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              الكمية: {product.quantity}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-primary text-lg">
              {product.price.toLocaleString('ar-SA')} ر.س
            </span>
            {product.supplier && (
              <span className="text-xs text-muted-foreground">
                {product.supplier}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1 h-8"
          >
            <Edit className="w-3 h-3 ml-1" />
            تعديل
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="flex-1 h-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="w-3 h-3 ml-1" />
            حذف
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
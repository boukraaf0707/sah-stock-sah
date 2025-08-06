import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, CATEGORIES } from "@/types/product";
import { Upload, X } from "lucide-react";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product?: Product;
  title: string;
}

export function ProductForm({ isOpen, onClose, onSubmit, product, title }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nameAr: product?.nameAr || '',
    category: product?.category || '',
    quantity: product?.quantity || 0,
    buyingPrice: product?.buyingPrice || 0,
    sellingPrice: product?.sellingPrice || product?.price || 0,
    supplier: product?.supplier || '',
    image: product?.image || '',
    minStock: product?.minStock || 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include both prices and keep price field for backward compatibility
    onSubmit({ ...formData, price: formData.sellingPrice });
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] arabic-text" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="nameAr" className="text-right block mb-2">
              اسم المنتج (عربي) *
            </Label>
            <Input
              id="nameAr"
              required
              value={formData.nameAr}
              onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-right block mb-2">
              الفئة *
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-right block mb-2">
                الكمية *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="text-right ltr-content"
              />
            </div>
            <div>
              <Label htmlFor="buyingPrice" className="text-right block mb-2">
                سعر الشراء (من المورد) *
              </Label>
              <Input
                id="buyingPrice"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.buyingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, buyingPrice: parseFloat(e.target.value) || 0 }))}
                className="text-right ltr-content"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <Label htmlFor="sellingPrice" className="text-right block mb-2">
              سعر البيع (للعميل) *
            </Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
              className="text-right ltr-content"
            />
          </div>

          {/* Min Stock */}
          <div>
            <Label htmlFor="minStock" className="text-right block mb-2">
              الحد الأدنى للمخزون
            </Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              value={formData.minStock}
              onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 5 }))}
              className="text-right ltr-content"
            />
          </div>

          {/* Supplier */}
          <div>
            <Label htmlFor="supplier" className="text-right block mb-2">
              المورد (اختياري)
            </Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-right block mb-2">
              صورة المنتج (اختياري)
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Product preview" 
                    className="mx-auto max-h-32 rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="mt-2"
                  >
                    <X className="w-4 h-4 ml-1" />
                    إزالة الصورة
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <Label htmlFor="image-upload" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    انقر لتحميل صورة المنتج
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {product ? 'تحديث المنتج' : 'إضافة المنتج'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
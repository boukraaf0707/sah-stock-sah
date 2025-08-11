import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2 } from "lucide-react";
import { AbdullahForm as AbdullahFormType, AbdullahItem } from "@/types/abdullah";
import { Product } from "@/types/product";
import { toast } from "@/hooks/use-toast";

interface AbdullahFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AbdullahFormType) => void;
  products: Product[];
}

export const AbdullahForm = ({ isOpen, onClose, onSubmit, products }: AbdullahFormProps) => {
  const [items, setItems] = useState<AbdullahItem[]>([]);
  const [notes, setNotes] = useState("");
  const [person, setPerson] = useState<'abdullah' | 'bokrae'>("abdullah");

  const handleAddItem = () => {
    setItems(prev => [...prev, {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof AbdullahItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.productName = product.nameAr;
            updatedItem.unitPrice = product.sellingPrice;
            updatedItem.totalPrice = updatedItem.quantity * product.sellingPrice;
          }
        } else if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة عنصر واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    const validItems = items.filter(item => (item.productId || item.productName.trim()) && item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منتجات أو كتابة أسمائها وكميات أكبر من صفر",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      person,
      items: validItems,
      notes: notes.trim() || undefined
    });

    // Reset form
    setItems([]);
    setNotes("");
    onClose();
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل ما أخذ بوكراع وعبد الله</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Person Selector */}
          <div className="space-y-2">
            <Label>من أخذ؟</Label>
            <Select value={person} onValueChange={(value: any) => setPerson(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abdullah">عبد الله</SelectItem>
                <SelectItem value="bokrae">بوكراع</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">المنتجات</Label>
              <Button type="button" onClick={handleAddItem} size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>المنتج</Label>
                      <div className="space-y-2">
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, 'productId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر من القائمة" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.nameAr} - {product.sellingPrice.toLocaleString('en-US')} دج
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-center text-xs text-muted-foreground">أو</div>
                        <Input
                          placeholder="اكتب اسم المنتج يدوياً"
                          value={item.productId ? "" : item.productName}
                          onChange={(e) => {
                            handleItemChange(index, 'productId', '');
                            handleItemChange(index, 'productName', e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="الكمية"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>سعر الوحدة</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="سعر الوحدة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>المجموع</Label>
                      <div className="p-2 bg-muted rounded-md text-center font-semibold">
                        {item.totalPrice.toLocaleString('en-US')} دج
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد منتجات. اضغط على "إضافة منتج" لبدء إضافة المنتجات.
              </div>
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-lg font-semibold">المجموع الكلي:</span>
              <span className="text-xl font-bold text-primary">
                {getTotalAmount().toLocaleString('en-US')} دج
              </span>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل أي ملاحظات إضافية..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              تسجيل
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { DebtForm as DebtFormType, DebtItem } from "@/types/debt";
import { Plus, Minus, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DebtFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (debtData: DebtFormType) => void;
  products: Product[];
}

export const DebtForm = ({ isOpen, onClose, onSubmit, products }: DebtFormProps) => {
  const [formData, setFormData] = useState<DebtFormType>({
    clientName: '',
    clientPhone: '',
    items: [],
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter available products (only in stock)
  const availableProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && 
      p.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [formData.items]);

  const addItem = (product: Product) => {
    const existingItem = formData.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast({
          title: "تحذير",
          description: "الكمية المطلوبة أكبر من المتوفر في المخزون",
          variant: "destructive"
        });
        return;
      }
      updateItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: DebtItem = {
        productId: product.id,
        productName: product.nameAr,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
    setSearchTerm('');
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.quantity) {
      toast({
        title: "تحذير",
        description: "الكمية المطلوبة أكبر من المتوفر في المخزون",
        variant: "destructive"
      });
      return;
    }

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      )
    }));
  };

  const removeItem = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم العميل",
        variant: "destructive"
      });
      return;
    }

    if (formData.items.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب إضافة منتج واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    setFormData({
      clientName: '',
      clientPhone: '',
      items: [],
      notes: ''
    });
    setSearchTerm('');
    onClose();
  };

  const handleClose = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      items: [],
      notes: ''
    });
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة دين جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">اسم العميل *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="اسم العميل"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="clientPhone">رقم الهاتف (اختياري)</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="رقم الهاتف"
              />
            </div>
          </div>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">البحث عن المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              {searchTerm && (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {availableProducts.map(product => (
                    <Button
                      key={product.id}
                      type="button"
                      variant="ghost"
                      className="w-full h-auto p-3 justify-start text-right"
                      onClick={() => addItem(product)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 text-right">
                          <div className="font-medium">{product.nameAr}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.price.toLocaleString('en-US')} DZD - متوفر: {product.quantity}
                          </div>
                        </div>
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.nameAr}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground text-center">
                              {product.nameAr.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                  {availableProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-2">
                      لا توجد منتجات متطابقة
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debt Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المنتجات المحددة</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  لم يتم تحديد أي منتجات بعد
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1 text-right">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.unitPrice.toLocaleString('en-US')} DZD × {item.quantity} = {item.totalPrice.toLocaleString('en-US')} DZD
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2 mt-4">
                    <div className="text-lg font-bold text-right">
                      إجمالي المبلغ: {totalAmount.toLocaleString('en-US')} DZD
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="ملاحظات إضافية..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={formData.items.length === 0 || !formData.clientName.trim()}>
              تسجيل الدين ({totalAmount.toLocaleString('en-US')} DZD)
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
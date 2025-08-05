import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MissingItemForm, PRIORITY_LABELS, REASON_LABELS } from "@/types/missing";
import { CATEGORIES } from "@/types/product";
import { toast } from "@/hooks/use-toast";

interface MissingItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MissingItemForm) => void;
  title?: string;
}

export const MissingItemFormComponent = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "إضافة صنف مفقود"
}: MissingItemFormProps) => {
  const [formData, setFormData] = useState<MissingItemForm>({
    nameAr: '',
    nameEn: '',
    category: '',
    priority: 'medium',
    reason: 'other',
    description: '',
    image: '',
    supplier: '',
    estimatedPrice: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameAr.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم الصنف",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "خطأ",
        description: "يجب اختيار الفئة",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nameAr: '',
      nameEn: '',
      category: '',
      priority: 'medium',
      reason: 'other',
      description: '',
      image: '',
      supplier: '',
      estimatedPrice: undefined
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nameAr">اسم الصنف (عربي) *</Label>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                placeholder="اسم الصنف باللغة العربية"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="nameEn">اسم الصنف (إنجليزي)</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="اسم الصنف باللغة الإنجليزية"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">الفئة *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
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

            <div>
              <Label htmlFor="priority">الأولوية</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reason">السبب</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REASON_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedPrice">السعر المتوقع (ر.س)</Label>
              <Input
                id="estimatedPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedPrice || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimatedPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplier">المورد</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="اسم المورد"
            />
          </div>

          <div>
            <Label htmlFor="image">رابط الصورة</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف تفصيلي عن سبب فقدان الصنف..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              حفظ الصنف المفقود
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
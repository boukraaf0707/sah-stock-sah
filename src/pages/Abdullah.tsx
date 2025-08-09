import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Receipt, Package } from "lucide-react";
import { Abdullah as AbdullahType, AbdullahForm as AbdullahFormType } from "@/types/abdullah";
import { Product } from "@/types/product";
import { AbdullahForm } from "@/components/AbdullahForm";
import { AbdullahPaymentDialog } from "@/components/AbdullahPaymentDialog";
import { toast } from "@/hooks/use-toast";

interface AbdullahProps {
  products: Product[];
}

export const Abdullah = ({ products }: AbdullahProps) => {
  const [abdullahs, setAbdullahs] = useState<AbdullahType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedAbdullah, setSelectedAbdullah] = useState<AbdullahType | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAbdullahs = localStorage.getItem('abdullahs');
    if (savedAbdullahs) {
      const parsedAbdullahs = JSON.parse(savedAbdullahs).map((abdullah: any) => ({
        ...abdullah,
        createdAt: new Date(abdullah.createdAt),
        updatedAt: new Date(abdullah.updatedAt)
      }));
      setAbdullahs(parsedAbdullahs);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('abdullahs', JSON.stringify(abdullahs));
  }, [abdullahs]);

  const filteredAbdullahs = abdullahs.filter(abdullah =>
    !abdullah.isPaid
  );

  const stats = {
    totalRecords: abdullahs.filter(a => !a.isPaid).length,
    totalAmount: abdullahs.filter(a => !a.isPaid).reduce((sum, abdullah) => sum + abdullah.remainingAmount, 0),
    totalItems: abdullahs.filter(a => !a.isPaid).reduce((sum, abdullah) => sum + abdullah.items.length, 0)
  };

  const handleAddRecord = (formData: AbdullahFormType) => {
    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate balance based on all previous entries
    const totalPreviousBalance = abdullahs.reduce((sum, entry) => {
      return sum + entry.remainingAmount;
    }, 0);
    
    const newBalance = totalPreviousBalance + totalAmount;
    let balanceType: 'abdullah_owes' | 'bokrae_owes' | 'balanced' = 'balanced';
    
    if (newBalance > 0) {
      balanceType = 'abdullah_owes';
    } else if (newBalance < 0) {
      balanceType = 'bokrae_owes';
    }
    
    const newAbdullah: AbdullahType = {
      id: Date.now().toString(),
      items: formData.items,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPaid: false,
      notes: formData.notes,
      balanceType
    };

    setAbdullahs(prev => [newAbdullah, ...prev]);
    
    toast({
      title: "تم تسجيل السجل بنجاح",
      description: `تم تسجيل سجل بقيمة ${totalAmount.toLocaleString('en-US')} دج لبوكراع وعبد الله`
    });
  };

  const handlePayment = (abdullahId: string, paymentAmount: number, notes?: string) => {
    setAbdullahs(prev => prev.map(abdullah => {
      if (abdullah.id === abdullahId) {
        const newPaidAmount = abdullah.paidAmount + paymentAmount;
        const newRemainingAmount = abdullah.totalAmount - newPaidAmount;
        const isPaid = newRemainingAmount <= 0;

        return {
          ...abdullah,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          isPaid,
          updatedAt: new Date(),
          notes: notes ? `${abdullah.notes || ''}\nدفعة: ${paymentAmount} دج - ${notes}` : abdullah.notes
        };
      }
      return abdullah;
    }));

    toast({
      title: "تم تسجيل الدفعة بنجاح",
      description: `تم تسجيل دفعة بقيمة ${paymentAmount.toLocaleString('en-US')} دج من عبد الله`
    });
  };

  const openPaymentDialog = (abdullah: AbdullahType) => {
    setSelectedAbdullah(abdullah);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">ما أخذ بوكراع وعبد الله</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة ما أخذه بوكراع وعبد الله من المنتجات والحسابات المتبادلة
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" />
          تسجيل ما أخذ بوكراع وعبد الله
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Receipt className="h-8 w-8 text-blue-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-muted-foreground">إجمالي السجلات</p>
              <p className="text-2xl font-bold">{stats.totalRecords}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-muted-foreground">إجمالي المبلغ المستحق</p>
              <p className="text-2xl font-bold">{Math.abs(stats.totalAmount).toLocaleString('en-US')} دج</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-muted-foreground">عدد المنتجات</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">حالة الحساب</p>
              <div className={`text-lg font-bold text-center ${
                stats.totalAmount > 0 ? 'text-destructive' : stats.totalAmount < 0 ? 'text-green-600' : 'text-muted-foreground'
              }`}>
                {stats.totalAmount > 0 
                  ? `عبد الله يدين ${Math.abs(stats.totalAmount).toLocaleString('en-US')} دج`
                  : stats.totalAmount < 0 
                  ? `بوكراع يدين ${Math.abs(stats.totalAmount).toLocaleString('en-US')} دج`
                  : 'متوازن'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAbdullahs.map(abdullah => (
          <Card key={abdullah.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">عبد الله</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {abdullah.createdAt.toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <Badge variant={abdullah.isPaid ? "default" : "destructive"}>
                  {abdullah.isPaid ? "مسدد" : "غير مسدد"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">إجمالي المبلغ:</span>
                  <span>{abdullah.totalAmount.toLocaleString('en-US')} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">المبلغ المسدد:</span>
                  <span className="text-green-600">{abdullah.paidAmount.toLocaleString('en-US')} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">المبلغ المتبقي:</span>
                  <span className="text-red-600 font-bold">{abdullah.remainingAmount.toLocaleString('en-US')} دج</span>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">المنتجات:</p>
                  <div className="space-y-1">
                    {abdullah.items.map((item, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {item.productName} × {item.quantity} = {item.totalPrice.toLocaleString('en-US')} دج
                      </div>
                    ))}
                  </div>
                </div>

                {!abdullah.isPaid && (
                  <Button
                    onClick={() => openPaymentDialog(abdullah)}
                    className="w-full"
                    variant="outline"
                  >
                    تسجيل دفعة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAbdullahs.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">لا توجد سجلات</h3>
          <p className="text-muted-foreground mb-4">
            لم يتم تسجيل أي سجلات لعبد الله بعد
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة أول سجل
          </Button>
        </div>
      )}

      <AbdullahForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddRecord}
        products={products}
      />

      {selectedAbdullah && (
        <AbdullahPaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedAbdullah(null);
          }}
          abdullah={selectedAbdullah}
          onPayment={(amount, notes) => handlePayment(selectedAbdullah.id, amount, notes)}
        />
      )}
    </div>
  );
};
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Users, Receipt } from "lucide-react";
import { Debt, DebtForm } from "@/types/debt";
import { Product } from "@/types/product";
import { DebtForm as DebtFormComponent } from "@/components/DebtForm";
import { PaymentDialog } from "@/components/PaymentDialog";
import { toast } from "@/hooks/use-toast";

interface DebtsProps {
  products: Product[];
}

export const Debts = ({ products }: DebtsProps) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDebtFormOpen, setIsDebtFormOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // Load debts from localStorage on mount
  useEffect(() => {
    const savedDebts = localStorage.getItem('debts');
    if (savedDebts) {
      const parsedDebts = JSON.parse(savedDebts).map((debt: any) => ({
        ...debt,
        createdAt: new Date(debt.createdAt),
        updatedAt: new Date(debt.updatedAt)
      }));
      setDebts(parsedDebts);
    }
  }, []);

  // Save debts to localStorage whenever debts change
  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);

  const filteredDebts = debts.filter(debt =>
    debt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !debt.isPaid
  );

  const stats = {
    totalDebts: debts.filter(d => !d.isPaid).length,
    totalAmount: debts.filter(d => !d.isPaid).reduce((sum, debt) => sum + debt.remainingAmount, 0),
    totalClients: new Set(debts.filter(d => !d.isPaid).map(d => d.clientName)).size
  };

  const handleAddDebt = (debtData: DebtForm) => {
    const totalAmount = debtData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const newDebt: Debt = {
      id: Date.now().toString(),
      clientName: debtData.clientName,
      clientPhone: debtData.clientPhone,
      items: debtData.items,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPaid: false,
      notes: debtData.notes
    };

    setDebts(prev => [newDebt, ...prev]);
    
    toast({
      title: "تم إضافة الدين بنجاح",
      description: `تم تسجيل دين بقيمة ${totalAmount.toLocaleString('ar-EG')} دج لـ ${debtData.clientName}`
    });
  };

  const handlePayment = (debtId: string, paymentAmount: number, notes?: string) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id === debtId) {
        const newPaidAmount = debt.paidAmount + paymentAmount;
        const newRemainingAmount = debt.totalAmount - newPaidAmount;
        const isPaid = newRemainingAmount <= 0;

        return {
          ...debt,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          isPaid,
          updatedAt: new Date(),
          notes: notes ? `${debt.notes || ''}\nدفعة: ${paymentAmount} دج - ${notes}` : debt.notes
        };
      }
      return debt;
    }));

    toast({
      title: "تم تسجيل الدفعة بنجاح",
      description: `تم تسجيل دفعة بقيمة ${paymentAmount.toLocaleString('ar-EG')} دج`
    });
  };

  const openPaymentDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة الديون</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة ديون العملاء والمدفوعات
          </p>
        </div>
        <Button onClick={() => setIsDebtFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" />
          إضافة دين جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Receipt className="h-8 w-8 text-blue-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-muted-foreground">إجمالي الديون</p>
              <p className="text-2xl font-bold">{stats.totalDebts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-muted-foreground">إجمالي المبلغ المستحق</p>
              <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString('ar-EG')} دج</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="mr-4">
              <p className="text-sm font-medium text-muted-foreground">عدد العملاء</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن العملاء..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDebts.map(debt => (
          <Card key={debt.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{debt.clientName}</CardTitle>
                  {debt.clientPhone && (
                    <p className="text-sm text-muted-foreground">{debt.clientPhone}</p>
                  )}
                </div>
                <Badge variant={debt.isPaid ? "default" : "destructive"}>
                  {debt.isPaid ? "مسدد" : "غير مسدد"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">إجمالي المبلغ:</span>
                  <span>{debt.totalAmount.toLocaleString('ar-EG')} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">المبلغ المسدد:</span>
                  <span className="text-green-600">{debt.paidAmount.toLocaleString('ar-EG')} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">المبلغ المتبقي:</span>
                  <span className="text-red-600 font-bold">{debt.remainingAmount.toLocaleString('ar-EG')} دج</span>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">المنتجات:</p>
                  <div className="space-y-1">
                    {debt.items.map((item, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {item.productName} × {item.quantity} = {item.totalPrice.toLocaleString('ar-EG')} دج
                      </div>
                    ))}
                  </div>
                </div>

                {!debt.isPaid && (
                  <Button
                    onClick={() => openPaymentDialog(debt)}
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

      {filteredDebts.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">لا توجد ديون</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "لا توجد ديون تطابق البحث" : "لم يتم تسجيل أي ديون بعد"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDebtFormOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول دين
            </Button>
          )}
        </div>
      )}

      <DebtFormComponent
        isOpen={isDebtFormOpen}
        onClose={() => setIsDebtFormOpen(false)}
        onSubmit={handleAddDebt}
        products={products}
      />

      {selectedDebt && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedDebt(null);
          }}
          debt={selectedDebt}
          onPayment={(amount, notes) => handlePayment(selectedDebt.id, amount, notes)}
        />
      )}
    </div>
  );
};
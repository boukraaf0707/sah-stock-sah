import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Debt } from "@/types/debt";
import { toast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
  onPayment: (amount: number, notes?: string) => void;
}

export const PaymentDialog = ({ isOpen, onClose, debt, onPayment }: PaymentDialogProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        title: "خطأ",
        description: "يجب إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }

    if (paymentAmount > debt.remainingAmount) {
      toast({
        title: "تحذير",
        description: "المبلغ المدخل أكبر من المبلغ المتبقي",
        variant: "destructive"
      });
      return;
    }

    onPayment(paymentAmount, notes);
    setAmount("");
    setNotes("");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    setNotes("");
    onClose();
  };

  const handlePayFull = () => {
    setAmount(debt.remainingAmount.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل دفعة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">{debt.clientName}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>إجمالي المبلغ:</span>
                <span>{debt.totalAmount.toLocaleString('ar-EG')} دج</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المسدد:</span>
                <span className="text-green-600">{debt.paidAmount.toLocaleString('ar-EG')} دج</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>المبلغ المتبقي:</span>
                <span className="text-red-600">{debt.remainingAmount.toLocaleString('ar-EG')} دج</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="amount">مبلغ الدفعة *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePayFull}
                >
                  سداد كامل
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={debt.remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مبلغ الدفعة"
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">ملاحظات (اختياري)</Label>
              <Textarea
                id="paymentNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات حول الدفعة..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={!amount || parseFloat(amount) <= 0}>
                تسجيل الدفعة
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
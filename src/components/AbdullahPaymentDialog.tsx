import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Abdullah } from "@/types/abdullah";
import { toast } from "@/hooks/use-toast";

interface AbdullahPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  abdullah: Abdullah;
  onPayment: (amount: number, notes?: string) => void;
}

export const AbdullahPaymentDialog = ({ isOpen, onClose, abdullah, onPayment }: AbdullahPaymentDialogProps) => {
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const personLabel = abdullah.person === 'bokrae' ? 'بوكراع' : 'عبد الله';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }

    if (paymentAmount > abdullah.remainingAmount) {
      toast({
        title: "خطأ",
        description: "لا يمكن أن يكون المبلغ أكبر من المبلغ المتبقي",
        variant: "destructive"
      });
      return;
    }

    onPayment(paymentAmount, notes.trim() || undefined);
    
    // Reset form
    setAmount("");
    setNotes("");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة من {personLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Abdullah Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">مبلغ الدفعة *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                max={abdullah.remainingAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل مبلغ الدفعة"
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount((abdullah.remainingAmount / 2).toString())}
              >
                نصف المبلغ ({(abdullah.remainingAmount / 2).toLocaleString('en-US')} دج)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(abdullah.remainingAmount.toString())}
              >
                كامل المبلغ ({abdullah.remainingAmount.toLocaleString('en-US')} دج)
              </Button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="payment-notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="payment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات للدفعة..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button type="submit">
                تسجيل الدفعة
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
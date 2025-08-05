import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MissingItem } from "@/types/missing";
import { PRIORITY_LABELS, REASON_LABELS } from "@/types/missing";
import { CheckCircle, Edit, Trash2, AlertCircle } from "lucide-react";

interface MissingItemCardProps {
  item: MissingItem;
  onEdit: (item: MissingItem) => void;
  onDelete: (id: string) => void;
  onResolve: (id: string) => void;
}

export const MissingItemCard = ({ item, onEdit, onDelete, onResolve }: MissingItemCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-right mb-2">
              {item.nameAr}
            </CardTitle>
            {item.nameEn && (
              <p className="text-sm text-muted-foreground text-right">{item.nameEn}</p>
            )}
          </div>
          {item.image && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center ml-3">
              <img 
                src={item.image} 
                alt={item.nameAr}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <Badge variant={getPriorityColor(item.priority)} className="text-xs">
            {PRIORITY_LABELS[item.priority]}
          </Badge>
          <span className="text-muted-foreground">
            {REASON_LABELS[item.reason]}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground text-right">
            {item.description}
          </p>
        )}

        {item.estimatedPrice && (
          <div className="text-sm text-right">
            <span className="text-muted-foreground">السعر المتوقع: </span>
            <span className="font-medium">{item.estimatedPrice.toLocaleString('ar-SA')} ر.س</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-right">
          تم الكشف في: {item.detectedAt.toLocaleDateString('ar-SA')}
        </div>

        <div className="flex gap-2 pt-2">
          {!item.isResolved && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onResolve(item.id)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 ml-1" />
              حل المشكلة
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {item.isResolved && item.resolvedAt && (
          <div className="flex items-center gap-2 p-2 bg-success/10 rounded-md">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-success">
              تم الحل في {item.resolvedAt.toLocaleDateString('ar-SA')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
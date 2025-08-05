import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { CATEGORIES } from "@/types/product";

interface SearchBarProps {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

export function SearchBar({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onClearFilters
}: SearchBarProps) {
  const hasActiveFilters = searchTerm || selectedCategory;

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-lg border border-border/50 shadow-soft" dir="rtl">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="البحث بالاسم..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 text-right arabic-text"
          dir="rtl"
        />
      </div>

      {/* Category Filter */}
      <div className="sm:w-48">
        <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
          <SelectTrigger className="text-right" dir="rtl">
            <div className="flex items-center">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="جميع الفئات" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="sm:w-auto w-full"
        >
          <X className="w-4 h-4 ml-1" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  );
}
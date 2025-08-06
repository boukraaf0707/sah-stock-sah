import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import MissingItems from "./pages/MissingItems";
import { Debts } from "./pages/Debts";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Layout from "@/components/Layout";
import { Product } from "@/types/product";
import { MissingItem } from "@/types/missing";
import { Sale } from "@/types/sale";
import { localStorageUtils } from "@/utils/localStorage";

const queryClient = new QueryClient();

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedProducts, savedSales, savedMissingItems] = await Promise.all([
          localStorageUtils.loadProducts(),
          localStorageUtils.loadSales(),
          localStorageUtils.loadMissingItems()
        ]);
        
        setProducts(savedProducts);
        setSales(savedSales);
        setMissingItems(savedMissingItems);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  // Save data when they change
  useEffect(() => {
    if (products.length > 0) {
      localStorageUtils.saveProducts(products);
    }
  }, [products]);

  useEffect(() => {
    if (sales.length > 0) {
      localStorageUtils.saveSales(sales);
    }
  }, [sales]);

  useEffect(() => {
    if (missingItems.length > 0) {
      localStorageUtils.saveMissingItems(missingItems);
    }
  }, [missingItems]);

  const stats = {
    totalProducts: Array.isArray(products) ? products.length : 0,
    outOfStock: Array.isArray(products) ? products.filter(p => p.quantity === 0).length : 0,
    lowStock: Array.isArray(products) ? products.filter(p => p.quantity > 0 && p.quantity <= (p.minStock || 5)).length : 0,
    totalSales: Array.isArray(sales) ? sales.length : 0,
    missingItems: Array.isArray(missingItems) ? missingItems.filter(m => !m.isResolved).length : 0
  };

  const handleImportData = (data: { products?: Product[]; missingItems?: MissingItem[]; sales?: Sale[] }) => {
    if (data.products) setProducts(data.products);
    if (data.missingItems) setMissingItems(data.missingItems);
    if (data.sales) setSales(data.sales);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout stats={stats}>
            <Routes>
              <Route path="/" element={<Index products={products} onUpdateProducts={setProducts} />} />
              <Route path="/missing" element={<MissingItems products={products} />} />
              <Route path="/sales" element={<Sales products={products} onUpdateProducts={setProducts} />} />
              <Route path="/debts" element={<Debts products={products} />} />
              <Route path="/reports" element={<Reports products={products} missingItems={missingItems} sales={sales} onImportData={handleImportData} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

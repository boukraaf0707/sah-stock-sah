import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  BarChart3, 
  Menu, 
  X,
  Wifi,
  WifiOff,
  CreditCard
} from "lucide-react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

interface LayoutProps {
  children: React.ReactNode;
  stats?: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    totalSales: number;
    missingItems: number;
  };
}

const Layout = ({ children, stats }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isOnline = useOfflineStatus();

  const navItems = [
    {
      href: "/",
      label: "المخزون",
      icon: Package,
      badge: stats?.totalProducts
    },
    {
      href: "/missing",
      label: "الأصناف المفقودة",
      icon: AlertTriangle,
      badge: stats ? stats.outOfStock + stats.missingItems : undefined,
      badgeVariant: "destructive" as const
    },
    {
      href: "/sales",
      label: "المبيعات",
      icon: ShoppingCart,
      badge: stats?.totalSales
    },
    {
      href: "/debts",
      label: "الديون",
      icon: CreditCard
    },
    {
      href: "/reports",
      label: "التقارير",
      icon: BarChart3
    }
  ];

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">نظام إدارة المخزون</h1>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? "متصل" : "غير متصل"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-50 w-64 bg-card border-l transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Desktop Header */}
            <div className="hidden lg:block p-6 border-b">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-right">نظام إدارة المخزون</h1>
                <div className="flex items-center justify-end gap-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-success" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  )}
                  <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                    {isOnline ? "متصل" : "غير متصل"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  إدارة شاملة للمخزون والمبيعات
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center justify-between w-full p-3 rounded-lg text-right transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge 
                        variant={item.badgeVariant || "secondary"} 
                        className="text-xs min-w-[20px] justify-center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <Separator />

            {/* Footer */}
            <div className="p-4">
              <div className="text-xs text-muted-foreground text-center">
                نظام إدارة المخزون v1.0
                <br />
                {!isOnline && "وضع عدم الاتصال"}
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:mr-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
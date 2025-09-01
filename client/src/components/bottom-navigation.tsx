import { Home, Calculator, Package, Users, BarChart, Settings } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início", testId: "nav-dashboard" },
    { path: "/pricing", icon: Calculator, label: "Preços", testId: "nav-pricing" },
    { path: "/orders", icon: ShoppingBag, label: "Pedidos", testId: "nav-orders" },
    { path: "/customers", icon: Users, label: "Clientes", testId: "nav-customers" },
    { path: "/reports", icon: BarChart, label: "Relatórios", testId: "nav-reports" },
    { path: "/config", icon: Settings, label: "Config", testId: "nav-config" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around py-1 sm:py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  className="flex flex-col items-center space-y-0.5 sm:space-y-1 p-1.5 sm:p-2 touch-target min-w-0"
                  data-testid={item.testId}
                  aria-label={item.label}
                >
                  <Icon 
                    size={18}
                    className={isActive ? "text-primary" : "text-muted-foreground"} 
                  />
                  <span 
                    className={`text-xs leading-tight text-center ${
                      isActive 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
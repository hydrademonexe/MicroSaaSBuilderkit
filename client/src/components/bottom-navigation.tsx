import { Home, Calculator, Package, Users, BarChart } from "lucide-react";
import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início", testId: "nav-dashboard" },
    { path: "/pricing", icon: Calculator, label: "Preços", testId: "nav-pricing" },
    { path: "/inventory", icon: Package, label: "Estoque", testId: "nav-inventory" },
    { path: "/customers", icon: Users, label: "Clientes", testId: "nav-customers" },
    { path: "/reports", icon: BarChart, label: "Relatórios", testId: "nav-reports" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  className="flex flex-col items-center space-y-1 p-2 touch-target"
                  data-testid={item.testId}
                >
                  <Icon 
                    size={20}
                    className={isActive ? "text-primary" : "text-muted-foreground"} 
                  />
                  <span 
                    className={`text-xs ${
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

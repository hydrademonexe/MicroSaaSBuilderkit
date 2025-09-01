import { X, Home, Calculator, ShoppingBag, Package, Users, BarChart, Settings, Clock, MenuBook } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard", description: "Visão geral do negócio" },
    { path: "/pricing", icon: Calculator, label: "Precificação", description: "Calcular custos e margens" },
    { path: "/cardapio", icon: MenuBook, label: "Cardápio", description: "Catálogo de produtos" },
    { path: "/orders", icon: ShoppingBag, label: "Pedidos", description: "Gerenciar pedidos de clientes" },
    { path: "/products", icon: Package, label: "Produtos", description: "Catálogo de produtos" },
    { path: "/inventory", icon: Package, label: "Estoque", description: "Controle de ingredientes" },
    { path: "/customers", icon: Users, label: "Clientes", description: "Base de clientes" },
    { path: "/production", icon: Clock, label: "Produção", description: "Cronograma de produção" },
    { path: "/reports", icon: BarChart, label: "Relatórios", description: "Análise financeira" },
    { path: "/config", icon: Settings, label: "Configurações", description: "Ajustes do sistema" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background border-r border-border z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      onClick={onClose}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon size={20} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
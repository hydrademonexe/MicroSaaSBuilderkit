import { Home, Calculator, Package, Users, BarChart, Settings, BookOpen, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início", testId: "nav-dashboard" },
    { path: "/pricing", icon: Calculator, label: "Preços", testId: "nav-pricing" },
    { path: "/cardapio", icon: BookOpen, label: "Cardápio", testId: "nav-cardapio" },
    { path: "/orders", icon: ShoppingBag, label: "Pedidos", testId: "nav-orders" },
    { path: "/customers", icon: Users, label: "Clientes", testId: "nav-customers" },
  ];

  return null;
}
import { ReactNode } from "react";
import { Header } from "./header";
import { BottomNavigation } from "./bottom-navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}

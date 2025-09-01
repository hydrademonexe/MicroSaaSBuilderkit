import { ReactNode, useState } from "react";
import { Header } from "./header";
import { BottomNavigation } from "./bottom-navigation";
import { MobileMenu } from "./mobile-menu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-20 sm:pb-24">
        <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
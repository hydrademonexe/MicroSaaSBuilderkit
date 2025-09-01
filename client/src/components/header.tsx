import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { database } from "@/lib/database";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [appName, setAppName] = useState("SalgadosPro");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [appNameValue, logoUrlValue] = await Promise.all([
          database.getConfig("appName"),
          database.getConfig("logoUrl")
        ]);
        
        if (appNameValue) setAppName(appNameValue);
        if (logoUrlValue) setLogoUrl(logoUrlValue);
      } catch (error) {
        console.error('Error loading header config:', error);
      }
    };

    loadConfig();
  }, []);

  return (
    <header className="gradient-bg text-primary-foreground py-3 sm:py-4 px-3 sm:px-4 shadow-lg">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-bread-slice text-primary text-sm sm:text-lg"></i>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold truncate">{appName}</h1>
        </div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-6">
          <a href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Dashboard
          </a>
          <a href="/pricing" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Precificação
          </a>
          <a href="/orders" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Pedidos
          </a>
          <a href="/customers" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Clientes
          </a>
          <a href="/reports" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Relatórios
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden touch-target bg-white/20 rounded-lg p-2 flex-shrink-0" 
          onClick={onMenuClick}
          data-testid="button-menu"
          aria-label="Abrir menu"
        >
          <Menu className="text-white" size={18} />
        </button>
      </div>
    </header>
  );
}
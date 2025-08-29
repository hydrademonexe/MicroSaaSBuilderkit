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
    <header className="gradient-bg text-primary-foreground py-4 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-bread-slice text-primary text-lg"></i>
            )}
          </div>
          <h1 className="text-xl font-bold">{appName}</h1>
        </div>
        <button 
          className="touch-target bg-white/20 rounded-lg p-2" 
          onClick={onMenuClick}
          data-testid="button-menu"
          aria-label="Abrir menu"
        >
          <Menu className="text-white" size={20} />
        </button>
      </div>
    </header>
  );
}

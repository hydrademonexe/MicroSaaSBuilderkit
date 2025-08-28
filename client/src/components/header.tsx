import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="gradient-bg text-primary-foreground py-4 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <i className="fas fa-bread-slice text-primary text-lg"></i>
          </div>
          <h1 className="text-xl font-bold">SalgadosPro</h1>
        </div>
        <button 
          className="touch-target bg-white/20 rounded-lg p-2" 
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Menu className="text-white" size={20} />
        </button>
      </div>
    </header>
  );
}

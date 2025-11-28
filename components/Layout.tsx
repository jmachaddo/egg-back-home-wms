import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, Egg, ClipboardList } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LogViewer } from './LogViewer';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  
  const location = useLocation();

  // Determine current module context for logs based on URL
  const getLogContext = () => {
    const path = location.pathname;
    if (path.includes('settings')) return 'Settings';
    if (path.includes('master-data')) return 'MasterData';
    if (path.includes('inventory')) return 'Inventory';
    if (path.includes('inbound')) return 'Inbound';
    if (path.includes('outbound')) return 'Outbound';
    if (path.includes('dashboard')) return 'Dashboard';
    return 'General';
  };

  const currentContext = getLogContext();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="text-egg-500">
            <Egg size={24} />
          </div>
          <span className="font-bold text-slate-800">Egg Back Home</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-slate-900/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
             <p className="font-bold mb-4 text-slate-800">Menu</p>
             <nav className="space-y-2">
                <a href="#/master-data" className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium">
                  Dados Mestre
                </a>
                <a href="#/settings" className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium">
                  Definições
                </a>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-red-600 text-sm font-medium"
                >
                  Terminar Sessão
                </button>
             </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-end">
          <div className="flex items-center gap-3">
             {/* Logs Button */}
             <button 
                onClick={() => setIsLogViewerOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 hover:text-egg-600 transition-colors shadow-sm"
                title="Ver Logs"
             >
                <ClipboardList size={16} />
                <span>Logs</span>
             </button>

             <div className="h-6 w-px bg-slate-200 mx-1"></div>

             <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </div>

        <div className="p-6 flex-1">
          {children}
        </div>
      </main>

      {/* Global Log Viewer Modal */}
      <LogViewer 
        isOpen={isLogViewerOpen} 
        onClose={() => setIsLogViewerOpen(false)} 
        context={currentContext}
      />
    </div>
  );
};
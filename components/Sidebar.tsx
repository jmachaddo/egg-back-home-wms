import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Egg, LogOut, Database } from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  onLogout: () => void;
}

const navItems: NavItem[] = [
  { label: 'Dados Mestre', path: '/master-data', icon: Database },
  { label: 'Definições', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 hidden md:flex flex-col z-10">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-egg-100 p-2 rounded-lg text-egg-600">
          <Egg size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-tight">Egg Back Home</h1>
          <p className="text-xs text-slate-500 font-medium">WMS v1.0</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-egg-50 text-egg-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-egg-500' : 'text-slate-400'} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-3"
        >
          <LogOut size={18} />
          Terminar Sessão
        </button>
        <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            JM
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">João Machado</p>
            <p className="text-xs text-slate-500 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
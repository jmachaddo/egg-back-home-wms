import React, { useState, useEffect } from 'react';
import { X, Filter, Calendar, User, Search } from 'lucide-react';
import { LogEntry } from '../types';
import { logService } from '../services/logService';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  context: string; // The current module context (e.g., 'Settings', 'Inventory')
}

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose, context }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Load logs when opened or context changes
  useEffect(() => {
    if (isOpen) {
      const allLogs = logService.getLogs(context);
      setLogs(allLogs);
    }
  }, [isOpen, context]);

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesUser = userFilter 
      ? log.user.toLowerCase().includes(userFilter.toLowerCase()) 
      : true;
    
    // Simple string match for date (YYYY-MM-DD)
    const matchesDate = dateFilter 
      ? log.timestamp.includes(dateFilter) 
      : true;

    return matchesUser && matchesDate;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col m-4" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Logs de Atividade
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-mono font-normal">
                {context}
              </span>
            </h2>
            <p className="text-sm text-slate-500">Histórico de alterações e eventos neste módulo.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar por Utilizador..." 
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-egg-500/20 focus:border-egg-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-egg-500/20 focus:border-egg-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 w-40">Data/Hora</th>
                <th className="px-6 py-3 w-40">Utilizador</th>
                <th className="px-6 py-3 w-32">Ação</th>
                <th className="px-6 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-PT')}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-700">
                      {log.user}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        log.action === 'Delete' || log.action === 'Eliminar' ? 'bg-red-50 text-red-700' :
                        log.action === 'Create' || log.action === 'Criar' ? 'bg-green-50 text-green-700' :
                        log.action === 'Update' || log.action === 'Editar' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600 truncate max-w-xs" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} />
                      <p>Nenhum log encontrado para os filtros selecionados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center text-xs text-slate-400">
          <span>Mostrando {filteredLogs.length} registos</span>
          <span>Egg Back Home Logger v1.0</span>
        </div>
      </div>
    </div>
  );
};
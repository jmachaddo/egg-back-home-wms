import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, CheckCircle, Ban } from 'lucide-react';
import { Customer } from '../types';
import { logService } from '../services/logService';
import { shopifyService } from '../services/shopifyService';

export const MasterData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers'>('customers');
  
  // Customers State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Nunca');

  // --- Logic ---

  const syncShopifyCustomers = async (manual = false) => {
    setIsSyncing(true);
    try {
      const data = await shopifyService.getCustomers();
      setCustomers(data);
      const timeNow = new Date().toLocaleTimeString();
      setLastSyncTime(timeNow);
      
      if (manual) {
        logService.addLog({
          action: 'Sincronizar',
          module: 'MasterData',
          details: `Sincronização manual de ${data.length} clientes do Shopify`,
          user: 'João Machado'
        });
      }
    } catch (error) {
      console.error("Erro ao sincronizar com Shopify", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load and Interval Setup
  useEffect(() => {
    // Sync immediately on mount
    syncShopifyCustomers();

    // Set up 5-minute interval (300,000 ms)
    const intervalId = setInterval(() => {
      syncShopifyCustomers();
      // Optional: Log automatic syncs differently if needed
      console.log('Auto-syncing Shopify Customers...');
    }, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // --- Render Helpers ---

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4">
      <nav className="space-y-1">
        <button 
          onClick={() => setActiveTab('customers')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-white text-egg-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Users size={18} />
          Clientes
        </button>
      </nav>
    </div>
  );

  const renderList = () => {
    const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
              type="text" 
              placeholder="Pesquisar por nome, email ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-egg-500/20 focus:border-egg-500"
             />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Última sync: {lastSyncTime}
            </span>
            <button 
              onClick={() => syncShopifyCustomers(true)} 
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center ${isSyncing ? 'opacity-75 cursor-wait' : ''}`}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'A Sincronizar...' : 'Sync Shopify'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Shopify ID (Código)</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{customer.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{customer.name}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.email}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{customer.phone}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {customer.city}, {customer.country}
                  </td>
                  <td className="px-4 py-3">
                    {customer.active ? 
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={12} /> Ativo</span> : 
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium"><Ban size={12} /> Inativo</span>
                    }
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                     {isSyncing ? 'A carregar dados do Shopify...' : 'Nenhum cliente encontrado.'}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dados Mestre</h2>
        <p className="text-sm text-slate-500">Gestão centralizada de entidades.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {renderSidebar()}

        <div className="flex-1 p-6 bg-white">
          {activeTab === 'customers' && renderList()}
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, RefreshCw, CheckCircle, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { Customer } from '../types';
import { logService } from '../services/logService';
import { dbService } from '../services/dbService';

export const MasterData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Nunca');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ref to track if component is mounted to prevent state updates on unmount
  const isMounted = useRef(true);

  // Initial Load from DB
  useEffect(() => {
    loadCustomers();
    
    // Automatic Sync every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      console.log("Iniciando sincronização automática...");
      syncShopifyCustomers(false); // false = silent/auto mode
    }, 5 * 60 * 1000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, []);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadCustomers = async () => {
    try {
      const data = await dbService.getCustomers();
      if (isMounted.current) {
        setCustomers(data);
      }
    } catch (e) {
      console.error("Error loading customers", e);
    }
  };

  const syncShopifyCustomers = async (manual = false) => {
    if (isSyncing) return; // Prevent overlapping syncs
    if (isMounted.current) {
      setIsSyncing(true);
      setErrorMsg('');
    }
    
    try {
      // 1. Get Config
      const config = await dbService.getShopifyConfig();
      if (!config.connected || !config.shopUrl || !config.accessToken) {
        if (manual) throw new Error("Loja Shopify não conectada nas Definições.");
        else return; // Silent fail on auto sync
      }

      // 2. Clean URL
      const cleanUrl = config.shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // 3. Loop for Pagination
      let allShopifyCustomers: any[] = [];
      // Start with limit 250 (Shopify Max)
      let nextUrl: string | null = `https://${cleanUrl}/admin/api/2023-10/customers.json?limit=250`;
      
      while (nextUrl) {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(nextUrl)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': config.accessToken,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Erro Shopify (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const pageCustomers = data.customers || [];
        allShopifyCustomers = [...allShopifyCustomers, ...pageCustomers];

        // Handle Pagination via Link Header
        // Header format: <https://...>; rel="next"
        const linkHeader = response.headers.get('Link');
        nextUrl = null; // Default to stop loop

        if (linkHeader) {
          const links = linkHeader.split(',');
          const nextLink = links.find(link => link.includes('rel="next"'));
          if (nextLink) {
            const match = nextLink.match(/<([^>]+)>/);
            if (match) {
              nextUrl = match[1];
            }
          }
        }
      }

      // 4. Save to Supabase (only if we got data)
      if (allShopifyCustomers.length > 0) {
        await dbService.syncCustomers(allShopifyCustomers);
        
        // 5. Reload local state
        await loadCustomers();
        
        const timeNow = new Date().toLocaleTimeString();
        if (isMounted.current) {
          setLastSyncTime(timeNow);
        }
        
        if (manual || allShopifyCustomers.length > 0) {
          logService.addLog({
            action: manual ? 'Sincronizar (Manual)' : 'Sincronizar (Auto)',
            module: 'MasterData',
            details: `Sucesso: ${allShopifyCustomers.length} clientes processados`,
            user: manual ? 'Admin' : 'Sistema'
          });
        }
      }

    } catch (error: any) {
      console.error("Erro sync:", error);
      // Friendly error message
      let friendlyError = error.message;
      if (error.message.includes('401')) friendlyError = "Acesso Negado (401). Verifique o Token de Acesso nas Definições.";
      if (error.message.includes('404')) friendlyError = "Loja não encontrada (404). Verifique o URL da loja nas Definições.";
      if (error.message.includes('Failed to fetch')) friendlyError = "Erro de Rede. Verifique a sua ligação ou se o URL está correto.";

      if (isMounted.current) {
        setErrorMsg(friendlyError);
      }
      
      // Log error (throttle auto sync errors logs in real app, but logging here for visibility)
      logService.addLog({
        action: 'Erro Sync',
        module: 'MasterData',
        details: `Falha: ${friendlyError}`,
        user: 'System'
      });
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  };

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
    // 1. Filter Logic
    const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 2. Pagination Logic
    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

    // Handlers
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
      <div className="space-y-4 animate-fadeIn">
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
            <Ban size={16} />
            {errorMsg}
          </div>
        )}
        
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

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Shopify ID</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{customer.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{customer.name}</td>
                    <td className="px-4 py-3 text-slate-600">{customer.email}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {customer.city}{customer.country ? `, ${customer.country}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      {customer.active ? 
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={12} /> Ativo</span> : 
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium"><Ban size={12} /> Inativo</span>
                      }
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      {isSyncing ? 'A carregar dados do Shopify...' : 'Nenhum cliente encontrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-slate-500">
                Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={goToPrevPage} 
                  disabled={currentPage === 1}
                  className={`p-1 rounded-md transition-colors ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-medium text-slate-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-md transition-colors ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
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
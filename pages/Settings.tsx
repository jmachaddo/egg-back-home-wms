import React, { useState } from 'react';
import { Users, ShoppingBag, Plus, Edit2, Trash2, Ban, CheckCircle, Save, X, Link as LinkIcon, ExternalLink, Shield, CheckSquare, Square } from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { logService } from '../services/logService';

// --- Mock Data ---

const initialRoles: UserRole[] = [
  { id: '1', code: 'ADM', name: 'Administrador', permissions: ['settings_users', 'settings_roles', 'settings_shopify'] },
  { id: '2', code: 'ARM', name: 'Gestor de Armazém', permissions: ['settings_users'] },
  { id: '3', code: 'OPR', name: 'Operador', permissions: [] },
  { id: '4', code: 'LOG', name: 'Logística', permissions: [] },
];

const initialUsers: UserType[] = [
  { id: '1', code: 'ADM01', name: 'John Doe', email: 'john@eggbackhome.com', role: 'Administrador', active: true, password: 'password123' },
  { id: '2', code: 'OPR01', name: 'Maria Silva', email: 'maria@eggbackhome.com', role: 'Operador', active: true, password: 'password123' },
  { id: '3', code: 'LOG01', name: 'Carlos Santos', email: 'carlos@eggbackhome.com', role: 'Logística', active: false, password: 'password123' },
  { id: '4', code: 'CEO01', name: 'João Machado', email: 'joao.machado@eggbackhome.com', role: 'Administrador', active: true, password: 'Offerside1!' },
];

// Available modules for permissions
const availableModules = [
  { id: 'settings_users', label: 'Definições > Utilizadores' },
  { id: 'settings_roles', label: 'Definições > Acesso de Utilizadores' },
  { id: 'settings_shopify', label: 'Definições > Integração Shopify' },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'shopify'>('users');
  
  // Data State
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [roles, setRoles] = useState<UserRole[]>(initialRoles);
  
  // User Form State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<UserType>>({});
  const [userError, setUserError] = useState<string | null>(null);
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);

  // Role Form State
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<UserRole>>({ permissions: [] });
  const [roleError, setRoleError] = useState<string | null>(null);
  const [showRoleDeleteConfirm, setShowRoleDeleteConfirm] = useState(false);

  // Shopify State
  const [shopifyConfig, setShopifyConfig] = useState({
    shopUrl: '',
    accessToken: '',
    connected: false
  });

  // --- USER Logic ---

  const handleEditUser = (user: UserType) => {
    setUserFormData({ ...user });
    setEditingUserId(user.id);
    setIsEditingUser(true);
    setUserError(null);
    setShowUserDeleteConfirm(false);
  };

  const handleCreateUser = () => {
    setUserFormData({ active: true, role: roles[0]?.name || '' });
    setEditingUserId(null);
    setIsEditingUser(true);
    setUserError(null);
    setShowUserDeleteConfirm(false);
  };

  const handleDeleteUser = () => {
    if (!editingUserId) return;
    const userToDelete = users.find(u => u.id === editingUserId);

    setUsers(prevUsers => prevUsers.filter(u => u.id !== editingUserId));
    
    logService.addLog({
      action: 'Eliminar',
      module: 'Users',
      details: `Utilizador eliminado: ${userToDelete?.name} (${userToDelete?.code})`,
      user: 'João Machado'
    });

    setIsEditingUser(false);
    setUserFormData({});
    setEditingUserId(null);
    setShowUserDeleteConfirm(false);
  };

  const handleToggleUserStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const userToToggle = users.find(u => u.id === id);
    if (userToToggle) {
        setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, active: !u.active } : u));
        logService.addLog({
          action: 'Editar',
          module: 'Users',
          details: `Utilizador ${userToToggle.name} ${!userToToggle.active ? 'ativado' : 'inativado'}`,
          user: 'João Machado'
        });
    }
  };

  const handleSaveUser = () => {
    if (!userFormData.code || !userFormData.name || !userFormData.email || !userFormData.password || !userFormData.role) {
      setUserError("Todos os campos são obrigatórios.");
      return;
    }

    const codeExists = users.some(u => u.code === userFormData.code && u.id !== editingUserId);
    if (codeExists) {
      setUserError("O código de utilizador já existe.");
      return;
    }

    if (editingUserId) {
      setUsers(prev => prev.map(u => u.id === editingUserId ? { ...userFormData, id: editingUserId } as UserType : u));
      logService.addLog({
        action: 'Editar',
        module: 'Users',
        details: `Dados atualizados: ${userFormData.name}`,
        user: 'João Machado'
      });
    } else {
      const newUser: UserType = { ...userFormData, id: Math.random().toString(36).substr(2, 9) } as UserType;
      setUsers(prev => [...prev, newUser]);
      logService.addLog({
        action: 'Criar',
        module: 'Users',
        details: `Utilizador criado: ${userFormData.name}`,
        user: 'João Machado'
      });
    }

    setIsEditingUser(false);
    setUserFormData({});
  };

  // --- ROLE Logic ---

  const handleEditRole = (role: UserRole) => {
    setRoleFormData({ ...role });
    setEditingRoleId(role.id);
    setIsEditingRole(true);
    setRoleError(null);
    setShowRoleDeleteConfirm(false);
  };

  const handleCreateRole = () => {
    setRoleFormData({ permissions: [] });
    setEditingRoleId(null);
    setIsEditingRole(true);
    setRoleError(null);
    setShowRoleDeleteConfirm(false);
  };

  const handleDeleteRole = () => {
    if (!editingRoleId) return;
    const roleToDelete = roles.find(r => r.id === editingRoleId);

    // Prevent deleting if assigned to users
    const isAssigned = users.some(u => u.role === roleToDelete?.name);
    if (isAssigned) {
      setRoleError("Não é possível eliminar este cargo porque existem utilizadores associados a ele.");
      return;
    }

    setRoles(prev => prev.filter(r => r.id !== editingRoleId));
    logService.addLog({
      action: 'Eliminar',
      module: 'Roles',
      details: `Cargo eliminado: ${roleToDelete?.name}`,
      user: 'João Machado'
    });

    setIsEditingRole(false);
    setRoleFormData({});
    setEditingRoleId(null);
    setShowRoleDeleteConfirm(false);
  };

  const handleSaveRole = () => {
    if (!roleFormData.code || !roleFormData.name) {
      setRoleError("Código e Nome são obrigatórios.");
      return;
    }

    const codeExists = roles.some(r => r.code === roleFormData.code && r.id !== editingRoleId);
    if (codeExists) {
      setRoleError("O código do cargo já existe.");
      return;
    }

    if (editingRoleId) {
      // If name changes, we should ideally update users, but for simplicity we'll keep as is or warn
      setRoles(prev => prev.map(r => r.id === editingRoleId ? { ...roleFormData, id: editingRoleId } as UserRole : r));
      logService.addLog({
        action: 'Editar',
        module: 'Roles',
        details: `Cargo atualizado: ${roleFormData.name}`,
        user: 'João Machado'
      });
    } else {
      const newRole: UserRole = { ...roleFormData, id: Math.random().toString(36).substr(2, 9) } as UserRole;
      setRoles(prev => [...prev, newRole]);
      logService.addLog({
        action: 'Criar',
        module: 'Roles',
        details: `Cargo criado: ${roleFormData.name}`,
        user: 'João Machado'
      });
    }

    setIsEditingRole(false);
    setRoleFormData({});
  };

  const togglePermission = (moduleId: string) => {
    const currentPerms = roleFormData.permissions || [];
    if (currentPerms.includes(moduleId)) {
      setRoleFormData({ ...roleFormData, permissions: currentPerms.filter(p => p !== moduleId) });
    } else {
      setRoleFormData({ ...roleFormData, permissions: [...currentPerms, moduleId] });
    }
  };

  // --- Render Helpers ---

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4">
      <nav className="space-y-1">
        <button 
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white text-egg-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Users size={18} />
          Utilizadores
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'roles' ? 'bg-white text-egg-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Shield size={18} />
          Acesso de Utilizadores
        </button>
        <button 
          onClick={() => setActiveTab('shopify')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shopify' ? 'bg-white text-egg-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <ShoppingBag size={18} />
          Integração Shopify
        </button>
      </nav>
    </div>
  );

  // --- USER VIEWS ---

  const renderUserForm = () => (
    <div className="max-w-3xl animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {editingUserId ? 'Editar Utilizador' : 'Novo Utilizador'}
        </h3>
        <button onClick={() => setIsEditingUser(false)} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      {userError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {userError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Código <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={userFormData.code || ''} 
            onChange={e => setUserFormData({...userFormData, code: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
            placeholder="Ex: OP001"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nome Completo <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={userFormData.name || ''} 
            onChange={e => setUserFormData({...userFormData, name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
            placeholder="Nome do colaborador"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            value={userFormData.email || ''} 
            onChange={e => setUserFormData({...userFormData, email: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
            placeholder="email@empresa.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
          <input 
            type="password" 
            value={userFormData.password || ''} 
            onChange={e => setUserFormData({...userFormData, password: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Função/Cargo <span className="text-red-500">*</span></label>
          <select 
            value={userFormData.role || ''} 
            onChange={e => setUserFormData({...userFormData, role: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none bg-white"
          >
            <option value="">Selecione...</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
             Opções geridas em "Acesso de Utilizadores"
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Estado</label>
          <div className="flex items-center gap-3 mt-2">
            <button 
              type="button"
              onClick={() => setUserFormData({...userFormData, active: !userFormData.active})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userFormData.active ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userFormData.active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-slate-600">{userFormData.active ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
        <div>
          {editingUserId && (
            showUserDeleteConfirm ? (
              <div className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg border border-red-100 animate-fadeIn">
                 <span className="text-sm font-medium text-red-800">Tem a certeza?</span>
                 <button type="button" onClick={handleDeleteUser} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors">Sim</button>
                 <button type="button" onClick={() => setShowUserDeleteConfirm(false)} className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 transition-colors">Não</button>
              </div>
            ) : (
             <button type="button" onClick={() => setShowUserDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><Trash2 size={18} /> Eliminar</button>
            )
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setIsEditingUser(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button type="button" onClick={handleSaveUser} className="flex items-center gap-2 px-6 py-2 bg-egg-500 text-white rounded-lg text-sm font-medium hover:bg-egg-600 transition-colors"><Save size={18} /> Guardar</button>
        </div>
      </div>
    </div>
  );

  const renderUsersList = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-medium text-slate-900">Lista de Utilizadores</h3>
        <button onClick={handleCreateUser} className="flex items-center gap-2 px-4 py-2 bg-egg-500 text-white rounded-lg text-sm font-medium hover:bg-egg-600 transition-colors"><Plus size={18} /> Novo Utilizador</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Função</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${!user.active ? 'opacity-60 bg-slate-50' : ''}`} onClick={() => handleEditUser(user)}>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{user.code}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">{user.role}</span></td>
                <td className="px-4 py-3">
                  {user.active ? 
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={12} /> Ativo</span> : 
                    <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium"><Ban size={12} /> Inativo</span>
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={(e) => handleToggleUserStatus(e, user.id)} className={`p-1.5 rounded-md transition-colors ${user.active ? 'text-slate-400 hover:text-orange-500 hover:bg-orange-50' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'}`}><Ban size={16} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleEditUser(user); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Nenhum utilizador encontrado.</div>}
      </div>
    </div>
  );

  // --- ROLE VIEWS ---

  const renderRoleForm = () => (
    <div className="max-w-3xl animate-fadeIn">
       <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {editingRoleId ? 'Editar Cargo' : 'Novo Cargo'}
        </h3>
        <button onClick={() => setIsEditingRole(false)} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      {roleError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {roleError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Código <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={roleFormData.code || ''} 
            onChange={e => setRoleFormData({...roleFormData, code: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
            placeholder="Ex: ADM"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nome do Cargo <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={roleFormData.name || ''} 
            onChange={e => setRoleFormData({...roleFormData, name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
            placeholder="Ex: Administrador"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Permissões de Acesso</label>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            {availableModules.map(module => {
              const isSelected = roleFormData.permissions?.includes(module.id);
              return (
                <div 
                  key={module.id} 
                  className={`flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${isSelected ? 'bg-egg-50' : 'hover:bg-slate-50'}`}
                  onClick={() => togglePermission(module.id)}
                >
                  <div className={`text-egg-500 ${isSelected ? 'opacity-100' : 'opacity-40'}`}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-medium text-slate-800' : 'text-slate-600'}`}>{module.label}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
        <div>
          {editingRoleId && (
            showRoleDeleteConfirm ? (
              <div className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg border border-red-100 animate-fadeIn">
                 <span className="text-sm font-medium text-red-800">Tem a certeza?</span>
                 <button type="button" onClick={handleDeleteRole} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors">Sim</button>
                 <button type="button" onClick={() => setShowRoleDeleteConfirm(false)} className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 transition-colors">Não</button>
              </div>
            ) : (
             <button type="button" onClick={() => setShowRoleDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><Trash2 size={18} /> Eliminar</button>
            )
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setIsEditingRole(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button type="button" onClick={handleSaveRole} className="flex items-center gap-2 px-6 py-2 bg-egg-500 text-white rounded-lg text-sm font-medium hover:bg-egg-600 transition-colors"><Save size={18} /> Guardar</button>
        </div>
      </div>
    </div>
  );

  const renderRolesList = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-medium text-slate-900">Perfis de Acesso</h3>
        <button onClick={handleCreateRole} className="flex items-center gap-2 px-4 py-2 bg-egg-500 text-white rounded-lg text-sm font-medium hover:bg-egg-600 transition-colors"><Plus size={18} /> Novo Cargo</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome do Cargo</th>
              <th className="px-4 py-3">Permissões</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleEditRole(role)}>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{role.code}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{role.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                    {role.permissions.length} módulos
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleEditRole(role); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Nenhum cargo configurado.</div>}
      </div>
    </div>
  );

  // --- SHOPIFY VIEW ---

  const renderShopifyIntegration = () => (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-lg font-medium text-slate-900">Integração Shopify</h3>
        <p className="text-sm text-slate-500 mt-1">
          Conecte a sua loja Shopify para sincronizar encomendas e stock automaticamente.
        </p>
      </div>

      <div className={`p-5 rounded-xl border ${shopifyConfig.connected ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'} transition-all`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${shopifyConfig.connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            <ShoppingBag size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800">
              {shopifyConfig.connected ? 'Loja Conectada' : 'Configuração da Loja'}
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              {shopifyConfig.connected 
                ? `Conectado a ${shopifyConfig.shopUrl}` 
                : 'Insira as credenciais da API do Shopify Admin para iniciar a conexão.'}
            </p>

            {!shopifyConfig.connected && (
              <div className="mt-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">URL da Loja (.myshopify.com)</label>
                  <div className="relative">
                     <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                      type="text" 
                      value={shopifyConfig.shopUrl}
                      onChange={(e) => setShopifyConfig({...shopifyConfig, shopUrl: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
                      placeholder="minhaloja.myshopify.com"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Access Token (Admin API)</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">API</div>
                     <input 
                      type="password" 
                      value={shopifyConfig.accessToken}
                      onChange={(e) => setShopifyConfig({...shopifyConfig, accessToken: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500 outline-none"
                      placeholder="shpat_xxxxxxxxxxxxxxxx"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                    <button 
                      onClick={() => {
                        setShopifyConfig({...shopifyConfig, connected: true});
                        logService.addLog({
                          action: 'Integração',
                          module: 'Settings',
                          details: `Shopify conectado: ${shopifyConfig.shopUrl}`,
                          user: 'João Machado'
                        });
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                      Conectar Loja
                    </button>
                </div>
              </div>
            )}

            {shopifyConfig.connected && (
               <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                    <ExternalLink size={14} />
                    Testar Conexão
                  </button>
                  <button 
                    onClick={() => {
                      setShopifyConfig({...shopifyConfig, connected: false});
                      logService.addLog({
                        action: 'Integração',
                        module: 'Settings',
                        details: `Shopify desconectado: ${shopifyConfig.shopUrl}`,
                        user: 'João Machado'
                      });
                    }}
                    className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100"
                  >
                    Desconectar
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Definições</h2>
        <p className="text-sm text-slate-500">Gerencie utilizadores, permissões e integrações.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {renderSidebar()}

        <div className="flex-1 p-6 bg-white">
          {activeTab === 'users' && (isEditingUser ? renderUserForm() : renderUsersList())}
          {activeTab === 'roles' && (isEditingRole ? renderRoleForm() : renderRolesList())}
          {activeTab === 'shopify' && renderShopifyIntegration()}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Egg, ArrowRight, Lock, Mail } from 'lucide-react';
import { logService } from '../services/logService';
import { dbService } from '../services/dbService';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await dbService.authenticate(email, password);

      if (user) {
        // Save user session
        localStorage.setItem('egg_user', JSON.stringify(user));

        logService.addLog({
          action: 'Login',
          module: 'System',
          details: 'Login com sucesso via Supabase',
          user: user.name
        });
        onLogin();
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (err) {
      setError('Email ou password incorretos.');
      logService.addLog({
        action: 'Login Falhado',
        module: 'System',
        details: `Tentativa falhada para: ${email}`,
        user: 'Desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-egg-500 p-8 text-center">
          <div className="inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-4 text-white">
            <Egg size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Egg Back Home WMS</h1>
          <p className="text-egg-100 text-sm">Entre para gerir o seu armazém</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500/20 focus:border-egg-500 outline-none transition-all"
                  placeholder="seu.email@eggbackhome.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-egg-500/20 focus:border-egg-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'A validar...' : (
                <>
                  Entrar na Plataforma <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Esqueceu-se da password? Contacte o administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
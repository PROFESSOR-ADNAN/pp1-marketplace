import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Sparkles, User, Store, ShieldCheck, Check } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSwitch = async (role: 'buyer' | 'seller' | 'admin') => {
    setLoadingRole(role);
    try {
      await demoLogin(role);
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Portfolio Demo:</span>
          <span className="text-slate-400">Quick-switch test personas:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwitch('buyer')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
              user?.role === 'buyer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch to Demo Customer persona"
          >
            <User className="w-3 h-3" />
            <span>Buyer</span>
            {user?.role === 'buyer' && <Check className="w-3 h-3 text-emerald-200" />}
          </button>

          <button
            onClick={() => handleSwitch('seller')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
              user?.role === 'seller'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch to Demo Merchant persona"
          >
            <Store className="w-3 h-3" />
            <span>Seller</span>
            {user?.role === 'seller' && <Check className="w-3 h-3 text-amber-200" />}
          </button>

          <button
            onClick={() => handleSwitch('admin')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
              user?.role === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch to Demo Admin persona"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
            {user?.role === 'admin' && <Check className="w-3 h-3 text-indigo-200" />}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Store, ShieldCheck, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow">
            ሱ
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            SOUQ<span className="text-emerald-600 font-medium text-sm ml-1">ኢትዮጵያ</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-emerald-600 transition">{t('nav.home')}</Link>
          <Link to="/products" className="hover:text-emerald-600 transition">{t('nav.catalog')}</Link>
          {user?.role === 'seller' && (
            <Link to="/seller" className="hover:text-emerald-600 transition flex items-center gap-1 text-emerald-700 font-semibold">
              <Store className="w-4 h-4" /> {t('nav.seller_dashboard')}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-indigo-600 transition flex items-center gap-1 text-indigo-700 font-semibold">
              <ShieldCheck className="w-4 h-4" /> {t('nav.admin_dashboard')}
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition text-slate-700"
            title="Toggle English / Amharic"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            {i18n.language === 'en' ? 'አማርኛ' : 'English'}
          </button>

          <Link to="/cart" className="relative p-2 text-slate-600 hover:text-emerald-600 transition">
            <ShoppingCart className="w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/orders" className="text-sm font-medium text-slate-700 hover:text-emerald-600 hidden sm:block">
                {t('nav.my_orders')}
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 text-slate-500 hover:text-red-600 transition"
                title={t('nav.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-lg transition"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

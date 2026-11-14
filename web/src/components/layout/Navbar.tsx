import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, ShieldCheck, Globe, LogOut, Heart, Search, X, Package, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';
import { useTranslation } from 'react-i18next';
import { DemoSwitcher } from '../common/DemoSwitcher.js';
import { apiFetch } from '../../services/api.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Live Autocomplete Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(nextLang);
  };

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(data.products || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (id: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/products/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <DemoSwitcher />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow">
              ሱ
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              SOUQ<span className="text-emerald-600 font-medium text-sm ml-1">ኢትዮጵያ</span>
            </span>
          </Link>

          {/* Live Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search Ethiopian coffee, dresses, spices..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-400">Searching products...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSelectProduct(product._id)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition"
                      >
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=100'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                          <span className="text-[10px] text-slate-500">{product.category?.name || 'Ethiopian Goods'}</span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600 flex-shrink-0">
                          ETB {(product.price / 100).toFixed(2)}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full p-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-emerald-600 transition">{t('nav.home')}</Link>
            <Link to="/products" className="hover:text-emerald-600 transition">{t('nav.catalog')}</Link>
            <Link to="/delivery" className="hover:text-emerald-600 transition flex items-center gap-1 text-slate-600">
              <Truck className="w-4 h-4 text-emerald-600" /> Driver Run Sheet
            </Link>
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

          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition text-slate-700"
              title="Toggle English / Amharic"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              {i18n.language === 'en' ? 'አማርኛ' : 'EN'}
            </button>

            {/* Wishlist Button */}
            <Link to="/wishlist" className="relative p-2 text-slate-600 hover:text-rose-600 transition" title="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-emerald-600 transition" title="Shopping Cart">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User State */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1 py-0.2 rounded">
                    {user.role}
                  </span>
                </span>
                <Link to="/orders" className="text-xs font-medium text-slate-700 hover:text-emerald-600 hidden sm:block">
                  {t('nav.my_orders')}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-600 px-2.5 py-1.5 rounded-lg transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

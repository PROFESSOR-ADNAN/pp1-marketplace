import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShieldCheck, Zap, Truck, CreditCard } from 'lucide-react';
import { apiFetch } from '../services/api.js';
import { useCart } from '../context/CartContext.js';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/products?limit=8')
      .then((data) => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-2xl shadow-xl max-w-7xl mx-auto mt-6">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 border border-emerald-400/30 text-emerald-100 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> High-Concurrency Multi-Vendor Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:bg-emerald-50 transition transform hover:-translate-y-0.5"
            >
              {t('hero.cta')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg"><CreditCard className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Chapa Multi-Payment</h3>
            <p className="text-xs text-slate-500">Instant settlements in ETB using Telebirr, CBE Birr, and Visa/Mastercard.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Zero Oversell Concurrency</h3>
            <p className="text-xs text-slate-500">Atomic two-phase stock reservation with automatic 15-minute expiration release.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-lg"><Truck className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Ethiopian Landmark Delivery</h3>
            <p className="text-xs text-slate-500">Addresses designed for Addis Ababa & regional towns with driver phone call confirmation.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-white/90 backdrop-blur rounded text-slate-700">
                  {p.category}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-700">
                    ETB {(p.price / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => addItem(p._id, 1)}
                    disabled={p.stock <= 0}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition"
                  >
                    {p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

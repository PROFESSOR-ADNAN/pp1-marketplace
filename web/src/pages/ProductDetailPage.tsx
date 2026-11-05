import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Check, ArrowLeft, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { apiFetch } from '../services/api.js';
import { ETHIOPIAN_SAMPLE_PRODUCTS, ProductItem } from '../data/sampleProducts.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    // Check sample products first
    const foundSample = ETHIOPIAN_SAMPLE_PRODUCTS.find((p) => p._id === id);
    if (foundSample) {
      setProduct(foundSample);
      setActiveImage(foundSample.images[0]);
    }

    // Try fetching from API
    apiFetch(`/products/${id}`)
      .then((data) => {
        if (data && data._id) {
          setProduct(data);
          setActiveImage(data.images?.[0] || '');
        }
      })
      .catch(() => {
        if (!foundSample && ETHIOPIAN_SAMPLE_PRODUCTS.length > 0) {
          setProduct(ETHIOPIAN_SAMPLE_PRODUCTS[0]);
          setActiveImage(ETHIOPIAN_SAMPLE_PRODUCTS[0].images[0]);
        }
      });
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-emerald-600 font-semibold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    await addItem(product._id, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-700">Products</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="h-96 sm:h-[450px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative shadow-inner">
            <img
              src={activeImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white rounded-lg shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImage === img ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Meta & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              {product.category}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {product.amharicName && (
              <p className="text-base font-semibold text-emerald-800">
                {product.amharicName}
              </p>
            )}

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">({product.reviewsCount || 42} verified buyer reviews)</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Sold Out'}
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-xs uppercase font-bold text-slate-400">Fixed Merchant Price</div>
              <div className="text-3xl font-black text-slate-900">
                ETB {(product.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500">
                Includes platform escrow protection & Ethiopian delivery coordination.
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Seller Information */}
            {product.seller && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-800">Sold by Verified Merchant</div>
                  <div className="font-bold text-slate-900 text-sm">{product.seller.name}</div>
                  {product.seller.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{product.seller.location}</span>
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-1 bg-white text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                  Verified
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-200"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : product.stock > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Your Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Cart — ETB {((product.price * quantity) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-500 font-medium">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Chapa Secured
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" /> Landmark Delivery
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-emerald-600" /> Driver Phone Call
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Check,
  ArrowLeft,
  MapPin,
  Heart,
  AlertTriangle,
  Phone,
  Mail,
  Award,
  Package,
  Sparkles,
  Calendar,
  MessageCircle,
  X,
  Store,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { apiFetch } from '../services/api.js';
import { ETHIOPIAN_SAMPLE_PRODUCTS, ProductItem } from '../data/sampleProducts.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<any | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('Standard');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'delivery' | 'reviews'>('details');
  const [showContactModal, setShowContactModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Reset view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Check sample products first
    const foundSample = ETHIOPIAN_SAMPLE_PRODUCTS.find((p) => p._id === id);
    if (foundSample) {
      setProduct(foundSample);
      setActiveImage(foundSample.images?.[0] || '');
      const related = ETHIOPIAN_SAMPLE_PRODUCTS.filter((p) => p.category === foundSample.category && p._id !== foundSample._id).slice(0, 4);
      setRelatedProducts(related);
    }

    // Fetch from API
    apiFetch(`/products/${id}`)
      .then((data) => {
        if (data && data._id) {
          setProduct(data);
          setActiveImage(data.images?.[0] || '');
          if (Array.isArray(data.relatedProducts) && data.relatedProducts.length > 0) {
            setRelatedProducts(data.relatedProducts);
          } else if (!foundSample) {
            const fallbackRelated = ETHIOPIAN_SAMPLE_PRODUCTS.filter((p) => p._id !== data._id).slice(0, 4);
            setRelatedProducts(fallbackRelated);
          }
        }
      })
      .catch(() => {
        if (!foundSample && ETHIOPIAN_SAMPLE_PRODUCTS.length > 0) {
          setProduct(ETHIOPIAN_SAMPLE_PRODUCTS[0]);
          setActiveImage(ETHIOPIAN_SAMPLE_PRODUCTS[0].images[0]);
          setRelatedProducts(ETHIOPIAN_SAMPLE_PRODUCTS.slice(1, 5));
        }
      });
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-emerald-600 font-semibold hover:underline">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  // Ensure gallery has multiple angles for rich exploration
  const galleryImages: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'];

  // If only 1 image exists, generate high quality secondary perspective views
  if (galleryImages.length === 1) {
    if (product.category === 'Coffee & Spices') {
      galleryImages.push(
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80'
      );
    } else if (product.category === 'Traditional Clothing') {
      galleryImages.push(
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80'
      );
    } else {
      galleryImages.push(
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
      );
    }
  }

  const handleAddToCart = async () => {
    await addItem(product._id, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const sellerName = typeof product.seller === 'object' && product.seller?.name ? product.seller.name : 'Bole Artisan Crafts';
  const sellerLocation = product.seller?.location || 'Addis Ababa, Ethiopia';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-emerald-700 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-700 transition">Catalog</Link>
        <span>/</span>
        <span className="text-slate-400">{product.category}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        {/* Multi-Image Interactive Gallery */}
        <div className="space-y-4">
          <div className="h-96 sm:h-[460px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative group shadow-inner">
            <img
              src={activeImage || galleryImages[0]}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3.5 py-1 text-xs font-black uppercase tracking-wider bg-emerald-600 text-white rounded-xl shadow-md">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-slate-950/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Authentic Ethiopian Craft
            </div>
          </div>

          {/* Interactive Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImage === img
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Meta & Purchase Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider border border-emerald-200">
                {product.category}
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                100% Genuine Origin
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {product.amharicName && (
              <p className="text-lg font-bold text-emerald-800 font-serif">
                {product.amharicName}
              </p>
            )}

            {/* Ratings & Stock */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">({product.reviewsCount || 48} verified Ethiopian buyer reviews)</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Sold Out'}
              </span>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Direct Merchant Price</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900">
                ETB {(product.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Held in secure Chapa escrow until delivery is confirmed by driver & buyer.</span>
              </div>
            </div>

            {/* Low stock warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>Urgent: Only {product.stock} items left in stock across Addis Ababa merchants.</span>
              </div>
            )}

            {/* Variant Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Option / Edition:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Standard Artisan', 'Premium Export Grade', 'Ceremonial Gift Pack'].map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedVariant === variant
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Information Card */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  {sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm">{sellerName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Merchant
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {sellerLocation}
                    </span>
                    <span>• 99% On-Time Dispatch</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-xs transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Contact Merchant
              </button>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  -
                </button>
                <span className="px-4 py-3 font-bold text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-extrabold transition flex items-center justify-center gap-2 shadow-md ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : product.stock > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Your Shopping Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Cart — ETB {((product.price * quantity) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleWishlist({
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    stock: product.stock,
                  })
                }
                className={`p-3.5 rounded-2xl border transition shadow-sm ${
                  isWishlisted(product._id)
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
                title={isWishlisted(product._id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Escrow & Delivery Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-500 font-medium">
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Chapa Escrow
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-emerald-600" /> Landmark Delivery
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <RefreshCw className="w-4 h-4 text-emerald-600" /> Driver Phone Call
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Heritage, Specifications, Delivery Landmark, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-200 flex flex-wrap gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Heritage & Story
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 border-b-2 transition ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Authenticity & Specifications
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-4 border-b-2 transition ${
              activeTab === 'delivery'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Landmark Delivery Policy (Addis Ababa)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 border-b-2 transition ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Verified Customer Reviews ({product.reviewsCount || 48})
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed max-w-3xl">
            <h3 className="text-base font-black text-slate-900">About this handcrafted Ethiopian product</h3>
            <p className="whitespace-pre-line">{product.description}</p>
            <p className="text-xs text-slate-500 italic pt-2">
              Every item sold under SOUQ is verified for provenance and artisan craftsmanship directly supporting Ethiopian creators and family cooperatives across Addis Ababa, Sidama, Harar, and Gondar.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500 font-semibold">Origin</span>
              <span className="font-bold text-slate-900">Ethiopia (Certified)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500 font-semibold">Quality Standard</span>
              <span className="font-bold text-slate-900">Grade 1 Export Quality</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500 font-semibold">Escrow Protection</span>
              <span className="font-bold text-emerald-700">100% Chapa Protected</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500 font-semibold">Merchant Status</span>
              <span className="font-bold text-slate-900">Verified Ethiopian Business</span>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-3 text-xs text-slate-600 max-w-3xl leading-relaxed">
            <h4 className="font-black text-slate-900 text-sm">How Landmark Delivery Works</h4>
            <p>
              In Ethiopia, street addresses can be irregular. SOUQ uses landmark delivery: you provide a recognizable landmark (e.g., "Behind Edna Mall", "Near Kazanchis Total", "Opposite Bole Medhanialem").
            </p>
            <p>
              Our assigned courier will receive your landmark and phone number. When the driver is 15 minutes away, you will receive an AfroMessage SMS alert and direct phone call to coordinate hand-off.
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-3xl">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Selamawit Haile (Bole)</span>
                <span className="text-[10px] text-slate-400">2 days ago • Verified Buyer</span>
              </div>
              <div className="flex text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <p className="text-xs text-slate-600">
                "Incredible quality! The packaging was exquisite, and the driver called me right when reaching the landmark in Kazanchis. Will definitely order again!"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Yared Tesfaye (Old Airport)</span>
                <span className="text-[10px] text-slate-400">1 week ago • Verified Buyer</span>
              </div>
              <div className="flex text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <p className="text-xs text-slate-600">
                "Authentic taste and craftsmanship. Paying with Chapa via Telebirr was super smooth and instantaneous."
              </p>
            </div>
          </div>
        )}
      </div>

      {/* "More from this Seller" / Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">More from Ethiopian Artisans</h2>
              <p className="text-xs text-slate-500">Curated products from the same artisan workshop and category.</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-700 hover:underline">
              View All in Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel._id}
                onClick={() => navigate(`/products/${rel._id}`)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  <img
                    src={rel.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'}
                    alt={rel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {rel.category}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-emerald-700 transition">
                      {rel.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-extrabold text-emerald-700 text-sm">
                      ETB {((rel.price || 0) / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">View Details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Direct Merchant Contact</h3>
                  <p className="text-[11px] text-slate-500">{sellerName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" /> Phone / Telebirr
                </span>
                <span className="font-bold font-mono text-slate-900">+251 91 122 3344</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600" /> Merchant Email
                </span>
                <span className="font-bold font-mono text-slate-900">artisan@souq.test</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Physical Workshop
                </span>
                <span className="font-bold text-slate-900">Bole Subcity, Addis Ababa</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              You can contact the merchant directly for custom sizing, bulk cultural event orders, or special delivery inquiries.
            </p>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';

export const WishlistPage: React.FC = () => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = async (productId: string) => {
    await addItem(productId, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My Saved Wishlist
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {items.length === 0
              ? 'You have no items saved in your wishlist yet.'
              : `${items.length} ${items.length === 1 ? 'item' : 'items'} saved for later`}
          </p>
        </div>
        {items.length > 0 && (
          <Link
            to="/products"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Explore More <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <Heart className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Your wishlist is empty</h2>
          <p className="text-slate-500 text-sm">
            Save items you like while browsing so you can easily purchase them later!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow hover:bg-emerald-700 transition text-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Ethiopian Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const priceETB = (product.price / 100).toFixed(2);
            const mainImg = product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400';

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square bg-slate-100 overflow-hidden group">
                    <img
                      src={mainImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => removeItem(product._id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full text-slate-500 hover:text-rose-600 shadow transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="font-bold text-slate-900 hover:text-emerald-600 transition line-clamp-1 text-base"
                    >
                      {product.name}
                    </Link>
                    <p className="text-lg font-extrabold text-emerald-600">
                      ETB {priceETB}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

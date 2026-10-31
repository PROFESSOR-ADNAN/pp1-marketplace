import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';

export const CartPage: React.FC = () => {
  const { items, total, updateQty, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500">Browse our product catalog to discover items from verified merchants.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-700 transition"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm font-semibold text-red-600 hover:underline">
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity, subtotal }) => (
            <div key={product._id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={product.images?.[0] || 'https://placehold.co/100'} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{product.name}</h4>
                <div className="text-xs text-slate-500 mt-1">Unit: ETB {(product.price / 100).toFixed(2)}</div>
                <div className="text-xs text-emerald-600 font-semibold mt-0.5">{product.stock} in stock</div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => updateQty(product._id, parseInt(e.target.value) || 1)}
                  className="w-16 p-1 border rounded text-center text-sm"
                />
                <button onClick={() => removeItem(product._id)} className="p-1.5 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="w-24 text-right font-extrabold text-slate-900">
                ETB {(subtotal / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit space-y-6 shadow-sm">
          <h3 className="font-extrabold text-xl text-slate-900 border-b pb-3">Order Summary</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} items)</span>
              <span>ETB {(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Platform Fee (included)</span>
              <span>5%</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-extrabold text-lg text-slate-900">
              <span>Total Amount</span>
              <span className="text-emerald-700">ETB {(total / 100).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

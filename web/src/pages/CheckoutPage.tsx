import React, { useState } from 'react';
import { useCart } from '../context/CartContext.js';
import { apiFetch } from '../services/api.js';

export const CheckoutPage: React.FC = () => {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Bole',
    woreda: '03',
    landmark: 'Near Edna Mall / Rwanda Embassy',
    phone: '+251911223344',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/orders', {
        method: 'POST',
        headers: {
          'Idempotency-Key': `idemp-${Date.now()}`,
        },
        body: JSON.stringify({
          deliveryAddress: form,
        }),
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Ethiopian Delivery & Checkout</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Delivery Address</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Region</label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sub-City</label>
              <input
                type="text"
                value={form.subCity}
                onChange={(e) => setForm({ ...form, subCity: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Woreda</label>
              <input
                type="text"
                value={form.woreda}
                onChange={(e) => setForm({ ...form, woreda: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Notable Landmark (For Delivery Phone Call)
            </label>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="e.g. In front of Medhanialem Mall"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Contact Phone (+251...)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="+251911223344"
              required
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit space-y-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Payment Details</h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
              <strong>Secured by Chapa:</strong> Telebirr, CBE Birr, Awash Birr, and Visa/Mastercard.
            </div>
            <div className="flex justify-between text-sm">
              <span>Order Amount</span>
              <span className="font-extrabold text-emerald-700">ETB {(total / 100).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow transition"
          >
            {loading ? 'Reserving Inventory...' : 'Pay with Chapa (ETB)'}
          </button>
        </div>
      </form>
    </div>
  );
};

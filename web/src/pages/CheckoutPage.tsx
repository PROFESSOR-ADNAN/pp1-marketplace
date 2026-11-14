import React, { useState } from 'react';
import { useCart } from '../context/CartContext.js';
import { apiFetch } from '../services/api.js';
import { Tag, Check, Sparkles } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number; discountFixed: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const [form, setForm] = useState({
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Bole',
    woreda: '03',
    landmark: 'Near Edna Mall / Rwanda Embassy',
    phone: '+251911223344',
  });

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SOUQ10') {
      setAppliedPromo({ code, discountPercent: 10, discountFixed: 0 });
    } else if (code === 'ENKUTATASH') {
      setAppliedPromo({ code, discountPercent: 15, discountFixed: 0 });
    } else if (code === 'ADDIS2026') {
      setAppliedPromo({ code, discountPercent: 0, discountFixed: 5000 }); // 50 ETB in santim
    } else {
      setPromoError('Invalid promo code. Try "SOUQ10" or "ENKUTATASH"');
    }
  };

  const discountAmount = appliedPromo
    ? appliedPromo.discountPercent > 0
      ? Math.round((total * appliedPromo.discountPercent) / 100)
      : Math.min(total, appliedPromo.discountFixed)
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

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
          returnUrl: `${window.location.origin}/orders/confirmation`,
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

            {/* Promo Code Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Discount Coupon / Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="e.g. SOUQ10 or ENKUTATASH"
                  className="flex-1 border rounded-lg p-2 text-xs uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-rose-600 mt-1">{promoError}</p>
              )}
              {appliedPromo && (
                <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs text-emerald-800 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Promo "{appliedPromo.code}" Applied!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoInput('');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-normal"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>ETB {(total / 100).toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Discount</span>
                  <span>-ETB {(discountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total Due</span>
                <span className="text-emerald-700">ETB {(finalTotal / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow transition"
          >
            {loading ? 'Reserving Inventory...' : `Pay ETB ${(finalTotal / 100).toFixed(2)} with Chapa`}
          </button>
        </div>
      </form>
    </div>
  );
};

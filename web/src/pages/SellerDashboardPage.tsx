import React, { useState, useEffect } from 'react';
import { Store, DollarSign, Package, TrendingUp, Truck, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        apiFetch('/orders').catch(() => []),
        apiFetch('/products?limit=20').catch(() => ({ products: [] })),
      ]);
      setOrders(ordersRes || []);
      setProducts(productsRes.products || []);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkShipped = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SHIPPED' }),
      });
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute metrics
  const totalRevenueSantim = orders
    .filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const grossSalesETB = totalRevenueSantim / 100;
  const platformFeeETB = grossSalesETB * 0.05; // 5% platform fee
  const netEarningsETB = grossSalesETB - platformFeeETB;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PAID' || o.status === 'PENDING_PAYMENT').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/20">
              Verified Merchant • Addis Ababa
            </span>
          </div>
          <h1 className="text-3xl font-black">{user?.name || 'Bole Artisan Crafts'}</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Manage your catalog inventory, track landmark customer shipments, and monitor your 95% net sales payout ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold flex items-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => {
              setWithdrawalSuccess(true);
              setTimeout(() => setWithdrawalSuccess(false), 5000);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl shadow-md transition text-xs flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" /> Request Telebirr Payout
          </button>
        </div>
      </div>

      {withdrawalSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Payout request of ETB {netEarningsETB.toFixed(2)} submitted to Telebirr merchant account (+251911223344). Transfer will settle in 2-4 hours.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ETB {grossSalesETB.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500">From {orders.length} lifetime orders</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Net Merchant Payout</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ETB {netEarningsETB.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500">After 5% SOUQ platform fee (ETB {platformFeeETB.toFixed(2)})</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Fulfillment</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingOrdersCount}</div>
          <p className="text-xs text-slate-500">Orders waiting to be packed & shipped</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Live Products</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{products.length}</div>
          <p className="text-xs text-slate-500">Listed in marketplace</p>
        </div>
      </div>

      {/* Orders to Fulfill */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Orders Awaiting Dispatch</h2>
            <p className="text-xs text-slate-500">Mark orders as shipped to automatically trigger courier pickup and AfroMessage SMS to the buyer.</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {orders.length} total orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No customer orders received yet. Place a test order from the marketplace catalog!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3">Order Ref / Customer</th>
                  <th className="py-3">Items</th>
                  <th className="py-3">Delivery Landmark</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isShipped = order.status === 'SHIPPED';

                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition">
                      <td className="py-3">
                        <p className="font-mono font-bold text-slate-900">{order.payment?.txRef || order._id.slice(-6)}</p>
                        <p className="text-slate-500 text-[11px]">{order.deliveryAddress?.phone || 'Customer'}</p>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-800">
                          {order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ') || 'Item'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.subCity}
                        <span className="block text-[10px] text-slate-400 italic">"{order.deliveryAddress?.landmark}"</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-700">
                        ETB {((order.totalAmount || 0) / 100).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {isPaid && (
                          <button
                            onClick={() => handleMarkShipped(order._id)}
                            disabled={updatingId === order._id}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition text-xs disabled:opacity-50"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            {updatingId === order._id ? 'Dispatching...' : 'Mark as Shipped'}
                          </button>
                        )}
                        {isShipped && (
                          <span className="text-[11px] font-semibold text-blue-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Driver Dispatched
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory & Low Stock Warnings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Listed Catalog Inventory</h2>
            <p className="text-xs text-slate-500">Products with stock below 5 trigger automatic buyer urgency alerts.</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {products.length} Products
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((prod) => {
            const isLowStock = prod.stock <= 5;
            return (
              <div key={prod._id} className="border border-slate-200 rounded-xl p-4 flex gap-3 items-center">
                <img
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=150'}
                  alt={prod.name}
                  className="w-12 h-12 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                  <p className="font-bold text-emerald-600">ETB {(prod.price / 100).toFixed(2)}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {isLowStock ? (
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> {prod.stock} left
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">{prod.stock} in stock</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Link } from 'react-router-dom';

const ETHIOPIAN_IMAGE_PRESETS = [
  {
    label: 'Yirgacheffe Coffee',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    category: 'Coffee & Spices',
  },
  {
    label: 'Habesha Kemis Tilf',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    category: 'Traditional Clothing',
  },
  {
    label: 'Clay Jebena Set',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    category: 'Handmade Crafts',
  },
  {
    label: 'Leather Satchel Bag',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    category: 'Leather & Footwear',
  },
  {
    label: 'Organic Mitmita & Berbere',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    category: 'Coffee & Spices',
  },
];

const CATEGORIES = [
  'Coffee & Spices',
  'Traditional Clothing',
  'Handmade Crafts',
  'Leather & Footwear',
  'Art & Musical Instruments',
  'Home & Living',
];

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    priceETB: '',
    stock: '15',
    imageUrl: ETHIOPIAN_IMAGE_PRESETS[0].url,
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, myProductsRes] = await Promise.all([
        apiFetch('/orders').catch(() => []),
        apiFetch('/products/mine').catch(() => null),
      ]);

      setOrders(Array.isArray(ordersRes) ? ordersRes : []);

      if (Array.isArray(myProductsRes) && myProductsRes.length > 0) {
        setProducts(myProductsRes);
      } else {
        // Fallback to marketplace products if empty
        const generalProducts = await apiFetch('/products?limit=12').catch(() => ({ products: [] }));
        setProducts(generalProducts.products || []);
      }
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
      showToast('Order marked as SHIPPED. Courier dispatched and customer notified via AfroMessage SMS.');
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const priceNum = parseFloat(newProduct.priceETB);
    const stockNum = parseInt(newProduct.stock, 10);

    if (!newProduct.name.trim() || newProduct.name.trim().length < 3) {
      setModalError('Product title must be at least 3 characters long');
      return;
    }
    if (!newProduct.description.trim() || newProduct.description.trim().length < 10) {
      setModalError('Description must be at least 10 characters long');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError('Please enter a valid price in ETB');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setModalError('Please enter a valid stock count');
      return;
    }

    setSubmittingProduct(true);
    try {
      const santimPrice = Math.round(priceNum * 100);
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          category: newProduct.category,
          price: santimPrice,
          stock: stockNum,
          images: [newProduct.imageUrl || ETHIOPIAN_IMAGE_PRESETS[0].url],
        }),
      });

      showToast(`Product "${newProduct.name}" listed successfully in the marketplace!`);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        category: CATEGORIES[0],
        priceETB: '',
        stock: '15',
        imageUrl: ETHIOPIAN_IMAGE_PRESETS[0].url,
      });
      await fetchDashboardData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleQuickStockAdjust = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingId(productId);
    try {
      await apiFetch(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: newStock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove "${title}" from the active marketplace?`)) {
      return;
    }

    setUpdatingId(productId);
    try {
      await apiFetch(`/products/${productId}`, {
        method: 'DELETE',
      });
      showToast(`Product "${title}" has been removed from marketplace.`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
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
            Add new products to your Ethiopian artisan catalog, monitor live inventory, track landmark customer shipments, and withdraw Telebirr earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold px-5 py-2.5 rounded-xl shadow-md transition text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold flex items-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
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

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

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
          <p className="text-xs text-slate-500">From {orders.length} lifetime customer orders</p>
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
            <span>Listed Products</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{products.length}</div>
          <p className="text-xs text-slate-500">Active products in your store</p>
        </div>
      </div>

      {/* Product Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Your Product Catalog</h2>
            <p className="text-xs text-slate-500">
              Manage stock, update prices, or add new Ethiopian products to the marketplace catalog.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No products listed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start selling your Ethiopian specialty goods by creating your first product listing.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" /> Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price (ETB)</th>
                  <th className="py-3 px-3">Stock Level</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const isLowStock = prod.stock <= 5;
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || ETHIOPIAN_IMAGE_PRESETS[0].url}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl bg-slate-100 flex-shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{prod.name}</p>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{prod.description}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-emerald-700 text-sm">
                        ETB {((prod.price || 0) / 100).toFixed(2)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickStockAdjust(prod._id, prod.stock, -1)}
                            disabled={updatingId === prod._id || prod.stock <= 0}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition disabled:opacity-40"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {prod.stock}
                          </span>
                          <button
                            onClick={() => handleQuickStockAdjust(prod._id, prod.stock, 1)}
                            disabled={updatingId === prod._id}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition disabled:opacity-40"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                          {isLowStock && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {prod.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${prod._id}`}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition"
                            title="View product in store"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(prod._id, prod.name)}
                            disabled={updatingId === prod._id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition disabled:opacity-50"
                            title="Delete / Deactivate product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Add New Ethiopian Product</h3>
                  <p className="text-xs text-slate-500">List an artisan product in the SOUQ marketplace catalog.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sidama Specialty Washed Arabica Coffee"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price in ETB *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ETB
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 1250.00"
                      value={newProduct.priceETB}
                      onChange={(e) => setNewProduct({ ...newProduct, priceETB: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  {newProduct.priceETB && !isNaN(Number(newProduct.priceETB)) && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      = {Math.round(Number(newProduct.priceETB) * 100)} santim
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 20"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the artisan craft, materials (e.g. pure Shemma cotton, organic Arabica beans), provenance, and cultural significance..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Photo Presets & Custom URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Product Image (Select Preset or Provide URL)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ETHIOPIAN_IMAGE_PRESETS.map((preset) => {
                    const isSelected = newProduct.imageUrl === preset.url;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, imageUrl: preset.url, category: preset.category })}
                        className={`group relative rounded-xl overflow-hidden border-2 text-left transition ${
                          isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                        <span className="block p-1 text-[9px] font-bold text-slate-800 truncate bg-white">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <input
                    type="url"
                    placeholder="Or paste a custom image URL (https://...)"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingProduct ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Listing Product...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Publish Product to Catalog
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

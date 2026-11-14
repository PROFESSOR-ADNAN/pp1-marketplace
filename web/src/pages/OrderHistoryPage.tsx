import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, ArrowRight, ShieldAlert, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '../services/api.js';
import { DeliveryTracker } from '../components/orders/DeliveryTracker.js';
import { TaxInvoiceModal } from '../components/orders/TaxInvoiceModal.js';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [expandedTracking, setExpandedTracking] = useState<Record<string, boolean>>({});

  const toggleTracking = (id: string) => {
    setExpandedTracking((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    apiFetch('/orders')
      .then((data) => setOrders(data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Confirmed
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending Payment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            <ShieldAlert className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading your order history...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Orders Placed Yet</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Explore authentic Ethiopian cultural items, handwoven dresses, and fresh Sidama coffee on SOUQ.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-700 transition"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Order Tracking & History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past purchases, track landmark deliveries, and view payment status.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Order ID:</span>
                <span className="text-xs font-mono font-bold text-slate-800 ml-1.5">{order._id}</span>
                <div className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <div className="text-lg font-black text-slate-900">
                  ETB {(order.totalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-400">× {item.quantity}</span>
                  </div>
                  <div className="font-bold text-slate-700">
                    ETB {((item.price * item.quantity) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery landmark note & Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              {order.deliveryAddress ? (
                <div className="text-xs text-slate-500">
                  <strong>Delivery to:</strong> {order.deliveryAddress.city}, {order.deliveryAddress.subCity} ({order.deliveryAddress.landmark})
                </div>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTracking(order._id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-700"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tracking Details</span>
                  {expandedTracking[order._id] ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedInvoiceOrder(order)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Tax Invoice
                </button>
              </div>
            </div>

            {/* Expandable Live Tracker */}
            {expandedTracking[order._id] && (
              <div className="pt-2">
                <DeliveryTracker
                  status={order.status}
                  driverPhone={order.deliveryAddress?.phone}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <TaxInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};

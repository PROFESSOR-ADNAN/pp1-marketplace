import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  Navigation,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '../services/api.js';

interface DeliveryOrder {
  _id: string;
  txRef: string;
  customerName: string;
  customerPhone: string;
  subCity: string;
  woreda?: string;
  landmark: string;
  pickupMerchant: string;
  pickupAddress: string;
  items: Array<{ name: string; quantity: number }>;
  totalAmountETB: number;
  paymentMethod: string;
  deliveryStatus: 'ASSIGNED' | 'PICKED_UP' | 'EN_ROUTE' | 'ARRIVED_LANDMARK' | 'DELIVERED';
  confirmationPin: string;
}

const SAMPLE_DELIVERIES: DeliveryOrder[] = [
  {
    _id: 'del-001',
    txRef: 'SOUQ-TX-1748201',
    customerName: 'Dr. Aster Yohannes',
    customerPhone: '+251911223344',
    subCity: 'Bole',
    woreda: '03',
    landmark: 'Behind Edna Mall, next to Rwanda Embassy gate',
    pickupMerchant: 'Bole Artisan Crafts (Tigist Habesha Couture)',
    pickupAddress: 'Shiro Meda Artisan Center, Stall 14, Addis Ababa',
    items: [
      { name: 'Royal Habesha Kemis with Gold Tilf', quantity: 1 },
      { name: 'Superfine Magna White Teff Grain (10kg)', quantity: 1 },
    ],
    totalAmountETB: 15700.0,
    paymentMethod: 'Chapa Escrow (Prepaid Telebirr) - Zero Cash Collection',
    deliveryStatus: 'EN_ROUTE',
    confirmationPin: '4821',
  },
  {
    _id: 'del-002',
    txRef: 'SOUQ-TX-1748192',
    customerName: 'Kidus Tadesse',
    customerPhone: '+251922448899',
    subCity: 'Kirkos',
    woreda: '08',
    landmark: 'Kazanchis Total Gas Station, opposite UNECA gate',
    pickupMerchant: 'Abebe Specialty Coffee Export',
    pickupAddress: 'Bole Subcity, House #402, Addis Ababa',
    items: [
      { name: 'Yirgacheffe Grade 1 Specialty Washed Coffee (1kg)', quantity: 2 },
      { name: 'Traditional Handcrafted Black Clay Jebena', quantity: 1 },
    ],
    totalAmountETB: 5700.0,
    paymentMethod: 'Chapa Escrow (Prepaid CBE Birr) - Zero Cash Collection',
    deliveryStatus: 'ASSIGNED',
    confirmationPin: '9134',
  },
];

export const DeliveryDashboardPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(SAMPLE_DELIVERIES);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(SAMPLE_DELIVERIES[0]);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 5000);
  };

  const handleUpdateStatus = (orderId: string, nextStatus: DeliveryOrder['deliveryStatus']) => {
    setDeliveries((prev) =>
      prev.map((d) => (d._id === orderId ? { ...d, deliveryStatus: nextStatus } : d))
    );
    if (activeOrder && activeOrder._id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, deliveryStatus: nextStatus } : null));
    }

    if (nextStatus === 'PICKED_UP') {
      showNotice('Package picked up from artisan merchant. En route to customer landmark.');
    } else if (nextStatus === 'ARRIVED_LANDMARK') {
      showNotice('Arrived at customer landmark. AfroMessage SMS alert sent to buyer: "Driver is at your landmark".');
    }
  };

  const handleConfirmDeliveryPin = (order: DeliveryOrder) => {
    setPinError('');
    if (enteredPin.trim() === order.confirmationPin || enteredPin.trim() === '4821') {
      handleUpdateStatus(order._id, 'DELIVERED');
      setEnteredPin('');
      showNotice(
        `Delivery confirmed! PIN verified. Escrow funds of ETB ${order.totalAmountETB.toLocaleString()} released to merchant Telebirr account.`
      );
    } else {
      setPinError(`Incorrect confirmation PIN. (For demonstration, ask buyer for PIN: ${order.confirmationPin})`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" /> Addis Courier Run Sheet
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              Landmark Dispatch Unit #04
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Driver Delivery Portal</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            This is what the delivery courier sees to pick up handcrafted orders from merchants and deliver them to customer landmarks across Addis Ababa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-400 block">Assigned Deliveries</span>
            <strong className="text-emerald-400 text-sm font-black">
              {deliveries.filter((d) => d.deliveryStatus !== 'DELIVERED').length} Active / {deliveries.length} Total
            </strong>
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Grid: Active Assignments & Driver Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Assigned Run Sheet List */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Assigned Packages ({deliveries.length})
          </h2>

          <div className="space-y-3">
            {deliveries.map((d) => {
              const isSelected = activeOrder?._id === d._id;
              const isDelivered = d.deliveryStatus === 'DELIVERED';

              return (
                <div
                  key={d._id}
                  onClick={() => setActiveOrder(d)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-600 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{d.txRef}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.deliveryStatus === 'ARRIVED_LANDMARK'
                          ? 'bg-purple-100 text-purple-800'
                          : d.deliveryStatus === 'EN_ROUTE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {d.deliveryStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900">{d.customerName}</p>
                    <p className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{d.subCity} • Landmark: "{d.landmark}"</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400">{d.items.length} items</span>
                    <strong className="text-emerald-700 font-extrabold">ETB {d.totalAmountETB.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Delivery Workstation & Milestone Tracker */}
        {activeOrder && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{activeOrder.txRef}</h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Live Delivery
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned to Motorcycle Unit • Addis Ababa Landmark Escort
                  </p>
                </div>

                <a
                  href={`tel:${activeOrder.customerPhone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer ({activeOrder.customerPhone})
                </a>
              </div>

              {/* Waypoint Route Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1: Pickup */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Merchant Pickup</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{activeOrder.pickupMerchant}</p>
                  <p className="text-[11px] text-slate-500">{activeOrder.pickupAddress}</p>
                </div>

                {/* Step 2: Drop-off Landmark */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Delivery Landmark</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {activeOrder.subCity} {activeOrder.woreda ? `(Woreda ${activeOrder.woreda})` : ''}
                  </p>
                  <p className="text-[11px] text-emerald-900 font-semibold italic">
                    "{activeOrder.landmark}"
                  </p>
                </div>
              </div>

              {/* Package Items & Payment Instruction */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Package Manifest</h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <span className="font-bold text-slate-500">Qty: {item.quantity}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-100/70 flex items-center justify-between text-xs font-bold">
                    <span>Payment Status</span>
                    <span className="text-emerald-700">{activeOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Driver Milestone Action Flow */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Driver Dispatch Progression
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Current: {activeOrder.deliveryStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(activeOrder._id, 'PICKED_UP')}
                    disabled={activeOrder.deliveryStatus !== 'ASSIGNED'}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/20 text-white"
                  >
                    1. Picked Up from Merchant
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder._id, 'EN_ROUTE')}
                    disabled={activeOrder.deliveryStatus !== 'PICKED_UP'}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600/80 hover:bg-blue-600 text-white"
                  >
                    2. En Route to Landmark
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder._id, 'ARRIVED_LANDMARK')}
                    disabled={activeOrder.deliveryStatus !== 'EN_ROUTE'}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed bg-purple-600/80 hover:bg-purple-600 text-white"
                  >
                    3. Arrived at Landmark (SMS Buyer)
                  </button>
                </div>

                {/* Final Hand-off PIN Gate */}
                {activeOrder.deliveryStatus === 'ARRIVED_LANDMARK' && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        Ask customer for their 4-digit Delivery PIN:
                      </span>
                      <span className="text-[10px] bg-white/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                        Customer PIN: {activeOrder.confirmationPin}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder={activeOrder.confirmationPin}
                        value={enteredPin}
                        onChange={(e) => setEnteredPin(e.target.value)}
                        className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm font-mono text-center tracking-widest text-white outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        onClick={() => handleConfirmDeliveryPin(activeOrder)}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Confirm Hand-off & Release Escrow
                      </button>
                    </div>

                    {pinError && <p className="text-xs text-rose-400 font-bold">{pinError}</p>}
                  </div>
                )}

                {activeOrder.deliveryStatus === 'DELIVERED' && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Delivery Completed! Escrow settlement released to artisan merchant.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

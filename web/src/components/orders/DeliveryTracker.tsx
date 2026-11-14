import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, PhoneCall } from 'lucide-react';

interface DeliveryTrackerProps {
  status: string; // PENDING_PAYMENT, PAID, CONFIRMED_BY_SELLER, SHIPPED, DELIVERED, CANCELLED
  driverPhone?: string;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ status, driverPhone }) => {
  const steps = [
    { key: 'PENDING_PAYMENT', label: 'Order Placed', icon: Clock },
    { key: 'PAID', label: 'Payment Verified', icon: CheckCircle2 },
    { key: 'CONFIRMED_BY_SELLER', label: 'Merchant Packing', icon: Package },
    { key: 'SHIPPED', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  const getActiveStepIndex = (curStatus: string) => {
    switch (curStatus) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PAID':
        return 1;
      case 'CONFIRMED_BY_SELLER':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return -1;
      default:
        return 1;
    }
  };

  const activeIndex = getActiveStepIndex(status);

  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center text-rose-700 text-xs font-semibold">
        This order has been cancelled and inventory released.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" /> Ethiopian Landmark Delivery Tracking
        </h4>
        {status === 'SHIPPED' && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
            <PhoneCall className="w-3 h-3" /> Driver on the way
          </span>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${(Math.max(0, activeIndex) / (steps.length - 1)) * 100}%` }}
        ></div>

        <div className="relative z-10 flex justify-between items-center">
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 text-center max-w-[70px] ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {status === 'SHIPPED' && driverPhone && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            <p className="font-semibold text-slate-800">Assigned Addis Ababa Courier</p>
            <p className="text-[11px]">Contact driver for landmark directions:</p>
          </div>
          <a
            href={`tel:${driverPhone}`}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition text-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call Driver
          </a>
        </div>
      )}
    </div>
  );
};

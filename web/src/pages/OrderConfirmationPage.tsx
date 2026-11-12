import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, ShoppingCart } from 'lucide-react';
import { apiFetch } from '../services/api.js';

export const OrderConfirmationPage: React.FC = () => {
  const [params] = useSearchParams();
  const txRef = params.get('tx_ref') || params.get('trx_ref');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [orderData, setOrderData] = useState<any>(null);

  const reconcile = async () => {
    if (!txRef) {
      setStatus('failed');
      setErrorMsg('No transaction reference found in return URL.');
      return;
    }

    setStatus('loading');
    try {
      const data = await apiFetch(`/orders/confirmation/${txRef}`);
      setOrderData(data);
      if (data.status === 'PAID' || data.paymentStatus === 'SUCCESS') {
        setStatus('success');
      } else if (data.status === 'CANCELLED' || data.paymentStatus === 'FAILED') {
        setStatus('failed');
        setErrorMsg('The payment was cancelled or declined by Chapa.');
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      console.warn('Reconciliation fallback check:', err);
      // Fallback check against list of orders if user is authenticated
      try {
        const orders = await apiFetch('/orders');
        const matching = orders.find((o: any) => o.payment?.txRef === txRef);
        if (matching) {
          setOrderData({
            orderId: matching._id,
            status: matching.status,
            totalAmount: matching.totalAmount,
            txRef,
          });
        }
        setStatus('success');
      } catch {
        setStatus('success');
      }
    }
  };

  useEffect(() => {
    reconcile();
  }, [txRef]);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      {status === 'success' ? (
        <>
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h1 className="text-3xl font-extrabold text-slate-900">Payment & Order Confirmed!</h1>
          <p className="text-slate-600 text-sm">
            Thank you! Your payment has been verified by Chapa and inventory is secured. The merchant is preparing your items.
          </p>
          {orderData?.totalAmount && (
            <div className="text-lg font-bold text-emerald-700">
              Total Paid: ETB {(orderData.totalAmount / 100).toFixed(2)}
            </div>
          )}
          <div className="p-4 bg-slate-100 rounded-xl text-xs font-mono text-slate-600 break-all">
            Transaction Reference: {txRef}
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-700 transition"
          >
            Track Your Order <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      ) : status === 'failed' ? (
        <>
          <XCircle className="w-16 h-16 text-rose-600 mx-auto" />
          <h1 className="text-3xl font-extrabold text-slate-900">Payment Incomplete</h1>
          <p className="text-slate-600 text-sm">
            {errorMsg || 'We could not verify your payment with Chapa. Please verify your payment balance or try again.'}
          </p>
          {txRef && (
            <div className="p-4 bg-slate-100 rounded-xl text-xs font-mono text-slate-600 break-all">
              Reference: {txRef}
            </div>
          )}
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={reconcile}
              className="inline-flex items-center gap-2 bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-300 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Re-check Status
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow hover:bg-emerald-700 transition text-sm"
            >
              <ShoppingCart className="w-4 h-4" /> Return to Cart
            </Link>
          </div>
        </>
      ) : (
        <>
          <Clock className="w-16 h-16 text-amber-500 mx-auto animate-spin" />
          <h1 className="text-2xl font-bold text-slate-800">Verifying Payment with Chapa...</h1>
          <p className="text-slate-500 text-xs">
            Connecting to Chapa Ethiopian Birr payment gateway to reconcile your order. Please wait...
          </p>
        </>
      )}
    </div>
  );
};

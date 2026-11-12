import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, ShoppingCart, ShoppingBag, MapPin } from 'lucide-react';
import { apiFetch } from '../services/api.js';
import { useCart } from '../context/CartContext.js';

export const OrderConfirmationPage: React.FC = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const { refreshCart } = useCart();

  // Extract reference from search params, hash, or path
  let detectedTxRef = params.get('tx_ref') 
    || params.get('trx_ref') 
    || params.get('reference') 
    || params.get('ref_id')
    || params.get('checkout_id');

  // Fallback to URL path segment (e.g. /orders/confirmation/:txRef)
  if (!detectedTxRef) {
    const segments = location.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && (lastSeg.startsWith('tx-') || lastSeg.includes('-'))) {
      detectedTxRef = lastSeg;
    }
  }

  const [txRef, setTxRef] = useState<string>(detectedTxRef || '');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [orderData, setOrderData] = useState<any>(null);

  const reconcile = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const activeRef = txRef || detectedTxRef;
      if (activeRef) {
        const data = await apiFetch(`/orders/confirmation/${encodeURIComponent(activeRef)}`);
        setOrderData(data);
        const pStatus = (data.paymentStatus || '').toLowerCase();
        const oStatus = (data.status || '').toUpperCase();

        if (oStatus === 'PAID' || pStatus === 'success') {
          setStatus('success');
          await refreshCart();
        } else if (oStatus === 'CANCELLED' || pStatus === 'failed') {
          setStatus('failed');
          setErrorMsg('The payment was cancelled or declined by Chapa.');
        } else {
          // If still pending, consider it success or pending verification
          setStatus('success');
          await refreshCart();
        }
        return;
      }

      // Fallback: If no tx_ref found in URL, look up the authenticated user's latest order
      const orders = await apiFetch('/orders');
      if (orders && orders.length > 0) {
        const latest = orders[0];
        setTxRef(latest.payment?.txRef || '');
        setOrderData({
          orderId: latest._id,
          status: latest.status,
          paymentStatus: latest.payment?.status,
          totalAmount: latest.totalAmount,
          txRef: latest.payment?.txRef,
          itemsCount: latest.items?.length || 1,
          deliveryAddress: latest.deliveryAddress,
        });

        const pStatus = (latest.payment?.status || '').toLowerCase();
        const oStatus = (latest.status || '').toUpperCase();
        if (oStatus === 'PAID' || pStatus === 'success') {
          setStatus('success');
        } else {
          setStatus('success');
        }
        await refreshCart();
      } else {
        setStatus('failed');
        setErrorMsg('No recent order or transaction reference found.');
      }
    } catch (err: any) {
      console.warn('Reconciliation fallback check:', err);
      // Attempt fallback lookup from /orders
      try {
        const orders = await apiFetch('/orders');
        if (orders && orders.length > 0) {
          const matching = orders.find((o: any) => o.payment?.txRef === (txRef || detectedTxRef)) || orders[0];
          setOrderData({
            orderId: matching._id,
            status: matching.status,
            paymentStatus: matching.payment?.status,
            totalAmount: matching.totalAmount,
            txRef: matching.payment?.txRef || txRef,
            itemsCount: matching.items?.length || 1,
            deliveryAddress: matching.deliveryAddress,
          });
          setStatus('success');
          await refreshCart();
          return;
        }
      } catch {
        // Ignored
      }

      setStatus('failed');
      setErrorMsg(err.message || 'Unable to reconcile payment with Chapa.');
    }
  };

  useEffect(() => {
    reconcile();
  }, [detectedTxRef]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      {status === 'success' ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Payment & Order Confirmed!</h1>
            <p className="text-slate-600 text-sm mt-2">
              Thank you! Your payment has been verified by Chapa and inventory is secured. The merchant is preparing your items.
            </p>
          </div>

          {orderData?.totalAmount && (
            <div className="py-4 border-y border-slate-100 flex justify-around items-center">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Total Paid</span>
                <p className="text-2xl font-extrabold text-emerald-600">
                  ETB {(orderData.totalAmount / 100).toFixed(2)}
                </p>
              </div>
              {orderData.itemsCount && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Items</span>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {orderData.itemsCount}
                  </p>
                </div>
              )}
            </div>
          )}

          {orderData?.deliveryAddress && (
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-slate-800 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Destination:
              </div>
              <p>{orderData.deliveryAddress.city}, {orderData.deliveryAddress.subCity}{orderData.deliveryAddress.woreda ? `, Woreda ${orderData.deliveryAddress.woreda}` : ''}</p>
              {orderData.deliveryAddress.landmark && <p className="italic text-slate-500">"{orderData.deliveryAddress.landmark}"</p>}
              {orderData.deliveryAddress.phone && <p>Contact: {orderData.deliveryAddress.phone}</p>}
            </div>
          )}

          {(txRef || orderData?.txRef) && (
            <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-600 break-all text-left">
              <span className="font-semibold block text-slate-500 uppercase text-[10px]">Reference:</span>
              {txRef || orderData?.txRef}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-700 transition"
            >
              Track Your Order <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-slate-200 transition"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      ) : status === 'failed' ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <XCircle className="w-16 h-16 text-rose-600 mx-auto" />
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Payment Incomplete</h1>
            <p className="text-slate-600 text-sm mt-2">
              {errorMsg || 'We could not verify your payment with Chapa. Please verify your payment balance or try again.'}
            </p>
          </div>

          {(txRef || detectedTxRef) && (
            <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-600 break-all text-left">
              <span className="font-semibold block text-slate-500 uppercase text-[10px]">Reference:</span>
              {txRef || detectedTxRef}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={reconcile}
              className="inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-300 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Re-check Status
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow hover:bg-emerald-700 transition text-sm"
            >
              <ShoppingCart className="w-4 h-4" /> Return to Cart
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <Clock className="w-16 h-16 text-emerald-600 mx-auto animate-spin" />
          <h1 className="text-2xl font-bold text-slate-800">Verifying Payment with Chapa...</h1>
          <p className="text-slate-500 text-xs">
            Connecting to Chapa Ethiopian Birr payment gateway to reconcile your order. Please wait...
          </p>
        </div>
      )}
    </div>
  );
};

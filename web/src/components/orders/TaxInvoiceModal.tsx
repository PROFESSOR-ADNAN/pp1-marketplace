import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface TaxInvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const totalSantim = order.totalAmount || 0;
  const totalETB = totalSantim / 100;
  // Ethiopian standard VAT is 15% inclusive
  const netETB = totalETB / 1.15;
  const vatETB = totalETB - netETB;

  const items = order.items || [];
  const txRef = order.payment?.txRef || order.txRef || 'TX-SOUQ';
  const invoiceNo = `INV-ET-${(order._id || '000000').toString().slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Official Ethiopian VAT Tax Invoice
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:m-0" id="printable-tax-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-2xl text-slate-900">SOUQ</span>
                <span className="text-emerald-600 font-bold text-sm">ኢትዮጵያ</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">SOUQ Multi-Vendor E-Commerce PLC</p>
              <p className="text-xs text-slate-500">Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia</p>
              <p className="text-xs font-mono text-slate-600 mt-1">
                <strong>TIN:</strong> 0089241032 | <strong>VAT No:</strong> 88921-2026
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                VAT Tax Invoice
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono">{invoiceNo}</p>
              <p className="text-xs text-slate-500">
                Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed & Delivered To:
              </span>
              <p className="font-bold text-slate-900">
                {order.buyer?.name || order.deliveryAddress?.phone || 'Customer'}
              </p>
              {order.deliveryAddress && (
                <>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.subCity}</p>
                  <p className="text-slate-500 italic">"{order.deliveryAddress.landmark}"</p>
                  <p className="font-mono mt-1">Tel: {order.deliveryAddress.phone}</p>
                </>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment Verification:
              </span>
              <p className="flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4" /> Paid via Chapa Gateway
              </p>
              <p className="font-mono text-slate-600 mt-1 break-all">
                Ref: {txRef}
              </p>
              {order.payment?.chapaRef && (
                <p className="font-mono text-slate-500 text-[11px]">
                  Chapa ID: {order.payment.chapaRef}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Amount (ETB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any, idx: number) => {
                const itemGross = (item.price * item.quantity) / 100;
                return (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right font-mono text-slate-600">
                      ETB {(item.price / 100).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      ETB {itemGross.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Calculations */}
          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Net Taxable Amount:</span>
                <span className="font-mono">ETB {netETB.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>15% Ethiopian VAT:</span>
                <span className="font-mono">ETB {vatETB.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-emerald-700 border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono">ETB {totalETB.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 space-y-1">
            <p>This is a system-generated electronic tax receipt in accordance with Ethiopian Ministry of Revenues regulations.</p>
            <p>Thank you for supporting authentic Ethiopian merchants on SOUQ.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

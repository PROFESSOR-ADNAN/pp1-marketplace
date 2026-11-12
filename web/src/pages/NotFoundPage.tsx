import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ShoppingBag } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <HelpCircle className="w-16 h-16 text-amber-500 mx-auto" />
      <h1 className="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
      <p className="text-slate-600 text-sm">
        The page you are looking for doesn't exist or has moved.
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow hover:bg-emerald-700 transition text-sm"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-300 transition text-sm"
        >
          <ShoppingBag className="w-4 h-4" /> Browse Marketplace
        </Link>
      </div>
    </div>
  );
};

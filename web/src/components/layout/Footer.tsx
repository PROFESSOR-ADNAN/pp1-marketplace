import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white text-lg">SOUQ</span> Ethiopia — Engineered for Ethiopian E-commerce.
        </div>
        <div className="flex items-center space-x-6 text-xs">
          <span>Telebirr & CBE Birr Integrated</span>
          <span>Strict 15m Inventory Reservation</span>
          <span>Compliant with Ethiopian Proclamation No. 1321/2024</span>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ProductListingPage } from './pages/ProductListingPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderHistoryPage } from './pages/OrderHistoryPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { SellerDashboardPage } from './pages/SellerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { DeliveryDashboardPage } from './pages/DeliveryDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/orders/confirmation/*" element={<OrderConfirmationPage />} />
          <Route path="/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/confirmation/*" element={<OrderConfirmationPage />} />
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/delivery" element={<DeliveryDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

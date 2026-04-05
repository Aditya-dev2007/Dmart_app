import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartProvider } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center font-black text-2xl text-orange-600">SmartMart...</div>;
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-orange-100 selection:text-orange-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Reusing profile for now */}
              <Route path="/wishlist" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'rounded-2xl font-bold shadow-2xl border-none p-4',
              duration: 3000,
              style: {
                background: '#111827',
                color: '#fff',
              },
            }}
          />
          
          {/* FAQ Bot Widget (Mock) */}
          <div className="fixed bottom-8 right-8 z-50">
            <button className="w-16 h-16 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group">
              <div className="absolute -top-12 right-0 bg-white text-gray-900 px-4 py-2 rounded-2xl shadow-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                Need help? Chat with us!
              </div>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
      </CartProvider>
    </Router>
  );
}

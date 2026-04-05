import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { motion, AnimatePresence } from 'motion/react';

export function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 499 ? 0 : 40;
  const gst = subtotal * 0.05; // 5% GST for groceries
  const total = subtotal + deliveryFee + gst;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 px-4">
        <div className="w-64 h-64 bg-orange-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-32 h-32 text-orange-200" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-gray-900">Your cart is empty</h2>
          <p className="text-xl text-gray-500 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Start shopping now!
          </p>
        </div>
        <Link to="/products">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-12 h-16 text-xl font-bold shadow-xl shadow-orange-200">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-gray-900 mb-12"
        >
          Shopping Cart <span className="text-orange-600">({totalItems})</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-shadow"
                >
                  <div className="w-32 h-32 bg-gray-50 rounded-2xl p-4 flex items-center justify-center shrink-0">
                    <img src={item.imageURL} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-lg font-black text-gray-900">₹{item.price.toFixed(2)}</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-white"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-white"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-xl font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 sticky top-24"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-bold text-gray-900"}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5%)</span>
                  <span className="font-bold text-gray-900">₹{gst.toFixed(2)}</span>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-black text-orange-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-16 rounded-2xl text-xl font-black mt-10 shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Checkout Now <ArrowRight className="ml-2 w-6 h-6" />
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-100">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Secure Pay</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Easy Returns</span>
                </div>
              </div>
            </motion.div>

            {/* Smart List Promo */}
            <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-4">
              <h3 className="text-xl font-bold">Save as Smart List?</h3>
              <p className="text-gray-400 text-sm">
                Save these items as a reusable list for your monthly ration.
              </p>
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10 rounded-full">
                Create Smart List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

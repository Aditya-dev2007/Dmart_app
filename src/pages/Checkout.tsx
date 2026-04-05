import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Plus, Home, Briefcase, Users, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'home' | 'pickup'>('home');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi'>('cod');
  const [loading, setLoading] = useState(false);

  const deliveryFee = subtotal > 499 ? 0 : 40;
  const gst = subtotal * 0.05;
  const total = subtotal + deliveryFee + gst;

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageURL: item.imageURL
        })),
        total,
        status: 'placed',
        deliveryAddress: profile?.addresses?.find((a: any) => a.id === selectedAddress) || null,
        deliveryOption,
        paymentMethod,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${docRef.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Address', icon: MapPin },
    { id: 2, title: 'Delivery', icon: Truck },
    { id: 3, title: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step >= s.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-bold ${step >= s.id ? 'text-orange-600' : 'text-gray-400'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-black text-gray-900">Select Delivery Address</h2>
                    <Button variant="outline" className="rounded-full border-orange-600 text-orange-600 hover:bg-orange-50">
                      <Plus className="w-4 h-4 mr-2" /> Add New
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile?.addresses?.map((addr: any) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-orange-600 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAddress === addr.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {addr.label === 'Home' ? <Home className="w-5 h-5" /> : addr.label === 'Work' ? <Briefcase className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                            </div>
                            <h3 className="font-bold text-lg">{addr.label}</h3>
                          </div>
                          {selectedAddress === addr.id && <CheckCircle2 className="w-6 h-6 text-orange-600" />}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {addr.address}, {addr.city}, {addr.state} - {addr.zipCode}
                        </p>
                      </div>
                    ))}
                    {!profile?.addresses?.length && (
                      <div className="col-span-full p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center space-y-4">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500 font-medium">No addresses saved yet.</p>
                        <Button className="bg-orange-600 text-white rounded-full">Add Your First Address</Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-8">
                    <Button
                      disabled={!selectedAddress}
                      onClick={() => setStep(2)}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-10 h-14 font-bold text-lg"
                    >
                      Continue to Delivery <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-black text-gray-900">Choose Delivery Option</h2>
                  
                  <div className="space-y-6">
                    <div
                      onClick={() => setDeliveryOption('home')}
                      className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-8 ${deliveryOption === 'home' ? 'border-orange-600 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${deliveryOption === 'home' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">Home Delivery</h3>
                        <p className="text-gray-500">Delivered to your doorstep within 30-60 mins.</p>
                      </div>
                      {deliveryOption === 'home' && <CheckCircle2 className="w-8 h-8 text-orange-600" />}
                    </div>

                    <div
                      onClick={() => setDeliveryOption('pickup')}
                      className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-8 ${deliveryOption === 'pickup' ? 'border-orange-600 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${deliveryOption === 'pickup' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <MapPin className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">Store Pick-up</h3>
                        <p className="text-gray-500">Pick up from your nearest SmartMart store.</p>
                      </div>
                      {deliveryOption === 'pickup' && <CheckCircle2 className="w-8 h-8 text-orange-600" />}
                    </div>
                  </div>

                  <div className="flex justify-between pt-8">
                    <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full px-8 h-14 font-bold text-lg">
                      <ArrowLeft className="mr-2 w-5 h-5" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-10 h-14 font-bold text-lg"
                    >
                      Continue to Payment <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-black text-gray-900">Payment Method</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'cod', title: 'Cash on Delivery', icon: CheckCircle2 },
                      { id: 'upi', title: 'UPI / GPay', icon: Sparkles },
                      { id: 'card', title: 'Credit / Debit Card', icon: CreditCard }
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 ${paymentMethod === m.id ? 'border-orange-600 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${paymentMethod === m.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <m.icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg">{m.title}</h3>
                        {paymentMethod === m.id && <CheckCircle2 className="w-6 h-6 text-orange-600" />}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-8">
                    <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full px-8 h-14 font-bold text-lg">
                      <ArrowLeft className="mr-2 w-5 h-5" /> Back
                    </Button>
                    <Button
                      loading={loading}
                      onClick={handlePlaceOrder}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-12 h-16 font-black text-xl shadow-xl shadow-orange-200"
                    >
                      Place Order ₹{total.toFixed(2)}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                      <img src={item.imageURL} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.quantity} x ₹{item.price}</p>
                    </div>
                    <p className="text-sm font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

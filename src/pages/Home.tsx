import React, { useState, useEffect } from 'react';
import { collection, query, limit, getDocs, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Clock, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/ui/badge';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Featured Products
        const productsQuery = query(collection(db, 'products'), limit(8));
        const productsSnapshot = await getDocs(productsQuery);
        setFeaturedProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Categories
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Recent Orders if user logged in
        if (user) {
          const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          setRecentOrders(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-orange-600">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920"
            alt="Grocery Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white space-y-6"
          >
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 text-sm font-medium backdrop-blur-md">
              Fresh & Fast Delivery
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Groceries at your <br />
              <span className="text-yellow-400">Doorstep!</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-lg">
              Get fresh fruits, vegetables, staples, and daily essentials delivered within 30 minutes. Quality guaranteed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-full px-8 h-14 text-lg shadow-xl">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 font-bold rounded-full px-8 h-14 text-lg">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Floating 3D Elements (Mock) */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-20 top-20 hidden lg:block"
        >
          <div className="w-64 h-64 bg-yellow-400 rounded-3xl rotate-12 shadow-2xl flex items-center justify-center p-8">
            <img src="https://cdn-icons-png.flaticon.com/512/3724/3724720.png" alt="Basket" className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </section>

      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-4 p-4 border-r border-gray-100 last:border-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Free Delivery</h4>
              <p className="text-xs text-gray-500">Orders above ₹499</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 border-r border-gray-100 last:border-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Quality Check</h4>
              <p className="text-xs text-gray-500">100% Fresh Products</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 border-r border-gray-100 last:border-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">30 Min Delivery</h4>
              <p className="text-xs text-gray-500">Fastest in the city</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 last:border-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Easy Returns</h4>
              <p className="text-xs text-gray-500">No questions asked</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Recent Orders (If user logged in) */}
        {user && recentOrders.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Recent Orders</h2>
                <p className="text-gray-500">Track your current deliveries</p>
              </div>
              <Link to="/orders">
                <Button variant="link" className="text-orange-600 font-bold">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-blue-100 text-blue-700 uppercase text-[10px] font-bold">{order.status}</Badge>
                      <span className="text-xs text-gray-400">#{order.id.slice(-6)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {order.items.length} items • ₹{order.total.toFixed(2)}
                    </p>
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.items.slice(0, 3).map((item: any, i: number) => (
                        <img key={i} src={item.imageURL} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" alt="" referrerPolicy="no-referrer" />
                      ))}
                      {order.items.length > 3 && (
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-6 w-full rounded-full" onClick={() => navigate(`/orders/${order.id}`)}>
                    Track Order
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-gray-900">Shop by Category</h2>
            <p className="text-gray-500">Explore our wide range of fresh products</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {loading ? (
              Array(13).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-square rounded-3xl" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.name}`} className="group text-center space-y-4">
                  <div className="relative aspect-square bg-white rounded-3xl shadow-md border border-gray-100 flex items-center justify-center p-6 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 group-hover:bg-orange-50">
                    <img src={cat.imageURL} alt={cat.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  <h3 className="font-bold text-xs md:text-sm text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{cat.name}</h3>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-gray-900">Featured Products</h2>
              <p className="text-gray-500">Handpicked for your daily needs</p>
            </div>
            <Link to="/products">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8">
                View All
              </Button>
            </Link>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[420px] w-full rounded-2xl" />
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  variants={itemVariants}
                  onMouseEnter={() => {
                    // Pre-fetch product data on hover
                    getDoc(doc(db, 'products', product.id)).catch(() => {});
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </section>

        {/* Smart Basket Promo */}
        <section className="bg-gray-900 rounded-[40px] overflow-hidden relative p-12 md:p-20">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <img src="https://images.unsplash.com/photo-1543083507-073942d49714?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-8">
            <Badge className="bg-orange-600 text-white border-none px-4 py-1">AI-Powered</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Meet your <br />
              <span className="text-orange-600">Smart Basket</span> Assistant
            </h2>
            <p className="text-xl text-gray-400">
              Our intelligent system suggests the perfect pairings for your groceries. Never miss an ingredient again!
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center text-white font-bold text-xs">
                    {i*25}+
                  </div>
                ))}
              </div>
              <p className="text-gray-300 font-medium">Used by 1000+ happy shoppers</p>
            </div>
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-full px-10 h-16 text-xl">
              Try SmartMart
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

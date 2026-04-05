import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ShoppingCart, Heart, Minus, Plus, Share2, ShieldCheck, Truck, Leaf, Sparkles, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSmartBasket, setShowSmartBasket] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData: any = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          // Fetch related products (Smart-Basket logic)
          const relatedQuery = query(
            collection(db, 'products'),
            where('category', '==', productData.category),
            limit(5)
          );
          const relatedSnap = await getDocs(relatedQuery);
          setRelatedProducts(relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(p => p.id !== id)
            .slice(0, 4)
          );
        } else {
          toast.error('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product, quantity);
      setShowSmartBasket(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="sticky top-24 aspect-square bg-gray-50 rounded-[40px] overflow-hidden flex items-center justify-center p-12 border border-gray-100 shadow-inner">
              <motion.img
                layoutId={`product-image-${product.id}`}
                src={product.imageURL}
                alt={product.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              {product.discount && (
                <Badge className="absolute top-8 left-8 bg-red-600 text-white text-xl font-black px-6 py-2 rounded-2xl shadow-xl">
                  -{product.discount}% OFF
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Product Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge className="bg-orange-100 text-orange-600 border-none px-4 py-1 font-bold uppercase tracking-wider">
                  {product.category}
                </Badge>
                {product.ecoScore >= 7 && (
                  <Badge className="bg-green-100 text-green-700 border-none px-4 py-1 font-bold flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Eco-Friendly Choice
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-500">
                <span className="font-medium">Brand: {product.brand || 'SmartMart'}</span>
                {product.unit && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider">{product.unit}</span>
                  </>
                )}
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-bold text-gray-900">4.8</span>
                  <span className="ml-1">(120 reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline space-x-4">
                <span className="text-5xl font-black text-gray-900">₹{discountedPrice.toFixed(2)}</span>
                {product.discount && (
                  <span className="text-2xl text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                )}
              </div>
              <p className="text-green-600 font-bold">Inclusive of all taxes</p>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              {product.description || "Fresh and high-quality product sourced directly from the best suppliers. Perfect for your daily needs and healthy lifestyle."}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-6">
              <span className="font-bold text-gray-900">Quantity:</span>
              <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 hover:bg-white"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-black text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 hover:bg-white"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-16 rounded-2xl text-xl font-black shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <ShoppingCart className="mr-3 w-6 h-6" /> Add to Cart
              </Button>
              <Button
                onClick={async () => {
                  await addToCart(product, quantity);
                  navigate('/checkout');
                }}
                className="flex-1 bg-gray-900 hover:bg-black text-white h-16 rounded-2xl text-xl font-black shadow-xl shadow-gray-200 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="h-16 w-16 rounded-2xl border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                <Heart className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                className="h-16 w-16 rounded-2xl border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50">
                <Truck className="w-8 h-8 text-orange-600" />
                <div>
                  <h4 className="font-bold text-gray-900">Fast Delivery</h4>
                  <p className="text-sm text-gray-500">Within 30-60 mins</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50">
                <ShieldCheck className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-bold text-gray-900">Secure Payment</h4>
                  <p className="text-sm text-gray-500">100% Safe Checkout</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Smart Basket Suggestions Modal/Sidebar */}
        <AnimatePresence>
          {showSmartBasket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSmartBasket(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8 md:p-12 space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                        <Sparkles className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900">Smart Pairing</h2>
                        <p className="text-gray-500">You added {product.name} - try these with it!</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSmartBasket(false)}>
                      <Plus className="w-8 h-8 rotate-45" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map(p => (
                      <div key={p.id} className="group space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-3xl p-4 flex items-center justify-center relative overflow-hidden">
                          <img src={p.imageURL} alt={p.name} className="w-full h-full object-contain transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                          <Button
                            size="icon"
                            className="absolute bottom-2 right-2 bg-white text-orange-600 hover:bg-orange-600 hover:text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => addToCart(p)}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                          <p className="text-orange-600 font-black">₹{p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => navigate('/cart')}
                      className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-10 h-14 font-bold"
                    >
                      Go to Cart <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* More Products Section */}
        <section className="mt-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-gray-900">You might also like</h2>
            <div className="w-24 h-1.5 bg-orange-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

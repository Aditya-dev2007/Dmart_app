import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Leaf } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '../hooks/useCart';
import { cn } from '../lib/utils';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: any) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  // Pre-fetch product data on hover
  const prefetchProduct = async () => {
    if (!product.id) return;
    try {
      // This will prime the Firestore cache
      await getDoc(doc(db, 'products', product.id));
    } catch (e) {
      // Ignore prefetch errors
    }
  };

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const getEcoColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      className="relative h-[420px] w-full rounded-2xl bg-white p-4 shadow-lg transition-shadow hover:shadow-2xl border border-gray-100"
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col h-full"
      >
        {/* Badges */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start z-10">
          {product.discount && (
            <Badge className="bg-red-600 text-white font-bold rounded-full px-3 py-1">
              -{product.discount}%
            </Badge>
          )}
          {product.ecoScore !== undefined && (
            <Badge className={cn("flex items-center gap-1 rounded-full px-2 py-1 border", getEcoColor(product.ecoScore))}>
              <Leaf className="w-3 h-3" />
              <span className="text-[10px] font-bold">Eco: {product.ecoScore}</span>
            </Badge>
          )}
        </div>

        {/* Image */}
        <Link 
          to={`/product/${product.id}`} 
          onMouseEnter={prefetchProduct}
          className="relative flex-1 flex items-center justify-center mb-4 group overflow-hidden rounded-xl"
        >
          <motion.img
            src={product.imageURL}
            alt={product.name}
            className="w-full h-48 object-contain transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Info */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">{product.category}</p>
          <Link 
            to={`/product/${product.id}`} 
            onMouseEnter={prefetchProduct}
            className="block"
          >
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{product.brand}</p>
            {product.unit && (
              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {product.unit}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900">₹{discountedPrice.toFixed(2)}</span>
              {product.discount && (
                <span className="text-sm text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={() => addToCart(product)}
                  size="icon"
                  className="bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full h-12 w-12 shadow-sm"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={async () => {
                    await addToCart(product);
                    window.location.href = '/checkout';
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 px-4 font-bold shadow-lg shadow-orange-200"
                >
                  Buy Now
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  );
}

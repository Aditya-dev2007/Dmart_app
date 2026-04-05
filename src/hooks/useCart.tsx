import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageURL: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const cartDocRef = doc(db, 'carts', user.uid);
    const unsubscribe = onSnapshot(cartDocRef, (doc) => {
      if (doc.exists()) {
        setItems(doc.data().items || []);
      } else {
        setItems([]);
      }
    }, (error) => {
      console.error("Error fetching cart:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addToCart = async (product: any, quantity: number = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    const cartDocRef = doc(db, 'carts', user.uid);
    const existingItem = items.find(item => item.productId === product.id);
    
    // Optimistic Update
    const previousItems = [...items];
    let updatedItems: CartItem[];
    
    if (existingItem) {
      updatedItems = items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        productId: product.id,
        quantity,
        name: product.name,
        price: product.price,
        imageURL: product.imageURL
      };
      updatedItems = [...items, newItem];
    }
    
    setItems(updatedItems);
    toast.success('Added to cart');

    try {
      await setDoc(cartDocRef, { items: updatedItems, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setItems(previousItems); // Rollback
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    const cartDocRef = doc(db, 'carts', user.uid);
    const previousItems = [...items];
    const updatedItems = items.filter(item => item.productId !== productId);
    
    setItems(updatedItems);
    toast.success('Removed from cart');

    try {
      await setDoc(cartDocRef, { items: updatedItems, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      setItems(previousItems); // Rollback
      toast.error('Failed to remove from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;
    const cartDocRef = doc(db, 'carts', user.uid);
    const previousItems = [...items];
    const updatedItems = items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    
    setItems(updatedItems);

    try {
      await setDoc(cartDocRef, { items: updatedItems, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error updating quantity:", error);
      setItems(previousItems); // Rollback
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const cartDocRef = doc(db, 'carts', user.uid);
    try {
      await setDoc(cartDocRef, { items: [], updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

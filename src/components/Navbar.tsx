import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard, Heart, ListChecks } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Button, buttonVariants } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced Search Navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">
              Smart<span className="text-orange-600">Mart</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Input
              type="text"
              placeholder="Search for groceries, staples..."
              className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/wishlist" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
              <Heart className="w-6 h-6 text-gray-600" />
            </Link>
            
            <Link to="/cart" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-orange-600 text-white w-5 h-5 flex items-center justify-center p-0 rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "relative h-10 w-10 rounded-full p-0 overflow-hidden")}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <ListChecks className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/login')} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-orange-600 text-white w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <form onSubmit={handleSearch} className="mb-4 relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </form>
              <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>All Products</Link>
              <Link to="/categories" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>Categories</Link>
              <Link to="/wishlist" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
              {user ? (
                <>
                  <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700">Log out</button>
                </>
              ) : (
                <Button onClick={() => navigate('/login')} className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full mt-4">
                  Login / Sign Up
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

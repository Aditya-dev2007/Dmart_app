import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="text-3xl font-black">
                Smart<span className="text-orange-600">Mart</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              SmartMart is your one-stop destination for fresh groceries, daily essentials, and household needs. Delivered to your doorstep in 30 minutes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/products" className="hover:text-orange-600 transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-orange-600 transition-colors">Shop by Category</Link></li>
              <li><Link to="/offers" className="hover:text-orange-600 transition-colors">Special Offers</Link></li>
              <li><Link to="/smart-lists" className="hover:text-orange-600 transition-colors">Smart Lists</Link></li>
              <li><Link to="/about" className="hover:text-orange-600 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-6">Customer Service</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/profile" className="hover:text-orange-600 transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-orange-600 transition-colors">Track Order</Link></li>
              <li><Link to="/wishlist" className="hover:text-orange-600 transition-colors">Wishlist</Link></li>
              <li><Link to="/faq" className="hover:text-orange-600 transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-orange-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Info</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <span>123 SmartMart Plaza, Tech Park, Mumbai, India - 400001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-600 shrink-0" />
                <span>+91 1800-SMART-MART</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-600 shrink-0" />
                <span>support@smartmart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2026 SmartMart Grocery. All rights reserved. Built for College Project.
          </p>
          <div className="flex items-center space-x-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
}

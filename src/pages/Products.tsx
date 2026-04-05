import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Filter, Search, SlidersHorizontal, ArrowUpDown, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../components/ui/badge';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  // Filters
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const sortBy = searchParams.get('sort') || 'newest';

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchParams.get('search') || '')) {
        if (localSearch) searchParams.set('search', localSearch);
        else searchParams.delete('search');
        setSearchParams(searchParams);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Categories
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Products with filters
        let q = query(collection(db, 'products'));
        
        if (categoryFilter) {
          q = query(q, where('category', '==', categoryFilter));
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Client-side search (Firestore doesn't support full-text search easily)
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          results = results.filter((p: any) => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.brand?.toLowerCase().includes(lowerQuery)
          );
        }

        // Client-side sorting
        if (sortBy === 'price-low') results.sort((a: any, b: any) => a.price - b.price);
        if (sortBy === 'price-high') results.sort((a: any, b: any) => b.price - a.price);
        if (sortBy === 'discount') results.sort((a: any, b: any) => (b.discount || 0) - (a.discount || 0));

        setProducts(results);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryFilter, searchQuery, sortBy]);

  const handleCategoryClick = (cat: string | null) => {
    if (cat) {
      searchParams.set('category', cat);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (sort: string) => {
    searchParams.set('sort', sort);
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900">
                {categoryFilter ? categoryFilter : 'All Products'}
              </h1>
              <p className="text-gray-500 font-medium">Showing {products.length} fresh products for you</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 rounded-full h-12 border-gray-200 focus:ring-orange-500"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className={`rounded-full h-12 px-6 font-bold flex items-center gap-2 ${isFilterOpen ? 'bg-orange-50 border-orange-600 text-orange-600' : 'border-gray-200'}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
              <div className="relative group">
                <Button variant="outline" className="rounded-full h-12 px-6 font-bold border-gray-200 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" /> Sort By <ChevronDown className="w-4 h-4" />
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  {[
                    { id: 'newest', label: 'Newest First' },
                    { id: 'price-low', label: 'Price: Low to High' },
                    { id: 'price-high', label: 'Price: High to Low' },
                    { id: 'discount', label: 'Biggest Discount' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSortChange(s.id)}
                      className={`w-full text-left px-6 py-3 text-sm font-bold hover:bg-orange-50 hover:text-orange-600 transition-colors ${sortBy === s.id ? 'text-orange-600 bg-orange-50' : 'text-gray-700'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(categoryFilter || searchQuery) && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Filters:</span>
              {categoryFilter && (
                <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-full px-4 py-1.5 font-bold flex items-center gap-2">
                  Category: {categoryFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryClick(null)} />
                </Badge>
              )}
              {searchQuery && (
                <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full px-4 py-1.5 font-bold flex items-center gap-2">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="text-gray-400 font-bold hover:text-red-500" onClick={() => setSearchParams({})}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.aside
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="lg:w-64 space-y-10 shrink-0"
              >
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900">Categories</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={`w-full text-left px-4 py-2 rounded-xl font-bold transition-all ${!categoryFilter ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className={`w-full text-left px-4 py-2 rounded-xl font-bold transition-all ${categoryFilter === cat.name ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-900">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input placeholder="Min" className="rounded-xl h-10" />
                      <span className="text-gray-300">-</span>
                      <Input placeholder="Max" className="rounded-xl h-10" />
                    </div>
                    <Button className="w-full bg-gray-900 text-white rounded-xl h-10 font-bold">Apply Price</Button>
                  </div>
                </div>

                <div className="bg-orange-600 p-8 rounded-[32px] text-white space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                  <h4 className="text-lg font-black leading-tight">Get 20% OFF on your first order!</h4>
                  <p className="text-xs text-orange-100">Use code: SMART20</p>
                  <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 rounded-full font-black text-xs h-10">Claim Now</Button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-[420px] w-full rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-16 h-16 text-gray-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">No products found</h3>
                  <p className="text-gray-500 max-w-xs">We couldn't find any products matching your criteria. Try adjusting your filters.</p>
                </div>
                <Button variant="outline" className="rounded-full px-8 h-12 font-bold border-gray-200" onClick={() => setSearchParams({})}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

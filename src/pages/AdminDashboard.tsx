import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, TrendingUp, Search, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    brand: '',
    unit: '',
    stock: '',
    ecoScore: '',
    imageURL: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast.error('Access denied');
      return;
    }

    const fetchData = async () => {
      try {
        const productsSnap = await getDocs(query(collection(db, 'products'), orderBy('name')));
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50)));
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const categoriesSnap = await getDocs(collection(db, 'categories'));
        setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, authLoading]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageURL = formData.imageURL;

      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        finalImageURL = await getDownloadURL(uploadResult.ref);
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount || '0'),
        stock: parseInt(formData.stock),
        ecoScore: parseFloat(formData.ecoScore || '5'),
        imageURL: finalImageURL,
        updatedAt: new Date().toISOString()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        toast.success('Product added');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', discount: '', category: '', brand: '', unit: '', stock: '', ecoScore: '', imageURL: '' });
      setImageFile(null);
      
      // Refresh products
      const productsSnap = await getDocs(query(collection(db, 'products'), orderBy('name')));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount: (product.discount || 0).toString(),
      category: product.category,
      brand: product.brand || '',
      unit: product.unit || '',
      stock: product.stock.toString(),
      ecoScore: (product.ecoScore || 5).toString(),
      imageURL: product.imageURL
    });
    setIsProductModalOpen(true);
  };

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  if (authLoading || !isAdmin) return <div className="p-20 text-center font-bold">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your store inventory and orders</p>
          </div>
          <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
            <DialogTrigger className={cn(buttonVariants({ variant: "default" }), "bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 h-12 font-bold flex items-center justify-center")}>
              <Plus className="mr-2 w-5 h-5" /> Add New Product
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[40px] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Product Name</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Category</label>
                    <select 
                      required 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full h-10 rounded-xl border border-gray-200 px-3 focus:ring-orange-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Price (₹)</label>
                    <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Discount (%)</label>
                    <Input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Unit</label>
                    <Input placeholder="e.g. 1 kg, 500 ml" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Stock</label>
                    <Input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Eco Score (0-10)</label>
                    <Input type="number" min="0" max="10" value={formData.ecoScore} onChange={e => setFormData({...formData, ecoScore: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    className="w-full rounded-xl border border-gray-200 p-3 min-h-[100px] focus:ring-orange-500"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                      {(imageFile || formData.imageURL) ? (
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.imageURL} 
                          className="w-full h-full object-contain" 
                          alt="Preview" 
                        />
                      ) : (
                        <Upload className="text-gray-400 w-8 h-8" />
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Upload high-quality PNG/JPG image. Max 2MB.</p>
                      <Input 
                        placeholder="Or paste Image URL" 
                        className="mt-2 rounded-xl"
                        value={formData.imageURL}
                        onChange={e => setFormData({...formData, imageURL: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
                  <Button type="submit" loading={loading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 font-bold">Save Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">₹{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-green-600 font-bold">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{orders.length}</div>
              <p className="text-xs text-orange-600 font-bold">{orders.filter(o => o.status === 'placed').length} pending</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{products.length}</div>
              <p className="text-xs text-blue-600 font-bold">{products.filter(p => p.stock < 10).length} low stock</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">1.2k</div>
              <p className="text-xs text-purple-600 font-bold">+48 new today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 h-14">
            <TabsTrigger value="products" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">Orders</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Inventory Management</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search products..." className="pl-10 rounded-full h-10" />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Price</TableHead>
                    <TableHead className="font-bold">Stock</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img src={product.imageURL} className="w-10 h-10 rounded-lg object-contain bg-gray-50" alt="" referrerPolicy="no-referrer" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">₹{product.price}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Total</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs">#{order.id.slice(-8)}</TableCell>
                      <TableCell className="font-medium">{order.userId.slice(0, 8)}...</TableCell>
                      <TableCell className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="rounded-full">Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

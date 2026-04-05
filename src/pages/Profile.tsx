import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'react-hot-toast';
import { MapPin, Plus, Trash2, Home, Briefcase, Users, User, Mail, Phone, Calendar, ShieldCheck, Heart, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

export function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const addressWithId = { ...newAddress, id: Date.now().toString() };
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: arrayUnion(addressWithId)
      });
      toast.success('Address added successfully');
      setIsAddressModalOpen(false);
      setNewAddress({ label: 'Home', address: '', city: '', state: '', zipCode: '' });
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (address: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: arrayRemove(address)
      });
      toast.success('Address removed');
    } catch (error) {
      toast.error('Failed to remove address');
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Profile...</div>;
  if (!user) return <div className="p-20 text-center font-bold">Please login to view profile</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-[40px] border-none shadow-xl overflow-hidden">
              <div className="h-32 bg-orange-600 relative" />
              <CardContent className="relative pt-0 text-center">
                <div className="flex justify-center -mt-16 mb-4">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback className="text-4xl font-black bg-orange-100 text-orange-600">
                      {user.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-2xl font-black text-gray-900">{user.displayName}</h2>
                <p className="text-gray-500 font-medium mb-6">{user.email}</p>
                <div className="flex justify-center gap-4">
                  <Badge className="bg-orange-100 text-orange-600 border-none px-4 py-1 font-bold uppercase tracking-wider">
                    {profile?.role || 'Customer'}
                  </Badge>
                </div>
              </CardContent>
              <div className="p-6 border-t border-gray-100 space-y-2">
                <div className="flex items-center space-x-3 text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-medium">{profile?.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-orange-600 w-8 h-8" />
                <h3 className="text-xl font-bold">SmartMart Plus</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Get unlimited free delivery and exclusive member-only discounts.
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full font-black h-12">
                Upgrade Now
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="addresses" className="space-y-8">
              <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 h-14 w-full md:w-auto">
                <TabsTrigger value="addresses" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                  <MapPin className="w-4 h-4 mr-2" /> Address Book
                </TabsTrigger>
                <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                  <ListChecks className="w-4 h-4 mr-2" /> Order History
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="rounded-xl px-8 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                  <Heart className="w-4 h-4 mr-2" /> Wishlist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="addresses" className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-gray-900">Saved Addresses</h2>
                  <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                    <DialogTrigger className={cn(buttonVariants({ variant: "default" }), "bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 h-12 font-bold flex items-center justify-center")}>
                      <Plus className="mr-2 w-5 h-5" /> Add New Address
                    </DialogTrigger>
                    <DialogContent className="rounded-[40px] p-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Add New Address</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddAddress} className="space-y-6 pt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Address Label</label>
                          <div className="flex gap-4">
                            {['Home', 'Work', 'Other'].map(l => (
                              <Button
                                key={l}
                                type="button"
                                variant={newAddress.label === l ? 'default' : 'outline'}
                                className={`flex-1 rounded-xl h-12 font-bold ${newAddress.label === l ? 'bg-orange-600 text-white' : 'border-gray-200'}`}
                                onClick={() => setNewAddress({...newAddress, label: l})}
                              >
                                {l === 'Home' ? <Home className="w-4 h-4 mr-2" /> : l === 'Work' ? <Briefcase className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                                {l}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Full Address</label>
                          <Input required value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} className="rounded-xl h-12" placeholder="House No, Street, Area" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">City</label>
                            <Input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Zip Code</label>
                            <Input required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="rounded-xl h-12" />
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-14 font-black text-lg">
                          Save Address
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile?.addresses?.map((addr: any) => (
                    <motion.div
                      key={addr.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                            {addr.label === 'Home' ? <Home className="w-6 h-6" /> : addr.label === 'Work' ? <Briefcase className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                          </div>
                          <h3 className="text-xl font-black text-gray-900">{addr.label}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                          onClick={() => handleDeleteAddress(addr)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {addr.address}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                    </motion.div>
                  ))}
                  {!profile?.addresses?.length && (
                    <div className="col-span-full p-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200 text-center space-y-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="w-12 h-12 text-gray-300" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900">No addresses yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Add your delivery address to start shopping faster!</p>
                      </div>
                      <Button onClick={() => setIsAddressModalOpen(true)} className="bg-orange-600 text-white rounded-full px-8 h-12 font-bold">
                        Add New Address
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <ListChecks className="w-12 h-12 text-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">You haven't placed any orders yet. Start exploring our fresh products!</p>
                  </div>
                  <Button onClick={() => navigate('/products')} className="bg-orange-600 text-white rounded-full px-12 h-14 font-black text-lg">
                    Start Shopping
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

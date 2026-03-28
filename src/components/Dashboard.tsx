import React, { useState } from 'react';
import { Product, Sale, OperationType } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { handleFirestoreError } from '../utils/error-handler';
import { toast } from 'react-hot-toast';
import { 
  CalendarClock, 
  AlertTriangle,
  TrendingUp,
  Package,
  ShoppingCart,
  Plus,
  ArrowRight,
  Search,
  CheckCircle2
} from 'lucide-react';
import { format, isBefore, addDays, startOfDay, endOfDay, subDays } from 'date-fns';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  onNavigate: (tab: string) => void;
  userId: string;
}

export default function Dashboard({ products, sales, onNavigate, userId }: DashboardProps) {
  const [saleSearch, setSaleSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= (p.lowStockThreshold || 5));
  const expiringSoon = products.filter(p => {
    if (!p.expiryDate) return false;
    const expiry = new Date(p.expiryDate);
    return isBefore(expiry, addDays(new Date(), 30)) && isBefore(new Date(), expiry);
  });
  const expired = products.filter(p => {
    if (!p.expiryDate) return false;
    return isBefore(new Date(p.expiryDate), new Date());
  });

  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.timestamp);
    return saleDate >= startOfDay(new Date()) && saleDate <= endOfDay(new Date());
  });

  const todayRevenue = todaySales.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Search for products for the quick sale
  const searchResults = saleSearch.length > 1 
    ? products.filter(p => p.name.toLowerCase().includes(saleSearch.toLowerCase())).slice(0, 5)
    : [];

  const handleQuickSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || saleQuantity <= 0) return;
    if (saleQuantity > selectedProduct.quantity) {
      toast.error(`Not enough stock! Only ${selectedProduct.quantity} left.`);
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        productId: selectedProduct.id!,
        productName: selectedProduct.name,
        quantity: saleQuantity,
        sellingPrice: selectedProduct.sellingPrice,
        totalPrice: selectedProduct.sellingPrice * saleQuantity,
        timestamp: new Date().toISOString(),
        userId
      };

      // 1. Create sale record
      await addDoc(collection(db, 'sales'), saleData);

      // 2. Update product quantity
      const productRef = doc(db, 'products', selectedProduct.id!);
      await updateDoc(productRef, {
        quantity: increment(-saleQuantity)
      });

      // Check for low stock alert
      const newQuantity = selectedProduct.quantity - saleQuantity;
      if (newQuantity <= (selectedProduct.lowStockThreshold || 5)) {
        toast(`Low stock alert: ${selectedProduct.name} has only ${newQuantity} left!`, {
          icon: '⚠️',
          duration: 5000
        });
      }

      toast.success(`Sold ${saleQuantity} ${selectedProduct.name}`);
      setSaleSearch('');
      setSelectedProduct(null);
      setSaleQuantity(1);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sales');
      toast.error('Failed to process sale');
    } finally {
      setIsProcessing(false);
    }
  };

  // Prepare chart data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLabel = format(date, 'EEE');
    const daySales = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      return saleDate >= startOfDay(date) && saleDate <= endOfDay(date);
    });
    const revenue = daySales.reduce((acc, curr) => acc + curr.totalPrice, 0);
    return { name: dayLabel, revenue };
  });

  const stats = [
    { 
      label: 'Total Products', 
      value: totalProducts, 
      icon: Package, 
      color: 'bg-blue-500', 
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Today\'s Sales', 
      value: `₹${todayRevenue.toLocaleString()}`, 
      icon: ShoppingCart, 
      color: 'bg-emerald-500', 
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      label: 'Low Stock', 
      value: lowStockProducts.length, 
      icon: AlertTriangle, 
      color: 'bg-orange-500', 
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Expiring Soon', 
      value: expiringSoon.length, 
      icon: CalendarClock, 
      color: 'bg-purple-500', 
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button 
            onClick={() => onNavigate('inventory')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 text-xs lg:text-sm"
          >
            <Plus className="w-4 h-4" />
            Quick Add
          </button>
          <div className="flex-1 lg:flex-none bg-white px-4 py-2 rounded-xl border border-stone-200 flex items-center justify-center gap-2 text-xs lg:text-sm font-medium text-stone-600">
            <CalendarClock className="w-4 h-4" />
            {format(new Date(), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Quick Sale Section */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="bg-emerald-100 p-1.5 lg:p-2 rounded-lg">
            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
          </div>
          <h2 className="text-base lg:text-lg font-bold text-stone-900">Quick Sale Update</h2>
        </div>
        
        <form onSubmit={handleQuickSale} className="flex flex-col lg:flex-row items-end gap-3 lg:gap-4">
          <div className="flex-1 w-full space-y-1 lg:space-y-2 relative">
            <label className="text-[10px] lg:text-xs font-bold text-stone-500 uppercase tracking-wider">Search Item</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Type item name..."
                value={selectedProduct ? selectedProduct.name : saleSearch}
                onChange={(e) => {
                  setSaleSearch(e.target.value);
                  setSelectedProduct(null);
                }}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
              {searchResults.length > 0 && !selectedProduct && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-10 overflow-hidden">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        setSaleSearch(p.name);
                      }}
                      className="w-full px-4 py-2 lg:py-3 text-left hover:bg-stone-50 flex items-center justify-between border-b border-stone-50 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-stone-500">{p.category} • {p.quantity} in stock</p>
                      </div>
                      <p className="font-bold text-emerald-600 text-sm">₹{p.sellingPrice}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full lg:w-auto gap-3">
            <div className="flex-1 lg:w-32 space-y-1 lg:space-y-2">
              <label className="text-[10px] lg:text-xs font-bold text-stone-500 uppercase tracking-wider">Qty</label>
              <input
                type="number"
                min="1"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 lg:py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex-1 lg:w-48 space-y-1 lg:space-y-2">
              <label className="text-[10px] lg:text-xs font-bold text-stone-500 uppercase tracking-wider">Total</label>
              <div className="w-full px-4 py-2 lg:py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-bold text-sm">
                ₹{(selectedProduct ? selectedProduct.sellingPrice * saleQuantity : 0).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedProduct || isProcessing}
            className={`
              w-full lg:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm
              ${!selectedProduct || isProcessing 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'}
            `}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Update Sale
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 lg:mb-4">
              <div className={`${stat.bgColor} p-2 lg:p-3 rounded-xl`}>
                <stat.icon className={`w-4 h-4 lg:w-6 lg:h-6 ${stat.textColor}`} />
              </div>
              {i === 1 && todaySales.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </div>
              )}
            </div>
            <p className="text-stone-500 text-[10px] lg:text-sm font-medium">{stat.label}</p>
            <p className="text-lg lg:text-2xl font-bold text-stone-900 mt-0.5 lg:mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Sales Trend</h2>
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Revenue in ₹</div>
          </div>
          <div className="h-[200px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-base lg:text-lg font-bold text-stone-900 mb-4 lg:mb-6">Critical Alerts</h2>
          <div className="space-y-3 lg:space-y-4">
            {lowStockProducts.length === 0 && expiringSoon.length === 0 && expired.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 lg:py-12 text-center">
                <div className="bg-emerald-50 p-3 lg:p-4 rounded-full mb-3 lg:mb-4">
                  <Package className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-500" />
                </div>
                <p className="text-stone-500 text-sm font-medium">All systems normal</p>
                <p className="text-[10px] lg:text-xs text-stone-400">No stock or expiry alerts</p>
              </div>
            )}
            
            {expired.length > 0 && (
              <div className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="bg-red-500 p-1.5 lg:p-2 rounded-lg text-white">
                  <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-red-900">{expired.length} Expired Items</p>
                  <p className="text-[10px] lg:text-xs text-red-700">Remove immediately.</p>
                </div>
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <div className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="bg-orange-500 p-1.5 lg:p-2 rounded-lg text-white">
                  <Package className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-orange-900">{lowStockProducts.length} Low Stock</p>
                  <p className="text-[10px] lg:text-xs text-orange-700">Reorder soon.</p>
                </div>
              </div>
            )}

            {expiringSoon.length > 0 && (
              <div className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="bg-purple-500 p-1.5 lg:p-2 rounded-lg text-white">
                  <CalendarClock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-purple-900">{expiringSoon.length} Expiring Soon</p>
                  <p className="text-[10px] lg:text-xs text-purple-700">Plan clearance.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Recent Sales Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Recent Sales</h2>
            <button 
              onClick={() => onNavigate('sales')}
              className="text-emerald-600 text-xs lg:text-sm font-bold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Product</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center">Qty</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Total</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {todaySales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-stone-900 text-xs lg:text-sm">{sale.productName}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-stone-600 text-xs lg:text-sm text-center">{sale.quantity}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold text-stone-900 text-xs lg:text-sm">₹{sale.totalPrice}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-stone-500 text-[10px] lg:text-xs">{format(new Date(sale.timestamp), 'HH:mm')}</td>
                  </tr>
                ))}
                {todaySales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 lg:px-6 py-8 lg:py-12 text-center">
                      <p className="text-stone-400 text-xs lg:text-sm italic">No sales today</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Products Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Recent Products</h2>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-emerald-600 text-xs lg:text-sm font-bold hover:underline flex items-center gap-1"
            >
              Inventory <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Product</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Stock</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-stone-900 text-xs lg:text-sm">{product.name}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-stone-600 text-xs lg:text-sm">{product.quantity}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right font-bold text-emerald-600 text-xs lg:text-sm">₹{product.sellingPrice}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 lg:px-6 py-8 lg:py-12 text-center">
                      <p className="text-stone-400 text-xs lg:text-sm italic">No products added yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

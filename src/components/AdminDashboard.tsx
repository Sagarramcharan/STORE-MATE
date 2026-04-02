import React, { useState } from 'react';
import { Product, Sale, UserProfile } from '../types';
import { 
  Users as UsersIcon, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Store,
  ArrowLeft,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

interface AdminDashboardProps {
  users: UserProfile[];
  allProducts: Product[];
  allSales: Sale[];
}

export default function AdminDashboard({ users, allProducts, allSales }: AdminDashboardProps) {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  const totalRevenue = allSales.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalProfit = allSales.reduce((acc, curr) => acc + (curr.totalPrice - (curr.purchasePrice * curr.quantity)), 0);
  
  // Stats per user
  const userStats = users.map(user => {
    const userProducts = allProducts.filter(p => p.userId === user.id);
    const userSales = allSales.filter(s => s.userId === user.id);
    const userRevenue = userSales.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const userProfit = userSales.reduce((acc, curr) => acc + (curr.totalPrice - (curr.purchasePrice * curr.quantity)), 0);
    
    return {
      ...user,
      productCount: userProducts.length,
      salesCount: userSales.length,
      revenue: userRevenue,
      profit: userProfit
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (selectedShopId) {
    const shop = users.find(u => u.id === selectedShopId);
    const shopProducts = allProducts.filter(p => p.userId === selectedShopId);
    const shopSales = allSales.filter(s => s.userId === selectedShopId);
    const shopRevenue = shopSales.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const shopProfit = shopSales.reduce((acc, curr) => acc + (curr.totalPrice - (curr.purchasePrice * curr.quantity)), 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayLabel = format(date, 'EEE');
      const daySales = shopSales.filter(s => {
        const saleDate = new Date(s.timestamp);
        return saleDate >= startOfDay(date) && saleDate <= endOfDay(date);
      });
      const revenue = daySales.reduce((acc, curr) => acc + curr.totalPrice, 0);
      const profit = daySales.reduce((acc, curr) => acc + (curr.totalPrice - (curr.purchasePrice * curr.quantity)), 0);
      return { name: dayLabel, revenue, profit };
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedShopId(null)}
              className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{shop?.shopName || 'Shop Details'}</h1>
              <p className="text-sm text-stone-500">Managed by {shop?.name} ({shop?.email})</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-emerald-700 font-bold text-sm">
            Shop Owner View
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-2xl font-bold text-stone-900">₹{shopRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Profit</p>
            <p className="text-2xl font-bold text-emerald-600">₹{shopProfit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Products</p>
            <p className="text-2xl font-bold text-stone-900">{shopProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Sales</p>
            <p className="text-2xl font-bold text-stone-900">{shopSales.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-6">7-Day Performance</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">Recent Sales</h2>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              <div className="divide-y divide-stone-100">
                {shopSales.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="p-4 hover:bg-stone-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-stone-900">{sale.productName}</p>
                      <p className="text-xs text-stone-500">{format(new Date(sale.timestamp), 'MMM d, HH:mm')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">₹{sale.totalPrice}</p>
                      <p className="text-[10px] text-stone-400">Qty: {sale.quantity}</p>
                    </div>
                  </div>
                ))}
                {shopSales.length === 0 && (
                  <div className="p-8 text-center text-stone-500 text-sm">No sales yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900">Inventory Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Purchase Price</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4 text-right">Potential Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shopProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900 text-sm">{p.name}</div>
                      <div className="text-xs text-stone-400">{p.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.quantity <= (p.lowStockThreshold || 5) ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">₹{p.purchasePrice}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">₹{p.sellingPrice}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 text-sm">
                      ₹{(p.sellingPrice - p.purchasePrice) * p.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">Admin Overview</h1>
          <p className="text-sm text-stone-500">Global performance metrics across all shops.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 flex items-center gap-2 text-sm font-medium text-stone-600">
            <Activity className="w-4 h-4 text-emerald-600" />
            Live Updates
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4">
            <div className="bg-stone-100 p-1.5 lg:p-2 rounded-lg text-stone-600">
              <UsersIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm lg:text-base">Total Shops</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-stone-900">{users.length}</p>
          <p className="text-[10px] lg:text-xs text-stone-500 mt-0.5 lg:mt-1">Active shopkeepers</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4">
            <div className="bg-blue-50 p-1.5 lg:p-2 rounded-lg text-blue-600">
              <Package className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm lg:text-base">Total Products</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-stone-900">{allProducts.length}</p>
          <p className="text-[10px] lg:text-xs text-stone-500 mt-0.5 lg:mt-1">Items across all stores</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4">
            <div className="bg-emerald-50 p-1.5 lg:p-2 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm lg:text-base">Total Revenue</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-stone-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] lg:text-xs text-stone-500 mt-0.5 lg:mt-1">Gross platform revenue</p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4">
            <div className="bg-blue-50 p-1.5 lg:p-2 rounded-lg text-blue-600">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm lg:text-base">Total Profit</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">₹{totalProfit.toLocaleString()}</p>
          <p className="text-[10px] lg:text-xs text-stone-500 mt-0.5 lg:mt-1">Net platform earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Revenue by Shop */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Revenue by Shop</h2>
            <BarChart3 className="w-4 h-4 text-stone-400" />
          </div>
          <div className="h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="shopName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 10 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Distribution */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Profit Distribution</h2>
            <PieChartIcon className="w-4 h-4 text-stone-400" />
          </div>
          <div className="h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userStats.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="profit"
                  nameKey="shopName"
                >
                  {userStats.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Shops Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Shop Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Shop Name</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Revenue</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {userStats.map((stat) => (
                  <tr 
                    key={stat.id} 
                    className="hover:bg-stone-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedShopId(stat.id!)}
                  >
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="font-bold text-stone-900 text-xs lg:text-sm group-hover:text-emerald-600 transition-colors">
                        {stat.shopName || 'N/A'}
                      </div>
                      <div className="text-[10px] text-stone-400">{stat.name}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-stone-600">₹{stat.revenue.toLocaleString()}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right font-bold text-emerald-600 text-xs lg:text-sm">
                      ₹{stat.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-stone-100">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Recent Global Activity</h2>
          </div>
          <div className="p-0">
            <div className="divide-y divide-stone-100">
              {allSales.slice(0, 8).map((sale) => {
                const shop = users.find(u => u.id === sale.userId);
                return (
                  <div key={sale.id} className="p-3 lg:p-4 hover:bg-stone-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="bg-stone-100 p-1.5 lg:p-2 rounded-full">
                        <ShoppingCart className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-stone-600" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm font-bold text-stone-900">
                          {sale.productName} <span className="text-stone-400 font-normal">x{sale.quantity}</span>
                        </p>
                        <p className="text-[10px] lg:text-xs text-stone-500">
                          {shop?.shopName || 'Unknown Shop'} • {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs lg:text-sm font-bold text-emerald-600">₹{sale.totalPrice.toLocaleString()}</p>
                      <p className="text-[9px] lg:text-[10px] text-stone-400 uppercase tracking-wider">
                        {new Date(sale.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {allSales.length === 0 && (
                <div className="p-8 text-center text-stone-500">
                  No sales activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

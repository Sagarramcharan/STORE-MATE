import { Product, Sale } from '../types';
import { 
  CalendarClock, 
  AlertTriangle,
  TrendingUp,
  Package,
  ShoppingCart
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
}

export default function Dashboard({ products, sales }: DashboardProps) {
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 flex items-center gap-2 text-sm font-medium text-stone-600">
          <CalendarClock className="w-4 h-4" />
          {format(new Date(), 'MMMM d, yyyy')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {i === 1 && todaySales.length > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </div>
              )}
            </div>
            <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-stone-900">Sales Trend (Last 7 Days)</h2>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Revenue in ₹</div>
          </div>
          <div className="h-[300px] w-full">
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
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-6">Critical Alerts</h2>
          <div className="space-y-4">
            {lowStockProducts.length === 0 && expiringSoon.length === 0 && expired.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-emerald-50 p-4 rounded-full mb-4">
                  <Package className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-stone-500 font-medium">All systems normal</p>
                <p className="text-xs text-stone-400">No stock or expiry alerts</p>
              </div>
            )}
            
            {expired.length > 0 && (
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="bg-red-500 p-2 rounded-lg text-white">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">{expired.length} Products Expired</p>
                  <p className="text-xs text-red-700">Remove these items immediately.</p>
                </div>
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="bg-orange-500 p-2 rounded-lg text-white">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-900">{lowStockProducts.length} Low Stock Items</p>
                  <p className="text-xs text-orange-700">Reorder soon to avoid stockout.</p>
                </div>
              </div>
            )}

            {expiringSoon.length > 0 && (
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="bg-purple-500 p-2 rounded-lg text-white">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-900">{expiringSoon.length} Expiring Soon</p>
                  <p className="text-xs text-purple-700">Plan sales or clearance.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Recent Sales</h2>
          <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {todaySales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-900">{sale.productName}</td>
                  <td className="px-6 py-4 text-stone-600">{sale.quantity}</td>
                  <td className="px-6 py-4 text-stone-600">₹{sale.sellingPrice}</td>
                  <td className="px-6 py-4 font-bold text-stone-900">₹{sale.totalPrice}</td>
                  <td className="px-6 py-4 text-stone-500 text-sm">{format(new Date(sale.timestamp), 'HH:mm')}</td>
                </tr>
              ))}
              {todaySales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                      <div className="bg-stone-50 p-4 rounded-full mb-4">
                        <ShoppingCart className="w-8 h-8 text-stone-300" />
                      </div>
                      <p className="text-stone-900 font-bold mb-1">No sales today</p>
                      <p className="text-stone-500 text-sm">Once you start selling, your transactions will appear here in real-time.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

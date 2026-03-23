import { Product, Sale, UserProfile } from '../types';
import { 
  Users as UsersIcon, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Store,
  ArrowRight
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
  Cell
} from 'recharts';

interface AdminDashboardProps {
  users: UserProfile[];
  allProducts: Product[];
  allSales: Sale[];
}

export default function AdminDashboard({ users, allProducts, allSales }: AdminDashboardProps) {
  const totalRevenue = allSales.reduce((acc, curr) => acc + curr.totalPrice, 0);
  
  // Stats per user
  const userStats = users.map(user => {
    const userProducts = allProducts.filter(p => p.userId === user.id);
    const userSales = allSales.filter(s => s.userId === user.id);
    const userRevenue = userSales.reduce((acc, curr) => acc + curr.totalPrice, 0);
    
    return {
      ...user,
      productCount: userProducts.length,
      salesCount: userSales.length,
      revenue: userRevenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Admin Overview</h1>
        <p className="text-stone-500">Global performance metrics across all Store Mate shops.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-stone-100 p-2 rounded-lg text-stone-600">
              <UsersIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900">Total Shops</span>
          </div>
          <p className="text-3xl font-bold text-stone-900">{users.length}</p>
          <p className="text-xs text-stone-500 mt-1">Active shopkeepers</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900">Total Products</span>
          </div>
          <p className="text-3xl font-bold text-stone-900">{allProducts.length}</p>
          <p className="text-xs text-stone-500 mt-1">Items across all stores</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900">Total Sales</span>
          </div>
          <p className="text-3xl font-bold text-stone-900">{allSales.length}</p>
          <p className="text-xs text-stone-500 mt-1">Transactions processed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-stone-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-stone-500 mt-1">Gross platform revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Shop */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-6">Revenue by Shop</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="shopName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 11 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-6">Product Distribution</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userStats.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="productCount"
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
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Top Performing Shops</h2>
          <button className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">
            View All Users <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Shopkeeper</th>
                <th className="px-6 py-4">Shop Name</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {userStats.slice(0, 10).map((stat) => (
                <tr key={stat.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900">{stat.name}</div>
                    <div className="text-xs text-stone-400">{stat.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600 font-medium">{stat.shopName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{stat.productCount}</td>
                  <td className="px-6 py-4 text-stone-600">{stat.salesCount}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    ₹{stat.revenue.toLocaleString()}
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

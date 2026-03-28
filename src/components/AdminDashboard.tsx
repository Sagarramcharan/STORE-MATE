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
    <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">Admin Overview</h1>
        <p className="text-sm text-stone-500">Global performance metrics across all shops.</p>
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
            <div className="bg-purple-50 p-1.5 lg:p-2 rounded-lg text-purple-600">
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm lg:text-base">Total Sales</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-stone-900">{allSales.length}</p>
          <p className="text-[10px] lg:text-xs text-stone-500 mt-0.5 lg:mt-1">Transactions processed</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Revenue by Shop */}
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-base lg:text-lg font-bold text-stone-900 mb-4 lg:mb-6">Revenue by Shop</h2>
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
          <h2 className="text-base lg:text-lg font-bold text-stone-900 mb-4 lg:mb-6">Product Distribution</h2>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-bold text-stone-900">Top Performing Shops</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Shop Name</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4">Sales</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {userStats.slice(0, 5).map((stat) => (
                  <tr key={stat.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="font-bold text-stone-900 text-xs lg:text-sm">{stat.shopName || 'N/A'}</div>
                      <div className="text-[10px] text-stone-400">{stat.name}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-stone-600">{stat.salesCount}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right font-bold text-emerald-600 text-xs lg:text-sm">
                      ₹{stat.revenue.toLocaleString()}
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

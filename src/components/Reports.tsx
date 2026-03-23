import { Product, Sale } from '../types';
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
  Legend
} from 'recharts';
import { Download, FileText, TrendingUp, Package } from 'lucide-react';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
}

export default function Reports({ products, sales }: ReportsProps) {
  // Category distribution for Pie Chart
  const categoryData = products.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Sales by category
  const salesByCategory = sales.reduce((acc: any[], curr) => {
    const product = products.find(p => p.id === curr.productId);
    const category = product ? product.category : 'Unknown';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.revenue += curr.totalPrice;
    } else {
      acc.push({ name: category, revenue: curr.totalPrice });
    }
    return acc;
  }, []);

  const totalInventoryValue = products.reduce((acc, curr) => acc + (curr.purchasePrice * curr.quantity), 0);
  const totalPotentialRevenue = products.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);
  const totalProfitPotential = totalPotentialRevenue - totalInventoryValue;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Reports & Analytics</h1>
          <p className="text-stone-500">Deep dive into your store's performance.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-stone-900 text-white py-3 px-6 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95">
          <Download className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-bold text-stone-900">Inventory Value</span>
          </div>
          <p className="text-3xl font-bold text-stone-900">₹{totalInventoryValue.toLocaleString()}</p>
          <p className="text-xs text-stone-500 mt-1">Total cost of items in stock</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-bold text-stone-900">Potential Profit</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">₹{totalProfitPotential.toLocaleString()}</p>
          <p className="text-xs text-stone-500 mt-1">Expected profit from current stock</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-50 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-bold text-stone-900">Total Sales</span>
          </div>
          <p className="text-3xl font-bold text-stone-900">{sales.length}</p>
          <p className="text-xs text-stone-500 mt-1">Total transactions recorded</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-6">Inventory by Category</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-6">Revenue by Category</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
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
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-900">Top Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Units Sold</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Profit Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {Object.values(sales.reduce((acc: any, curr) => {
                if (!acc[curr.productId]) {
                  const product = products.find(p => p.id === curr.productId);
                  acc[curr.productId] = {
                    name: curr.productName,
                    units: 0,
                    revenue: 0,
                    profit: 0,
                    purchasePrice: product?.purchasePrice || 0
                  };
                }
                acc[curr.productId].units += curr.quantity;
                acc[curr.productId].revenue += curr.totalPrice;
                acc[curr.productId].profit += (curr.sellingPrice - acc[curr.productId].purchasePrice) * curr.quantity;
                return acc;
              }, {})).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5).map((item: any, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900">{item.name}</td>
                  <td className="px-6 py-4 text-stone-600">{item.units}</td>
                  <td className="px-6 py-4 font-bold text-stone-900">₹{item.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">₹{item.profit.toLocaleString()}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400">No sales data available for top products</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

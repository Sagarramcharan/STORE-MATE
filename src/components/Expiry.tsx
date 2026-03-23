import { Product } from '../types';
import { format, isBefore, addDays, differenceInDays } from 'date-fns';
import { CalendarClock, AlertTriangle, CheckCircle2, Package } from 'lucide-react';

interface ExpiryProps {
  products: Product[];
}

export default function Expiry({ products }: ExpiryProps) {
  const expiringProducts = products
    .filter(p => p.expiryDate)
    .map(p => {
      const expiry = new Date(p.expiryDate!);
      const today = new Date();
      const daysLeft = differenceInDays(expiry, today);
      return { ...p, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const expired = expiringProducts.filter(p => p.daysLeft < 0);
  const expiringSoon = expiringProducts.filter(p => p.daysLeft >= 0 && p.daysLeft <= 30);
  const safe = expiringProducts.filter(p => p.daysLeft > 30);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Expiry Management</h1>
        <p className="text-stone-500">Track and manage product expiration dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-900">Expired</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{expired.length}</p>
          <p className="text-xs text-red-700 mt-1">Items past their expiry date</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <CalendarClock className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-orange-900">Expiring Soon</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{expiringSoon.length}</p>
          <p className="text-xs text-orange-700 mt-1">Expiring within 30 days</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-emerald-900">Safe</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{safe.length}</p>
          <p className="text-xs text-emerald-700 mt-1">Items with 30+ days left</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-900">Product Expiry List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {expiringProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900">{product.name}</td>
                  <td className="px-6 py-4 text-stone-600">{product.category}</td>
                  <td className="px-6 py-4 text-stone-600">
                    {format(new Date(product.expiryDate!), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {product.daysLeft < 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Expired</span>
                    ) : product.daysLeft <= 30 ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Expiring Soon</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Safe</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {product.daysLeft < 0 ? (
                      <span className="text-red-600">{Math.abs(product.daysLeft)} days ago</span>
                    ) : (
                      <span className={product.daysLeft <= 30 ? 'text-orange-600' : 'text-stone-900'}>
                        {product.daysLeft} days
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {expiringProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarClock className="w-12 h-12 mb-4 opacity-20" />
                      <p>No products with expiry dates found</p>
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

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
    <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">Expiry Management</h1>
        <p className="text-sm text-stone-500">Track and manage product expiration dates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6">
        <div className="bg-red-50 p-4 lg:p-6 rounded-2xl border border-red-100">
          <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
            <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
            <span className="font-bold text-red-900 text-sm lg:text-base">Expired</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-red-600">{expired.length}</p>
          <p className="text-[10px] lg:text-xs text-red-700 mt-0.5 lg:mt-1">Items past expiry</p>
        </div>
        <div className="bg-orange-50 p-4 lg:p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
            <CalendarClock className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
            <span className="font-bold text-orange-900 text-sm lg:text-base">Expiring Soon</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-orange-600">{expiringSoon.length}</p>
          <p className="text-[10px] lg:text-xs text-orange-700 mt-0.5 lg:mt-1">Within 30 days</p>
        </div>
        <div className="bg-emerald-50 p-4 lg:p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
            <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
            <span className="font-bold text-emerald-900 text-sm lg:text-base">Safe</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-600">{safe.length}</p>
          <p className="text-[10px] lg:text-xs text-emerald-700 mt-0.5 lg:mt-1">30+ days left</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-stone-100">
          <h2 className="text-base lg:text-lg font-bold text-stone-900">Product Expiry List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                <th className="px-4 lg:px-6 py-3 lg:py-4">Product</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">Category</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4">Expiry Date</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4">Status</th>
                <th className="px-4 lg:px-6 py-3 lg:py-4">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {expiringProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="font-bold text-stone-900 text-xs lg:text-sm">{product.name}</div>
                    <div className="text-[10px] text-stone-400 sm:hidden">{product.category}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell text-xs lg:text-sm text-stone-600">{product.category}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-stone-600">
                    {format(new Date(product.expiryDate!), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    {product.daysLeft < 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] lg:text-xs font-bold">Expired</span>
                    ) : product.daysLeft <= 30 ? (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] lg:text-xs font-bold">Soon</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] lg:text-xs font-bold">Safe</span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold text-xs lg:text-sm">
                    {product.daysLeft < 0 ? (
                      <span className="text-red-600">{Math.abs(product.daysLeft)}d ago</span>
                    ) : (
                      <span className={product.daysLeft <= 30 ? 'text-orange-600' : 'text-stone-900'}>
                        {product.daysLeft}d
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

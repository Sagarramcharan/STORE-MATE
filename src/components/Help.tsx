import React from 'react';
import { 
  Sparkles, 
  Package, 
  ShoppingCart, 
  CalendarClock, 
  BarChart3, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function Help() {
  const guides = [
    {
      title: 'Inventory Management',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Add your products, set stock levels, and track purchase/selling prices. We\'ll alert you when stock is low.'
    },
    {
      title: 'Sales Tracking',
      icon: ShoppingCart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: 'Record daily sales instantly. Just select a product, enter the quantity, and we\'ll calculate the total for you.'
    },
    {
      title: 'Expiry Alerts',
      icon: CalendarClock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Never sell expired goods again. Set expiry dates for items and see what\'s expiring soon in the Expiry tab.'
    },
    {
      title: 'Business Reports',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'View your total revenue, profit, and top-selling products through beautiful charts and detailed reports.'
    },
    {
      title: 'Install as App',
      icon: Zap,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      description: 'No need to download from Play Store! Open this link in Chrome/Safari and select "Add to Home Screen" to use it as a real app.'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tight">How to use Store Mate</h1>
        <p className="text-stone-500 text-lg">
          Welcome to your new business companion! Here's a quick guide to help you master Store Mate and grow your shop.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {guides.map((guide, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
            <div className={`${guide.bg} ${guide.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <guide.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">{guide.title}</h3>
            <p className="text-stone-600 leading-relaxed mb-6">{guide.description}</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm cursor-pointer hover:gap-3 transition-all">
              Learn more <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl font-bold">Your Data is Safe</h2>
            </div>
            <p className="text-stone-400 text-lg leading-relaxed">
              We use enterprise-grade security to protect your business data. Your inventory and sales records are encrypted and only accessible by you.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">Daily Backups</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <h4 className="font-bold mb-4">Need Support?</h4>
            <p className="text-sm text-stone-300 mb-6">Our team is here to help you 24/7 with any questions or issues.</p>
            <button className="w-full bg-white text-stone-900 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

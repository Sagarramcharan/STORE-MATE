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
    <div className="space-y-6 lg:space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto px-2">
        <div className="flex justify-center mb-3 lg:mb-4">
          <div className="bg-emerald-100 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
            <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-4xl font-black text-stone-900 mb-2 lg:mb-4 tracking-tight">How to use Store Mate</h1>
        <p className="text-stone-500 text-sm lg:text-lg">
          Welcome to your new business companion! Here's a quick guide to help you master Store Mate and grow your shop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
        {guides.map((guide, index) => (
          <div key={index} className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
            <div className={`${guide.bg} ${guide.color} w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform`}>
              <guide.icon className="w-5 h-5 lg:w-7 lg:h-7" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-stone-900 mb-2 lg:mb-3">{guide.title}</h3>
            <p className="text-stone-600 leading-relaxed mb-4 lg:mb-6 text-xs lg:text-base">{guide.description}</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs lg:text-sm cursor-pointer hover:gap-3 transition-all">
              Learn more <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-stone-900 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-emerald-500/10 rounded-full translate-x-24 lg:translate-x-32 -translate-y-24 lg:-translate-y-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="flex-1 space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <ShieldCheck className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
              <h2 className="text-xl lg:text-2xl font-bold">Your Data is Safe</h2>
            </div>
            <p className="text-stone-400 text-sm lg:text-lg leading-relaxed">
              We use enterprise-grade security to protect your business data. Your inventory and sales records are encrypted and only accessible by you.
            </p>
            <div className="flex flex-wrap gap-3 lg:gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-white/10">
                <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-yellow-400" />
                <span className="text-[10px] lg:text-sm font-medium">Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400" />
                <span className="text-[10px] lg:text-sm font-medium">Daily Backups</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3 bg-white/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/20">
            <h4 className="font-bold mb-2 lg:mb-4 text-sm lg:text-base">Need Support?</h4>
            <p className="text-xs lg:text-sm text-stone-300 mb-4 lg:mb-6">Our team is here to help you 24/7 with any questions or issues.</p>
            <button className="w-full bg-white text-stone-900 py-2.5 lg:py-3 rounded-xl font-bold hover:bg-stone-100 transition-all text-sm lg:text-base">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

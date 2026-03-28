import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { toast } from 'react-hot-toast';
import { Store, ArrowRight, Sparkles } from 'lucide-react';

interface ShopSetupModalProps {
  uid: string;
  profile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export default function ShopSetupModal({ uid, profile, onComplete }: ShopSetupModalProps) {
  const [shopName, setShopName] = useState(profile.shopName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error('Please enter a shop name');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile = { ...profile, shopName: shopName.trim() };
      await updateDoc(doc(db, 'users', uid), { shopName: shopName.trim() });
      toast.success('Welcome to Store Mate!');
      onComplete(updatedProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      toast.error('Failed to save shop details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 lg:p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-lg rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="relative h-24 lg:h-32 bg-emerald-600 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full -translate-x-12 -translate-y-12 lg:-translate-x-16 lg:-translate-y-16 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full translate-x-12 translate-y-12 lg:translate-x-16 lg:translate-y-16 blur-3xl"></div>
          </div>
          <div className="bg-white/20 p-3 lg:p-4 rounded-xl lg:rounded-2xl backdrop-blur-sm border border-white/30">
            <Store className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
        </div>
        
        <div className="p-6 lg:p-8 text-center">
          <div className="flex justify-center mb-3 lg:mb-4">
            <span className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] lg:text-xs font-bold rounded-full uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Getting Started
            </span>
          </div>
          
          <h2 className="text-xl lg:text-2xl font-bold text-stone-900 mb-1 lg:mb-2">Welcome, {profile.name}!</h2>
          <p className="text-xs lg:text-sm text-stone-500 mb-6 lg:mb-8">Let's set up your shop profile to get started with Store Mate.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="text-left space-y-1.5 lg:space-y-2">
              <label className="text-xs lg:text-sm font-bold text-stone-700 ml-1">What's your shop's name?</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. City Grocery Store"
                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-base lg:text-lg font-medium"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 lg:gap-3 bg-emerald-600 text-white py-3.5 lg:py-4 px-6 rounded-xl lg:rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-sm lg:text-base"
            >
              {isSubmitting ? 'Saving...' : 'Start Managing My Shop'}
              {!isSubmitting && <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
          </form>
          
          <p className="mt-4 lg:mt-6 text-[10px] lg:text-xs text-stone-400">
            You can always change your shop name later in settings.
          </p>
        </div>
      </div>
    </div>
  );
}

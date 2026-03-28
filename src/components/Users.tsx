import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { UserProfile, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { Users as UsersIcon, Mail, Shield, Store } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-900">User Management</h1>
        <p className="text-sm text-stone-500">View all shopkeepers using Store Mate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
              <div className="bg-stone-100 p-2 lg:p-3 rounded-xl">
                <UsersIcon className="w-5 h-5 lg:w-6 lg:h-6 text-stone-600" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm lg:text-base">{user.name}</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] lg:text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center gap-2 text-xs lg:text-sm text-stone-500">
                <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-stone-500">
                <Store className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>{user.shopName || 'No shop name set'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-stone-500">
                <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="truncate">ID: <span className="font-mono text-[9px] lg:text-[10px]">{user.id}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-stone-400">
          <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No users found in the database.</p>
        </div>
      )}
    </div>
  );
}

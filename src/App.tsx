import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously, linkWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CalendarClock, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  Store,
  Users as UsersIcon,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Product, Sale, UserProfile, OperationType } from './types';
import { handleFirestoreError } from './utils/error-handler';

// Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Expiry from './components/Expiry';
import Reports from './components/Reports';
import Users from './components/Users';
import AdminDashboard from './components/AdminDashboard';
import ShopSetupModal from './components/ShopSetupModal';
import Help from './components/Help';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showShopSetup, setShowShopSetup] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);

  const isAdmin = user?.email?.toLowerCase() === 'sagarsatapathy24@gmail.com';

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const isUserAdmin = user.email?.toLowerCase() === 'sagarsatapathy24@gmail.com';
        if (isUserAdmin) {
          setActiveTab('admin');
        }
        await fetchUserProfile(user.uid, user.email || 'guest@storemate.app', user.displayName || 'Guest User');
      } else {
        // Automatically sign in anonymously if not logged in
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          setLoading(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // Fetch user-specific data
    const productsQuery = query(
      collection(db, 'products'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const salesQuery = query(
      collection(db, 'sales'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
      setSales(salesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sales');
    });

    // Fetch admin-specific data if applicable
    let unsubscribeAllUsers = () => {};
    let unsubscribeAllProducts = () => {};
    let unsubscribeAllSales = () => {};

    if (isAdmin) {
      const allUsersQuery = query(collection(db, 'users'), orderBy('name', 'asc'));
      unsubscribeAllUsers = onSnapshot(allUsersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setAllUsers(usersData);
      });

      const allProductsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      unsubscribeAllProducts = onSnapshot(allProductsQuery, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setAllProducts(productsData);
      });

      const allSalesQuery = query(collection(db, 'sales'), orderBy('timestamp', 'desc'));
      unsubscribeAllSales = onSnapshot(allSalesQuery, (snapshot) => {
        const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
        setAllSales(salesData);
      });
    }

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
      unsubscribeAllUsers();
      unsubscribeAllProducts();
      unsubscribeAllSales();
    };
  }, [user, isAdmin]);

  const fetchUserProfile = async (uid: string, email: string, name: string) => {
    if (!db) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        // Show setup if shop name is default
        if (profile.shopName === 'My Store' || !profile.shopName) {
          setShowShopSetup(true);
        }
      } else {
        const newProfile: UserProfile = {
          name,
          email,
          role: 'admin',
          shopName: 'My Store'
        };
        await setDoc(doc(db, 'users', uid), newProfile);
        setUserProfile(newProfile);
        setShowShopSetup(true);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  };

  const handleLogin = async () => {
    if (!auth || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      // If user is already anonymous, we can link the account to keep their data
      if (user?.isAnonymous) {
        await linkWithPopup(user, provider);
        toast.success('Account linked successfully! Your data is now synced.');
      } else {
        await signInWithPopup(auth, provider);
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized in Firebase Console. Please add your Vercel URL to the authorized domains list.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login popup was closed before completion.');
      } else if (error.code === 'auth/credential-already-in-use') {
        // If the Google account is already linked to another user, just sign in
        await signInWithPopup(auth, new GoogleAuthProvider());
        toast.success('Logged in successfully!');
      } else {
        toast.error('Failed to log in: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      // After logout, the onAuthStateChanged will trigger and sign in anonymously again
      toast.success('Signed out. You are now in guest mode.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  if (!db || !auth) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-100 overflow-hidden">
          <div className="bg-red-50 p-8">
            <div className="w-16 h-16 bg-white text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Firebase Connection Error</h1>
            <p className="text-stone-600 text-sm">
              The application failed to initialize Firebase. This usually happens when environment variables are missing or domains are not authorized.
            </p>
          </div>
          
          <div className="p-8 text-left">
            <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
              Check Vercel Environment Variables
            </h2>
            <p className="text-stone-600 text-sm mb-4">
              Ensure you have added all <code>VITE_FIREBASE_*</code> keys in your Vercel Project Settings.
            </p>
            
            <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
              Authorize this Domain
            </h2>
            <p className="text-stone-600 text-sm mb-4">
              If the login popup disappears, you must add this domain to the <b>Authorized Domains</b> list in your Firebase Console:
            </p>
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 font-mono text-xs text-stone-500 mb-6 break-all">
              {window.location.hostname}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
              >
                Retry Connection
              </button>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-stone-100 text-stone-900 rounded-xl font-bold hover:bg-stone-200 transition-colors text-center"
              >
                Open Console
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Remove the "if (!user)" check to allow anonymous access
  // if (!user) { ... }

  const renderContent = () => {
    switch (activeTab) {
      case 'admin':
        return <AdminDashboard users={allUsers} allProducts={allProducts} allSales={allSales} />;
      case 'dashboard':
        return <Dashboard products={products} sales={sales} onNavigate={setActiveTab} userId={user.uid} />;
      case 'inventory':
        return <Inventory products={products} userId={user.uid} />;
      case 'sales':
        return <Sales products={products} sales={sales} userId={user.uid} />;
      case 'expiry':
        return <Expiry products={products} />;
      case 'reports':
        return <Reports products={products} sales={sales} />;
      case 'users':
        return <Users />;
      case 'help':
        return <Help />;
      default:
        return isAdmin ? (
          <AdminDashboard users={allUsers} allProducts={allProducts} allSales={allSales} />
        ) : (
          <Dashboard products={products} sales={sales} onNavigate={setActiveTab} userId={user.uid} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-xl text-stone-900">Store Mate</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 lg:relative lg:z-0
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        w-72 bg-white border-r border-stone-200 flex flex-col
      `}>
        <div className="p-6 hidden lg:flex items-center gap-3 border-b border-stone-100">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Store className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="font-bold text-2xl text-stone-900 tracking-tight">Store Mate</span>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {isAdmin && (
            <div className="space-y-2">
              <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Administration</p>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === 'admin' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-stone-600 hover:bg-stone-100'}
                `}
              >
                <LayoutDashboard className={`w-5 h-5 ${activeTab === 'admin' ? 'text-white' : 'text-stone-500'}`} />
                Admin Panel
              </button>
              <button
                onClick={() => {
                  setActiveTab('users');
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === 'users' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-stone-600 hover:bg-stone-100'}
                `}
              >
                <UsersIcon className={`w-5 h-5 ${activeTab === 'users' ? 'text-white' : 'text-stone-500'}`} />
                Manage Users
              </button>
            </div>
          )}

          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">My Store</p>
            {[
              { id: 'dashboard', label: 'My Dashboard', icon: BarChart3 },
              { id: 'inventory', label: 'My Inventory', icon: Package },
              { id: 'sales', label: 'My Sales', icon: ShoppingCart },
              { id: 'expiry', label: 'Expiry Alerts', icon: CalendarClock },
              { id: 'reports', label: 'My Reports', icon: BarChart3 },
              { id: 'help', label: 'Help & Guide', icon: Sparkles },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-stone-600 hover:bg-stone-100'}
                `}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-stone-500'}`} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Shopkeeper</p>
            <p className="text-sm font-bold text-stone-900 truncate">
              {user?.isAnonymous ? 'Guest User' : (userProfile?.name || user?.displayName)}
            </p>
            <p className="text-xs text-stone-500 truncate">
              {user?.isAnonymous ? 'Local Session' : (userProfile?.shopName || 'My Store')}
            </p>
          </div>
          
          {user?.isAnonymous ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-emerald-600 hover:bg-emerald-50 transition-all"
            >
              <UsersIcon className="w-5 h-5" />
              {isLoggingIn ? 'Connecting...' : 'Sync with Google'}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Onboarding Modal */}
      {showShopSetup && userProfile && (
        <ShopSetupModal 
          uid={user.uid} 
          profile={userProfile} 
          onComplete={(updated) => {
            setUserProfile(updated);
            setShowShopSetup(false);
          }} 
        />
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
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
  Sparkles
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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);

  const isAdmin = user?.email === 'sagarsatapathy24@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user.uid, user.email!, user.displayName!);
      } else {
        setUser(null);
        setUserProfile(null);
        setProducts([]);
        setSales([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

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
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-stone-200 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex justify-center mb-8">
            <div className="bg-emerald-600 p-5 rounded-3xl shadow-xl shadow-emerald-100 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Store className="w-14 h-14 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-stone-900 mb-3 tracking-tight">Store Mate</h1>
          <p className="text-stone-500 mb-10 text-lg leading-relaxed">
            The ultimate companion for modern shopkeepers. Manage inventory, track sales, and grow your business with ease.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-4 bg-stone-900 text-white py-5 px-8 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl active:scale-95 group"
            >
              <img src="https://www.google.com/favicon.ico" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
              Continue with Google
            </button>
            <p className="text-xs text-stone-400 font-medium">
              Secure login powered by Google Cloud.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-stone-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-lg">Fast</div>
              <div className="text-[10px] text-stone-400 uppercase font-bold">Setup</div>
            </div>
            <div className="text-center border-x border-stone-100">
              <div className="text-emerald-600 font-bold text-lg">Secure</div>
              <div className="text-[10px] text-stone-400 uppercase font-bold">Data</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-lg">Free</div>
              <div className="text-[10px] text-stone-400 uppercase font-bold">Forever</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard users={allUsers} allProducts={allProducts} allSales={allSales} />
        ) : (
          <Dashboard products={products} sales={sales} />
        );
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
          <Dashboard products={products} sales={sales} />
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: isAdmin ? 'Admin Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'expiry', label: 'Expiry', icon: CalendarClock },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'help', label: 'Help & Guide', icon: Sparkles },
  ];

  if (isAdmin) {
    navItems.push({ id: 'users', label: 'Users', icon: UsersIcon });
  }

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

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
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
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Shopkeeper</p>
            <p className="text-sm font-bold text-stone-900 truncate">{userProfile?.name || user.displayName}</p>
            <p className="text-xs text-stone-500 truncate">{userProfile?.shopName || 'My Store'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
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


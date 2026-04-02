import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';
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
  AlertTriangle,
  Mail,
  Lock,
  User as UserIcon,
  Chrome
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopNameInput, setShopNameInput] = useState('');
  const [isSettingUpShop, setIsSettingUpShop] = useState(false);
  
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
        await fetchUserProfile(user.uid, user.email || '', user.displayName || 'User');
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again or reset it.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Please sign up.');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google!');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth || !email) {
      toast.error('Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  const handleShopSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !shopNameInput) return;
    setIsSettingUpShop(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        shopName: shopNameInput
      });
      setUserProfile(prev => prev ? { ...prev, shopName: shopNameInput } : null);
      setShowShopSetup(false);
      toast.success(`Welcome to ${shopNameInput}!`);
    } catch (error) {
      console.error('Shop setup error:', error);
      toast.error('Failed to save shop name');
    } finally {
      setIsSettingUpShop(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <Toaster position="top-right" />
        <div className="max-w-md w-full bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="bg-emerald-600 p-6 lg:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full -translate-x-12 -translate-y-12 lg:-translate-x-16 lg:-translate-y-16 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full translate-x-12 translate-y-12 lg:translate-x-16 lg:translate-y-16 blur-3xl"></div>
            </div>
            <div className="relative z-10 flex justify-center mb-4 lg:mb-6">
              <div className="bg-white/20 p-3 lg:p-4 rounded-xl lg:rounded-2xl backdrop-blur-sm border border-white/30 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-xl shadow-emerald-900/20">
                <Store className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
              </div>
            </div>
            <h1 className="relative z-10 text-2xl lg:text-3xl font-black text-white tracking-tight">Store Mate</h1>
            <p className="relative z-10 text-emerald-100 mt-1 lg:mt-2 font-medium text-sm lg:text-base">Your ultimate shop companion</p>
          </div>

          <div className="p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl font-bold text-stone-900 mb-4 lg:mb-6 text-center">
              {isSignUp ? 'Create your account' : 'Welcome back!'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Password</label>
                  {!isSignUp && (
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-bold text-emerald-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-stone-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6"
              >
                {isLoggingIn ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-stone-200"></div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full mt-4 bg-white border border-stone-200 text-stone-700 py-3 px-6 rounded-xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
            >
              <Chrome className="w-5 h-5 text-emerald-600" />
              Continue with Google
            </button>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-stone-500 hover:text-emerald-600 font-semibold transition-colors text-sm"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>

          <div className="bg-stone-50 p-4 lg:p-6 border-t border-stone-100 grid grid-cols-3 gap-2 lg:gap-4">
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-base lg:text-lg">Fast</div>
              <div className="text-[8px] lg:text-[10px] text-stone-400 uppercase font-bold">Setup</div>
            </div>
            <div className="text-center border-x border-stone-100">
              <div className="text-emerald-600 font-bold text-base lg:text-lg">Secure</div>
              <div className="text-[8px] lg:text-[10px] text-stone-400 uppercase font-bold">Data</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-base lg:text-lg">Free</div>
              <div className="text-[8px] lg:text-[10px] text-stone-400 uppercase font-bold">Forever</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <header className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-1.5 rounded-lg">
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-bold text-lg text-stone-900 tracking-tight">Store Mate</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] lg:static lg:inset-auto lg:z-0 lg:w-72 bg-white border-r border-stone-200 flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out h-full lg:h-screen sticky top-0
      `}>
        {/* Sidebar Header (Mobile only) */}
        <div className="p-4 flex items-center justify-between border-b border-stone-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-bold text-lg text-stone-900 tracking-tight">Store Mate</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 hidden lg:flex items-center gap-3 border-b border-stone-100">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Store className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="font-bold text-2xl text-stone-900 tracking-tight">Store Mate</span>
        </div>

        <nav className="flex-1 p-3 lg:p-4 space-y-4 lg:space-y-6 overflow-y-auto">
          {isAdmin && (
            <div className="space-y-1 lg:space-y-2">
              <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Administration</p>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all text-sm lg:text-base
                  ${activeTab === 'admin' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-stone-600 hover:bg-stone-100'}
                `}
              >
                <LayoutDashboard className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'admin' ? 'text-white' : 'text-stone-500'}`} />
                Admin Panel
              </button>
              <button
                onClick={() => {
                  setActiveTab('users');
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all text-sm lg:text-base
                  ${activeTab === 'users' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-stone-600 hover:bg-stone-100'}
                `}
              >
                <UsersIcon className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'users' ? 'text-white' : 'text-stone-500'}`} />
                Manage Users
              </button>
            </div>
          )}

          <div className="space-y-1 lg:space-y-2">
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
                  w-full flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all text-sm lg:text-base
                  ${activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-stone-600 hover:bg-stone-100'}
                `}
              >
                <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === item.id ? 'text-white' : 'text-stone-500'}`} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-3 lg:p-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-3 lg:mb-4">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 lg:mb-2">Shopkeeper</p>
            <p className="text-xs lg:text-sm font-bold text-stone-900 truncate">
              {userProfile?.name || user?.displayName || 'User'}
            </p>
            <p className="text-[10px] lg:text-xs text-stone-500 truncate">
              {userProfile?.shopName || 'My Store'}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all text-sm lg:text-base"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-45 lg:hidden animate-in fade-in duration-300"
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


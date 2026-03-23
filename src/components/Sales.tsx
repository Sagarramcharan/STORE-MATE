import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Product, Sale, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2,
  History,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface SalesProps {
  products: Product[];
  sales: Sale[];
  userId: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Sales({ products, sales, userId }: SalesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredProducts = products.filter(p => 
    p.quantity > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.barcode?.includes(searchTerm)
    )
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.product.quantity) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      for (const item of cart) {
        const saleData = {
          productId: item.product.id!,
          productName: item.product.name,
          quantity: item.quantity,
          sellingPrice: item.product.sellingPrice,
          totalPrice: item.product.sellingPrice * item.quantity,
          timestamp: new Date().toISOString(),
          userId
        };

        // Record Sale
        await addDoc(collection(db, 'sales'), saleData);

        // Update Stock
        await updateDoc(doc(db, 'products', item.product.id!), {
          quantity: item.product.quantity - item.quantity
        });
      }

      toast.success('Sale recorded successfully!');
      setCart([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sales/products');
      toast.error('Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">New Sale</h1>
          <p className="text-stone-500">Select products to add to the cart.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search products by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-center justify-between group active:scale-95"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900 truncate">{product.name}</p>
                <p className="text-xs text-stone-500">{product.category} • Stock: {product.quantity}</p>
                <p className="text-emerald-600 font-bold mt-1">₹{product.sellingPrice}</p>
              </div>
              <div className="bg-stone-50 group-hover:bg-emerald-50 p-3 rounded-xl transition-colors">
                <Plus className="w-5 h-5 text-stone-400 group-hover:text-emerald-600" />
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-200 border-dashed">
              <div className="bg-stone-50 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-stone-300" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                {searchTerm ? 'No matching products' : 'No products available for sale'}
              </h3>
              <p className="text-stone-500 max-w-xs mx-auto mb-8">
                {searchTerm 
                  ? 'Try searching for something else or check your inventory.' 
                  : 'You need to add products to your inventory and ensure they have stock before you can start selling.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => window.location.hash = '#inventory'} // Simple way to suggest navigation
                  className="text-emerald-600 font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all"
                >
                  Go to Inventory <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl flex flex-col h-[calc(100vh-12rem)] sticky top-8">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              Current Cart
            </h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
              {cart.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="bg-stone-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-500">₹{item.product.sellingPrice} each</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id!)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.product.id!, -1)}
                      className="p-1 hover:bg-stone-100 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-stone-900 w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id!, 1)}
                      className="p-1 hover:bg-stone-100 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-stone-900">₹{item.product.sellingPrice * item.quantity}</p>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center p-8">
                <div className="bg-stone-50 p-4 rounded-full mb-4">
                  <ShoppingCart className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-medium">Your cart is empty</p>
                <p className="text-xs">Add products from the list to start a sale</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-stone-900">₹{cartTotal.toLocaleString()}</span>
            </div>
            <button
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className={`
                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                ${cart.length === 0 || isProcessing
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 active:scale-95'}
              `}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

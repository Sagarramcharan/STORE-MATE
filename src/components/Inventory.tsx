import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Product, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Package,
  AlertTriangle,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface InventoryProps {
  products: Product[];
  userId: string;
}

export default function Inventory({ products, userId }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.barcode?.includes(searchTerm);
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      purchasePrice: Number(formData.get('purchasePrice')),
      sellingPrice: Number(formData.get('sellingPrice')),
      expiryDate: (formData.get('expiryDate') as string) || null,
      supplierName: (formData.get('supplierName') as string) || null,
      barcode: (formData.get('barcode') as string) || null,
      lowStockThreshold: Number(formData.get('lowStockThreshold')) || 5,
      userId,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (editingProduct?.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Inventory</h1>
          <p className="text-stone-500">Manage your products and stock levels.</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price (S/P)</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900">{product.name}</div>
                    <div className="text-xs text-stone-400">{product.barcode || 'No barcode'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${product.quantity <= (product.lowStockThreshold || 5) ? 'text-orange-600' : 'text-stone-900'}`}>
                        {product.quantity}
                      </span>
                      {product.quantity <= (product.lowStockThreshold || 5) && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-emerald-600 font-bold">₹{product.sellingPrice}</div>
                    <div className="text-xs text-stone-400">P: ₹{product.purchasePrice}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${product.expiryDate && new Date(product.expiryDate) < new Date() ? 'text-red-600 font-bold' : 'text-stone-600'}`}>
                      {product.expiryDate ? format(new Date(product.expiryDate), 'MMM d, yyyy') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id!)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="bg-stone-100 p-6 rounded-3xl mb-6">
                        <Package className="w-12 h-12 text-stone-400 opacity-50" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 mb-2">
                        {searchTerm || categoryFilter !== 'All' ? 'No matches found' : 'Your inventory is empty'}
                      </h3>
                      <p className="text-stone-500 mb-8 leading-relaxed">
                        {searchTerm || categoryFilter !== 'All' 
                          ? 'Try adjusting your search or filters to find what you\'re looking for.' 
                          : 'Start by adding your first product to track stock levels and manage your shop efficiently.'}
                      </p>
                      {!(searchTerm || categoryFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-2 bg-emerald-600 text-white py-3 px-8 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                        >
                          <Plus className="w-5 h-5" />
                          Add Your First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="text-xl font-bold text-stone-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Product Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingProduct?.name}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Category *</label>
                  <input
                    name="category"
                    required
                    defaultValue={editingProduct?.category}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g. Medicine"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    required
                    defaultValue={editingProduct?.quantity}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Low Stock Alert at</label>
                  <input
                    name="lowStockThreshold"
                    type="number"
                    defaultValue={editingProduct?.lowStockThreshold || 5}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Purchase Price *</label>
                  <input
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.purchasePrice}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Selling Price *</label>
                  <input
                    name="sellingPrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.sellingPrice}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Expiry Date</label>
                  <input
                    name="expiryDate"
                    type="date"
                    defaultValue={editingProduct?.expiryDate}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700">Barcode</label>
                  <input
                    name="barcode"
                    defaultValue={editingProduct?.barcode}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Optional barcode"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  UserAccount,
  ORDER_STATUS_PIPELINE,
  formatDjangoTimestamp,
  getDiscountedPrice,
} from '../data/initialStoreData';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface AdminDashboardViewProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: UserAccount[];
  onAddProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddCategory: (name: string, description: string) => void;
  onUpdateOrderStatus: (orderId: number, status: OrderStatus, paymentStatus: PaymentStatus) => void;
}

const ALL_ORDER_STATUSES: OrderStatus[] = [
  ...ORDER_STATUS_PIPELINE,
  'Cancelled',
];

const ALL_PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Failed'];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  categories,
  orders,
  users,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'customers'>('orders');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // New / Edit Product form state
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Electronics');
  const [formPrice, setFormPrice] = useState('29990');
  const [formDiscount, setFormDiscount] = useState('10');
  const [formStock, setFormStock] = useState('15');
  const [formRating, setFormRating] = useState('4.7');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('/src/assets/images/product_laptop_pro_1791109378289.jpg');

  // New Category form state
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Dashboard Metrics
  const totalProducts = products.length;
  const totalCustomers = users.filter((u) => !u.is_staff).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total_amount, 0);

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormPrice(String(p.price));
    setFormDiscount(String(p.discount));
    setFormStock(String(p.stock));
    setFormRating(String(p.rating));
    setFormDescription(p.description);
    setFormImage(p.image);
    setShowAddProductForm(true);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setFormName('');
    setFormBrand('');
    setFormCategory(categories[0]?.name || 'Electronics');
    setFormPrice('29990');
    setFormDiscount('10');
    setFormStock('15');
    setFormRating('4.7');
    setFormDescription('');
    setShowAddProductForm(false);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBrand.trim()) return;

    if (editingProductId !== null) {
      const existing = products.find((p) => p.id === editingProductId);
      if (existing) {
        onUpdateProduct({
          ...existing,
          name: formName.trim(),
          brand: formBrand.trim(),
          category: formCategory,
          price: Math.max(1, Number(formPrice) || 1000),
          discount: Math.min(90, Math.max(0, Number(formDiscount) || 0)),
          stock: Math.max(0, Number(formStock) || 0),
          rating: Math.min(5, Math.max(1, Number(formRating) || 4.5)),
          description: formDescription.trim() || existing.description,
          image: formImage.trim() || existing.image,
          updated_at: formatDjangoTimestamp(new Date()),
        });
      }
    } else {
      onAddProduct({
        name: formName.trim(),
        brand: formBrand.trim(),
        category: formCategory,
        price: Math.max(1, Number(formPrice) || 1000),
        discount: Math.min(90, Math.max(0, Number(formDiscount) || 0)),
        stock: Math.max(0, Number(formStock) || 0),
        rating: Math.min(5, Math.max(1, Number(formRating) || 4.5)),
        description:
          formDescription.trim() ||
          'Precision-engineered product added via ShopSphere Django Admin Dashboard.',
        image: formImage.trim() || '/src/assets/images/product_laptop_pro_1791109378289.jpg',
        is_trending: true,
        is_bestseller: false,
        is_new_arrival: true,
      });
    }
    resetProductForm();
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCategory(
      catName.trim(),
      catDescription.trim() || `Curated ${catName.trim()} collection in ShopSphere.`
    );
    setCatName('');
    setCatDescription('');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs text-zinc-500">Django Staff Administration · dashboard/views.py</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
            ShopSphere Operations & Order Control
          </h1>
        </div>
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg self-start">
          {(
            [
              { id: 'orders', label: `Orders (${orders.length})` },
              { id: 'products', label: `Products & Stock (${products.length})` },
              { id: 'categories', label: `Categories (${categories.length})` },
              { id: 'customers', label: `Customers (${users.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Required Dashboard Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-xl">
          <div className="text-xs text-zinc-500">Total Products</div>
          <div className="text-2xl font-semibold text-zinc-900 font-mono-tabular mt-2">
            {totalProducts}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Active SKUs</div>
        </div>
        <div className="p-5 bg-white border border-zinc-200/80 rounded-xl">
          <div className="text-xs text-zinc-500">Total Customers</div>
          <div className="text-2xl font-semibold text-zinc-900 font-mono-tabular mt-2">
            {totalCustomers}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Registered accounts</div>
        </div>
        <div className="p-5 bg-white border border-zinc-200/80 rounded-xl">
          <div className="text-xs text-zinc-500">Total Orders</div>
          <div className="text-2xl font-semibold text-zinc-900 font-mono-tabular mt-2">
            {totalOrders}
          </div>
          <div className="text-xs text-zinc-400 mt-1">All time</div>
        </div>
        <div className="p-5 bg-white border border-zinc-200/80 rounded-xl">
          <div className="text-xs text-zinc-500">Pending Orders</div>
          <div className="text-2xl font-semibold text-amber-700 font-mono-tabular mt-2">
            {pendingOrders}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Awaiting dispatch</div>
        </div>
        <div className="p-5 bg-white border border-zinc-200/80 rounded-xl">
          <div className="text-xs text-zinc-500">Delivered Orders</div>
          <div className="text-2xl font-semibold text-emerald-700 font-mono-tabular mt-2">
            {deliveredOrders}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Completed cycle</div>
        </div>
        <div className="p-5 bg-white border border-zinc-200/80 rounded-xl">
          <div className="text-xs text-zinc-500">Total Revenue</div>
          <div className="text-2xl font-semibold text-zinc-900 font-mono-tabular mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Excl. cancelled</div>
        </div>
      </div>

      {/* Tab 1: Recent Orders & Admin Order Status Logic */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Recent Orders & Live Status Pipeline
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Customer → Cart → Checkout → Order Created → Admin Dashboard → Admin changes status → Customer sees updated status immediately.
              </p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-500 bg-zinc-50/60">
                  <th className="py-3.5 px-4 font-medium">Order ID</th>
                  <th className="py-3.5 px-4 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">Items</th>
                  <th className="py-3.5 px-4 font-medium">Amount</th>
                  <th className="py-3.5 px-4 font-medium">Date & Time (TZ)</th>
                  <th className="py-3.5 px-4 font-medium">Payment Status</th>
                  <th className="py-3.5 px-4 font-medium">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono-tabular text-xs font-medium text-zinc-900 whitespace-nowrap">
                      {order.order_number}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-zinc-900">{order.customer_name}</div>
                      <div className="text-xs text-zinc-500">
                        {order.city}, {order.state} · {order.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-zinc-600">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          {item.product_name} × {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-4 font-mono-tabular font-medium text-zinc-900 whitespace-nowrap">
                      <div>₹{order.total_amount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-zinc-500 font-sans">
                        {order.payment_method}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-zinc-600 font-mono-tabular whitespace-nowrap">
                      {order.created_at}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.payment_status}
                        onChange={(e) =>
                          onUpdateOrderStatus(
                            order.id,
                            order.status,
                            e.target.value as PaymentStatus
                          )
                        }
                        aria-label={`Payment status for ${order.order_number}`}
                        className="bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900"
                      >
                        {ALL_PAYMENT_STATUSES.map((pStatus) => (
                          <option key={pStatus} value={pStatus}>
                            {pStatus}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(
                            order.id,
                            e.target.value as OrderStatus,
                            order.payment_status
                          )
                        }
                        aria-label={`Order status for ${order.order_number}`}
                        className="bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900"
                      >
                        {ALL_ORDER_STATUSES.map((oStatus) => (
                          <option key={oStatus} value={oStatus}>
                            {oStatus}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products & Stock Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Product Catalog & Real-Time Stock Control
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Add new products, edit specifications, or adjust available inventory levels.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetProductForm();
                setShowAddProductForm(true);
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          {showAddProductForm && (
            <form
              onSubmit={handleProductSubmit}
              className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-base font-semibold text-zinc-900">
                  {editingProductId !== null ? 'Edit Product Record' : 'Create New Product in ORM'}
                </h3>
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Studio Pro Monitor"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. AetherLabs"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Studio Image Preset
                  </label>
                  <select
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900"
                  >
                    <option value="/src/assets/images/product_laptop_pro_1791109378289.jpg">
                      Pro Laptop Studio Photo
                    </option>
                    <option value="/src/assets/images/product_headphones_studio_1791109392968.jpg">
                      Studio Headphones Photo
                    </option>
                    <option value="/src/assets/images/product_watch_chronograph_1791109405439.jpg">
                      Chronograph Watch Photo
                    </option>
                    <option value="/src/assets/images/product_sneaker_runner_1791109416299.jpg">
                      Runner Sneaker Photo
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed technical specifications and materials..."
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingProductId !== null ? 'Save Product Changes' : 'Save Product to Database'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-zinc-200/80 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-500 bg-zinc-50/60">
                  <th className="py-3.5 px-4 font-medium">Product</th>
                  <th className="py-3.5 px-4 font-medium">Category · Brand</th>
                  <th className="py-3.5 px-4 font-medium">Base Price</th>
                  <th className="py-3.5 px-4 font-medium">Discount</th>
                  <th className="py-3.5 px-4 font-medium">Final Price</th>
                  <th className="py-3.5 px-4 font-medium">Manage Stock</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-sm">
                {products.map((p) => {
                  const finalPrice = getDiscountedPrice(p.price, p.discount);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                          />
                          <div>
                            <div className="font-medium text-zinc-900">{p.name}</div>
                            <div className="text-xs text-zinc-500 font-mono-tabular">
                              Rating: {p.rating} ★ · Updated: {p.updated_at}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600">
                        {p.category} · {p.brand}
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular text-zinc-600">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular text-xs text-amber-700">
                        {p.discount}% off
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular font-medium text-zinc-900">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProduct({
                                ...p,
                                stock: Math.max(0, p.stock - 1),
                                updated_at: formatDjangoTimestamp(new Date()),
                              })
                            }
                            className="w-7 h-7 rounded border border-zinc-300 hover:bg-zinc-100 text-xs font-mono-tabular"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono-tabular text-xs font-medium min-w-[3.5rem] text-center ${
                              p.stock === 0 ? 'text-rose-600' : 'text-zinc-900'
                            }`}
                          >
                            {p.stock === 0 ? '0 (Out)' : `${p.stock} units`}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProduct({
                                ...p,
                                stock: p.stock + 1,
                                updated_at: formatDjangoTimestamp(new Date()),
                              })
                            }
                            className="w-7 h-7 rounded border border-zinc-300 hover:bg-zinc-100 text-xs font-mono-tabular"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditProduct(p)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded hover:bg-zinc-100"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Category Management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleCategorySubmit}
            className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4 self-start"
          >
            <h3 className="text-base font-semibold text-zinc-900">Add New Category</h3>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Smart Home"
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Describe products in this category..."
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Create Category
            </button>
          </form>

          <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-xl divide-y divide-zinc-200/70">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.name).length;
              return (
                <div key={cat.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-zinc-900">{cat.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{cat.description}</div>
                  </div>
                  <div className="text-xs font-mono-tabular text-zinc-500 whitespace-nowrap">
                    {count} {count === 1 ? 'product' : 'products'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Customer Accounts */}
      {activeTab === 'customers' && (
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-xs text-zinc-500 bg-zinc-50/60">
                <th className="py-3.5 px-4 font-medium">Username</th>
                <th className="py-3.5 px-4 font-medium">Full Name & Email</th>
                <th className="py-3.5 px-4 font-medium">Role</th>
                <th className="py-3.5 px-4 font-medium">City · State</th>
                <th className="py-3.5 px-4 font-medium">Password Hash (Django PBKDF2)</th>
                <th className="py-3.5 px-4 font-medium">Orders Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 text-sm">
              {users.map((u) => {
                const userOrderCount = orders.filter((o) => o.user_id === u.id).length;
                return (
                  <tr key={u.id} className="hover:bg-zinc-50/60">
                    <td className="py-3.5 px-4 font-mono-tabular text-xs font-medium text-zinc-900">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-900">{u.full_name}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-600">
                      {u.is_staff ? 'Admin / Staff' : 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-600">
                      {u.city}, {u.state}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-[11px] text-zinc-500">
                      {u.password_hash}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-xs font-medium text-zinc-900">
                      {userOrderCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

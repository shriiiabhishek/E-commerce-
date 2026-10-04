import React, { useState, useEffect, useMemo } from 'react';
import {
  Category,
  Product,
  UserAccount,
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  HERO_BANNER_IMAGE,
  ORDER_STATUS_PIPELINE,
  formatDjangoTimestamp,
  getDiscountedPrice,
} from './data/initialStoreData';
import { VoiceAssistant } from './components/VoiceAssistant';
import { AdminDashboardView } from './components/AdminDashboardView';
import { DjangoBlueprintView } from './components/DjangoBlueprintView';
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
  Package,
  Lock,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

type ActiveRoute =
  | 'home'
  | 'products'
  | 'product_detail'
  | 'cart'
  | 'checkout'
  | 'order_success'
  | 'orders'
  | 'account'
  | 'admin'
  | 'blueprint';

const STORAGE_KEYS = {
  PRODUCTS: 'shopsphere_products_v1',
  CATEGORIES: 'shopsphere_categories_v1',
  USERS: 'shopsphere_users_v1',
  CURRENT_USER_ID: 'shopsphere_current_user_id_v1',
  CART: 'shopsphere_cart_v1',
  ORDERS: 'shopsphere_orders_v1',
};

export default function App() {
  // Persistent SQLite-equivalent state in browser storage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved ? JSON.parse(saved) : 1; // Default signed in as Abhishek Shrivastava
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            user_id: 1,
            product_id: 2,
            quantity: 1,
            created_at: '04 October 2026, 03:00 PM',
            updated_at: '04 October 2026, 03:00 PM',
          },
        ];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Navigation & View States
  const [route, setRoute] = useState<ActiveRoute>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Home section tab: Trending | Best Sellers | New Arrivals | Discount Products
  const [homeCollectionTab, setHomeCollectionTab] = useState<
    'trending' | 'bestsellers' | 'new_arrivals' | 'discounts'
  >('trending');

  // Search, Filter & Sort states (Sections 7 & 8)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(200000);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');

  // Checkout Form states (Section 10)
  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  const [checkoutFullName, setCheckoutFullName] = useState(currentUser?.full_name || '');
  const [checkoutPhone, setCheckoutPhone] = useState(currentUser?.phone || '');
  const [checkoutEmail, setCheckoutEmail] = useState(currentUser?.email || '');
  const [checkoutAddress, setCheckoutAddress] = useState(currentUser?.address || '');
  const [checkoutCity, setCheckoutCity] = useState(currentUser?.city || '');
  const [checkoutState, setCheckoutState] = useState(currentUser?.state || '');
  const [checkoutPincode, setCheckoutPincode] = useState(currentUser?.pincode || '');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] =
    useState<PaymentMethod>('Cash on Delivery');

  useEffect(() => {
    if (currentUser) {
      setCheckoutFullName(currentUser.full_name);
      setCheckoutPhone(currentUser.phone);
      setCheckoutEmail(currentUser.email);
      setCheckoutAddress(currentUser.address);
      setCheckoutCity(currentUser.city);
      setCheckoutState(currentUser.state);
      setCheckoutPincode(currentUser.pincode);
    }
  }, [currentUser]);

  // Auth Form states (Section 4)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  // Current User's Cart Items
  const userCart = useMemo(() => {
    const uid = currentUserId || 0;
    return cartItems
      .filter((ci) => ci.user_id === uid)
      .map((ci) => {
        const product = products.find((p) => p.id === ci.product_id);
        return product ? { ...ci, product } : null;
      })
      .filter((item): item is CartItem & { product: Product } => item !== null);
  }, [cartItems, products, currentUserId]);

  const cartTotalQuantity = useMemo(
    () => userCart.reduce((sum, item) => sum + item.quantity, 0),
    [userCart]
  );

  const cartSummary = useMemo(() => {
    let originalSubtotal = 0;
    let grandTotal = 0;
    for (const item of userCart) {
      const unitDiscounted = getDiscountedPrice(item.product.price, item.product.discount);
      originalSubtotal += item.product.price * item.quantity;
      grandTotal += unitDiscounted * item.quantity;
    }
    const totalDiscount = originalSubtotal - grandTotal;
    return { originalSubtotal, totalDiscount, grandTotal };
  }, [userCart]);

  // Distinct brands for filter sidebar
  const allBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products]
  );

  // Filtered and Sorted Products (Sections 7 & 8)
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCategory && !matchDesc) return false;
        }
        if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (selectedBrand !== 'All' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
        const finalPrice = getDiscountedPrice(p.price, p.discount);
        if (finalPrice > maxPriceFilter) return false;
        if (p.rating < minRatingFilter) return false;
        if (inStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        const priceA = getDiscountedPrice(a.price, a.discount);
        const priceB = getDiscountedPrice(b.price, b.discount);
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.id - a.id; // newest
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    maxPriceFilter,
    minRatingFilter,
    inStockOnly,
    sortBy,
  ]);

  // Home Curated Collection Products
  const homeSectionProducts = useMemo(() => {
    if (homeCollectionTab === 'trending') {
      return products.filter((p) => p.is_trending).slice(0, 6);
    }
    if (homeCollectionTab === 'bestsellers') {
      return products.filter((p) => p.is_bestseller).slice(0, 6);
    }
    if (homeCollectionTab === 'new_arrivals') {
      return products.filter((p) => p.is_new_arrival).slice(0, 6);
    }
    return [...products]
      .filter((p) => p.discount >= 15)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 6);
  }, [products, homeCollectionTab]);

  // Open Product Detail View
  const handleOpenProductDetail = (productId: number) => {
    setSelectedProductId(productId);
    setDetailQuantity(1);
    setRoute('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to Cart Handler (Section 9)
  const handleAddToCart = (product: Product, qty: number = 1, redirectToCheckout = false) => {
    if (product.stock <= 0) {
      showNotice(`Cannot order "${product.name}": Currently Out of Stock.`);
      return;
    }

    const uid = currentUserId || 0;
    const nowStr = formatDjangoTimestamp(new Date());

    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.user_id === uid && ci.product_id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qty);
        return prev.map((ci) =>
          ci.id === existing.id ? { ...ci, quantity: nextQty, updated_at: nowStr } : ci
        );
      }
      return [
        ...prev,
        {
          id: Date.now(),
          user_id: uid,
          product_id: product.id,
          quantity: Math.min(product.stock, qty),
          created_at: nowStr,
          updated_at: nowStr,
        },
      ];
    });

    if (redirectToCheckout) {
      if (!currentUser) {
        showNotice('Please sign in to proceed to Checkout.');
        setRoute('account');
      } else {
        setRoute('checkout');
      }
    } else {
      showNotice(`Added ${product.name} (×${qty}) to your bag.`);
    }
  };

  const handleUpdateCartQty = (cartItemId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.id !== cartItemId) return ci;
          const product = products.find((p) => p.id === ci.product_id);
          if (!product) return ci;
          const nextQty = ci.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > product.stock) {
            showNotice(`Maximum available stock (${product.stock} units) reached.`);
            return ci;
          }
          return {
            ...ci,
            quantity: nextQty,
            updated_at: formatDjangoTimestamp(new Date()),
          };
        })
        .filter((ci): ci is CartItem => ci !== null)
    );
  };

  const handleRemoveCartItem = (cartItemId: number) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== cartItemId));
    showNotice('Item removed from your shopping bag.');
  };

  // Place Order Handler (Section 10)
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showNotice('Login is required to complete checkout.');
      setRoute('account');
      return;
    }
    if (userCart.length === 0) {
      showNotice('Your shopping bag is empty.');
      return;
    }

    // Check stock for all items
    for (const item of userCart) {
      if (item.quantity > item.product.stock) {
        showNotice(`Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`);
        return;
      }
    }

    const now = new Date();
    const timestamp = formatDjangoTimestamp(now);
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${ymd}-${randomCode}`;

    const newOrderId = Date.now();
    const orderItems = userCart.map((item, index) => ({
      id: newOrderId + index + 1,
      order_id: newOrderId,
      product_id: item.product.id,
      product_name: item.product.name,
      product_brand: item.product.brand,
      product_image: item.product.image,
      quantity: item.quantity,
      price: getDiscountedPrice(item.product.price, item.product.discount),
    }));

    const paymentStatus: PaymentStatus =
      checkoutPaymentMethod === 'Demo Online Payment' ? 'Paid' : 'Pending';

    // 1. Create Order & 2. OrderItems
    const createdOrder: Order = {
      id: newOrderId,
      user_id: currentUser.id,
      customer_name: checkoutFullName.trim() || currentUser.full_name,
      customer_email: checkoutEmail.trim() || currentUser.email,
      order_number: orderNumber,
      subtotal_amount: cartSummary.originalSubtotal,
      discount_amount: cartSummary.totalDiscount,
      total_amount: cartSummary.grandTotal,
      status: 'Pending',
      payment_status: paymentStatus,
      payment_method: checkoutPaymentMethod,
      shipping_address: checkoutAddress.trim(),
      city: checkoutCity.trim(),
      state: checkoutState.trim(),
      pincode: checkoutPincode.trim(),
      phone: checkoutPhone.trim(),
      created_at: timestamp,
      updated_at: timestamp,
      items: orderItems,
    };

    // 3. Reduce Product Stock
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = userCart.find((ci) => ci.product_id === prod.id);
        if (!cartMatch) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartMatch.quantity),
          updated_at: timestamp,
        };
      })
    );

    // 4. Clear User Cart
    setCartItems((prev) => prev.filter((ci) => ci.user_id !== currentUser.id));

    // 5 & 6. Save Order with Order Number & Timestamp
    setOrders((prev) => [createdOrder, ...prev]);
    setLastPlacedOrder(createdOrder);

    // 7. Redirect to Order Success Page
    setRoute('order_success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication Handlers (Section 4)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
        u.email.toLowerCase() === loginUsername.trim().toLowerCase()
    );
    if (!matched) {
      setAuthError('No user account found with that username or email.');
      return;
    }
    setCurrentUserId(matched.id);
    setLoginUsername('');
    setLoginPassword('');
    showNotice(`Welcome back, ${matched.full_name}!`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regPassword.length < 8) {
      setAuthError(
        'Django MinimumLengthValidator: Password must contain at least 8 characters.'
      );
      return;
    }
    if (/^\d+$/.test(regPassword)) {
      setAuthError('Django NumericPasswordValidator: Password cannot be entirely numeric.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('Password confirmation does not match.');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === regUsername.trim().toLowerCase())) {
      setAuthError('A user with that username already exists.');
      return;
    }

    const newUser: UserAccount = {
      id: Date.now(),
      username: regUsername.trim(),
      full_name: regFullName.trim() || regUsername.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '+91 98000 00000',
      address: '101 Residency Road',
      city: regCity.trim() || 'New Delhi',
      state: regState.trim() || 'Delhi',
      pincode: '110001',
      is_staff: false,
      password_hash: `pbkdf2_sha256$720000$${regUsername.trim()}_hash`,
      date_joined: formatDjangoTimestamp(new Date()),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    showNotice(`Account created and signed in as ${newUser.full_name}.`);
  };

  // Admin Handlers (Section 13 & 14)
  const handleAdminAddProduct = (
    newProd: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const nowStr = formatDjangoTimestamp(new Date());
    const created: Product = {
      ...newProd,
      id: Date.now(),
      created_at: nowStr,
      updated_at: nowStr,
    };
    setProducts((prev) => [created, ...prev]);
    showNotice(`Added "${created.name}" to SQLite catalog.`);
  };

  const handleAdminUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showNotice(`Updated "${updated.name}".`);
  };

  const handleAdminDeleteProduct = (productId: number) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (target) showNotice(`Deleted "${target.name}" from catalog.`);
  };

  const handleAdminAddCategory = (name: string, description: string) => {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showNotice(`Category "${name}" already exists.`);
      return;
    }
    setCategories((prev) => [...prev, { id: Date.now(), name, description }]);
    showNotice(`Added category "${name}".`);
  };

  const handleAdminUpdateOrderStatus = (
    orderId: number,
    status: OrderStatus,
    paymentStatus: PaymentStatus
  ) => {
    const nowStr = formatDjangoTimestamp(new Date());
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, payment_status: paymentStatus, updated_at: nowStr }
          : o
      )
    );
    showNotice(`Order status updated to "${status}" (${paymentStatus}).`);
  };

  // ShopSphere Voice Assistant Command Router (Section 16 & 17)
  const handleVoiceCommand = (rawText: string) => {
    const cmd = rawText.toLowerCase().trim();

    if (cmd.startsWith('search ')) {
      const query = rawText.slice(7).trim();
      setSearchQuery(query);
      setSelectedCategory('All');
      setSelectedBrand('All');
      setRoute('products');
      return {
        handled: true,
        responseMessage: `Opening /products/?search=${encodeURIComponent(query)}`,
      };
    }

    if (cmd.includes('open mobile phones') || cmd.includes('mobile phones')) {
      setSearchQuery('');
      setSelectedCategory('Mobile Phones');
      setRoute('products');
      return {
        handled: true,
        responseMessage: 'Opening /products/?category=Mobile+Phones',
      };
    }

    if (cmd.includes('show my orders') || cmd.includes('open my orders') || cmd.includes('orders')) {
      setRoute('orders');
      return {
        handled: true,
        responseMessage: 'Navigating to /orders/ (Customer Order History)',
      };
    }

    if (cmd.includes('open cart') || cmd.includes('show cart') || cmd.includes('cart')) {
      setRoute('cart');
      return {
        handled: true,
        responseMessage: 'Navigating to /cart/ (Shopping Cart)',
      };
    }

    if (cmd.includes('go to home') || cmd.includes('open home') || cmd === 'home') {
      setRoute('home');
      return {
        handled: true,
        responseMessage: 'Navigating to / (ShopSphere Home)',
      };
    }

    if (cmd.includes('show shoes') || cmd.includes('open shoes') || cmd.includes('shoes')) {
      setSearchQuery('');
      setSelectedCategory('Shoes');
      setRoute('products');
      return {
        handled: true,
        responseMessage: 'Opening /products/?category=Shoes',
      };
    }

    if (cmd.includes('open profile') || cmd.includes('my profile') || cmd.includes('profile')) {
      setRoute('account');
      return {
        handled: true,
        responseMessage: 'Navigating to /accounts/profile/',
      };
    }

    if (cmd.includes('buy laptop') || cmd.includes('laptop')) {
      const laptopProduct = products.find((p) => p.category === 'Laptops' && p.stock > 0);
      if (cmd.includes('buy laptop') && laptopProduct) {
        handleOpenProductDetail(laptopProduct.id);
        return {
          handled: true,
          responseMessage: `Opening ${laptopProduct.name} for purchase.`,
        };
      }
      setSearchQuery('laptop');
      setSelectedCategory('All');
      setRoute('products');
      return {
        handled: true,
        responseMessage: 'Opening /products/?search=laptop',
      };
    }

    return {
      handled: false,
      responseMessage: "Sorry, I didn't understand that command.",
    };
  };

  // Reusable Product Card (Strictly adheres to Zero-Pill Metadata Discipline)
  const renderProductCard = (product: Product) => {
    const finalPrice = getDiscountedPrice(product.price, product.discount);
    const outOfStock = product.stock <= 0;

    return (
      <article
        key={product.id}
        className="group bg-white border border-zinc-200/80 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div>
          <div
            onClick={() => handleOpenProductDetail(product.id)}
            className="relative aspect-[4/3] bg-[#F4F3EF] overflow-hidden cursor-pointer"
          >
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>

          <div className="p-5 space-y-2">
            {/* Unboxed Metadata with Typographic Separators (Zero-Pill Rule) */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular text-amber-700">{product.rating} ★</span>
            </div>

            <h3
              onClick={() => handleOpenProductDetail(product.id)}
              className="text-base font-semibold text-zinc-900 group-hover:text-amber-800 cursor-pointer leading-snug line-clamp-1"
            >
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2.5 pt-1 font-mono-tabular">
              <span className="text-base font-semibold text-zinc-900">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-xs text-zinc-400 line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-amber-700 font-medium">
                    {product.discount}% off
                  </span>
                </>
              )}
            </div>

            <div className="text-xs text-zinc-500">
              {outOfStock ? (
                <span className="text-rose-600 font-medium">Out of Stock (0 units)</span>
              ) : (
                <span>In stock · {product.stock} units ready to ship</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 flex items-center gap-2.5">
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => handleAddToCart(product, 1, false)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              outOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-[#18181B] hover:bg-zinc-800 text-white'
            }`}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            type="button"
            onClick={() => handleOpenProductDetail(product.id)}
            className="py-2.5 px-3.5 rounded-lg border border-zinc-300 hover:border-zinc-900 text-xs font-medium text-zinc-800 whitespace-nowrap transition-colors"
          >
            View Details
          </button>
        </div>
      </article>
    );
  };

  const activeDetailProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.is_staff) return orders;
    return orders.filter((o) => o.user_id === currentUser.id);
  }, [orders, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#18181B]">
      {/* Top Bar Contract: Strictly 3 Zones (Brand title | 5 Nav Links | 2 Primary Actions) */}
      <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setRoute('home');
            }}
            className="text-2xl font-bold tracking-tight text-zinc-900 font-serif-display whitespace-nowrap"
          >
            ShopSphere
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setRoute('home');
              }}
              className={`hover:text-zinc-900 transition-colors whitespace-nowrap ${
                route === 'home' ? 'text-zinc-900 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Home
            </a>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                setRoute('products');
              }}
              className={`hover:text-zinc-900 transition-colors whitespace-nowrap ${
                route === 'products' || route === 'product_detail'
                  ? 'text-zinc-900 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Products
            </a>
            <a
              href="#orders"
              onClick={(e) => {
                e.preventDefault();
                setRoute('orders');
              }}
              className={`hover:text-zinc-900 transition-colors whitespace-nowrap ${
                route === 'orders' || route === 'order_success'
                  ? 'text-zinc-900 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Orders
            </a>
            <a
              href="#admin"
              onClick={(e) => {
                e.preventDefault();
                setRoute('admin');
              }}
              className={`hover:text-zinc-900 transition-colors whitespace-nowrap ${
                route === 'admin' ? 'text-zinc-900 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Admin Panel
            </a>
            <a
              href="#blueprint"
              onClick={(e) => {
                e.preventDefault();
                setRoute('blueprint');
              }}
              className={`hover:text-zinc-900 transition-colors whitespace-nowrap ${
                route === 'blueprint'
                  ? 'text-zinc-900 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Django Code & Viva
            </a>
          </nav>

          {/* Zone 3: 2 Primary Actions (Account + Cart) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRoute('account')}
              className="px-3.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-lg transition-colors whitespace-nowrap truncate max-w-[150px]"
            >
              {currentUser ? currentUser.username : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setRoute('cart')}
              className="px-4 py-2 text-xs font-medium text-white bg-[#18181B] hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="font-mono-tabular">Cart ({cartTotalQuantity})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Secondary Navigation Strip */}
      <div className="md:hidden flex items-center justify-around border-b border-zinc-200 bg-white px-2 py-2 text-xs font-medium text-zinc-600">
        <button type="button" onClick={() => setRoute('home')} className="px-2 py-1">
          Home
        </button>
        <button type="button" onClick={() => setRoute('products')} className="px-2 py-1">
          Products
        </button>
        <button type="button" onClick={() => setRoute('orders')} className="px-2 py-1">
          Orders
        </button>
        <button type="button" onClick={() => setRoute('admin')} className="px-2 py-1">
          Admin
        </button>
        <button type="button" onClick={() => setRoute('blueprint')} className="px-2 py-1">
          Django Code
        </button>
      </div>

      {/* Transient Feedback Banner */}
      {toastBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] text-white px-5 py-2.5 rounded-lg shadow-lg text-xs font-medium border border-zinc-700">
          {toastBanner}
        </div>
      )}

      {/* MAIN CONTENT ROUTER */}
      <main className="flex-1">
        {/* =========================================================
            ROUTE 1: HOME PAGE (Section 5)
           ========================================================= */}
        {route === 'home' && (
          <div className="space-y-16 pb-16">
            {/* Hero Section: "Shop Everything You Love" + Direct Search & Category Access */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="text-xs text-zinc-500">
                    Full Stack Django E-Commerce Flagship · SQLite3 ORM · Voice Enabled
                  </div>
                  <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08]"
                    style={{ textWrap: 'balance' }}
                  >
                    Shop Everything You Love
                  </h1>
                  <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
                    Discover precision electronics, anodized aluminum workstations, reference
                    acoustics, and horological timepieces backed by real-time inventory validation
                    and live 6-stage order tracking.
                  </p>

                  {/* Search Bar directly reachable in first layer */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setRoute('products');
                    }}
                    className="flex items-center gap-2 max-w-lg"
                  >
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search by name, brand, or category (e.g. "laptop")...'
                        className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors"
                    >
                      Search Catalog
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Category Quick-Route Strip */}
                  <div className="pt-2">
                    <div className="text-xs text-zinc-500 mb-2">Browse by Category:</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setSearchQuery('');
                            setRoute('products');
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-700 transition-colors whitespace-nowrap"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-200 border border-zinc-200/80 shadow-sm">
                    <img
                      src={HERO_BANNER_IMAGE}
                      alt="ShopSphere curated electronics, laptop, studio headphones, and chronograph watch"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                      <div className="text-white space-y-1">
                        <div className="text-xs text-zinc-200">
                          Autumn / Winter 2026 Flagship Edit · 16 Curated SKUs
                        </div>
                        <div className="text-lg font-medium">
                          AeroBook Pro 16 M4 Max · Sonoscapes ANC · Chronos Grade-5 Titanium
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Curated Product Sections (Trending, Best Sellers, New Arrivals, Discount Products) */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <p className="text-xs text-zinc-500">Curated Storefront Collections</p>
                  <h2 className="text-3xl font-semibold text-zinc-900 mt-1">
                    Featured Flagship Releases
                  </h2>
                </div>

                {/* Interactive Segmented Filter Controls */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-lg self-start">
                  {(
                    [
                      { id: 'trending', label: 'Trending' },
                      { id: 'bestsellers', label: 'Best Sellers' },
                      { id: 'new_arrivals', label: 'New Arrivals' },
                      { id: 'discounts', label: 'Discount Products' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHomeCollectionTab(tab.id)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        homeCollectionTab === tab.id
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {homeSectionProducts.map((product) => renderProductCard(product))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setRoute('products');
                  }}
                  className="px-6 py-3 bg-white hover:bg-zinc-900 hover:text-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 transition-colors flex items-center gap-2"
                >
                  View Complete 16-Product Catalog & Advanced Filters
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Section 3: Architecture & Trust Proof Strip */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-8">
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="text-xs font-mono-tabular text-amber-700">
                    01. Real Database Search & Filters
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    Django ORM Multi-Faceted Discovery
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Query across product names, brands, and categories with instant filtering by
                    price ceiling, customer rating, and live stock availability.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono-tabular text-amber-700">
                    02. Atomic Order & Stock Validation
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    Zero-Stock Protection & Live Timelines
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Every checkout deducts product stock atomically, generates a timestamped
                    order number, and links directly to the Admin Order Status pipeline.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono-tabular text-amber-700">
                    03. Complete File-by-File Code & Viva
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    Ready for Local Execution & Academic Demo
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Inspect all Django Python files, ASCII wireframes, request lifecycle diagrams,
                    and 20 viva questions inside the Django Code & Viva tab.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            ROUTE 2: PRODUCTS CATALOG, SEARCH, FILTER & SORT (Sections 7 & 8)
           ========================================================= */}
        {route === 'products' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
              <div>
                <p className="text-xs text-zinc-500">
                  Django ORM QuerySet · products/views.py → product_list_view
                </p>
                <h1 className="text-3xl font-semibold text-zinc-900 mt-1">
                  All Products Catalog ({filteredProducts.length})
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64 sm:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, brand, category..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products"
                  className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:border-zinc-900"
                >
                  <option value="newest">Sort: Newest Arrivals</option>
                  <option value="price_asc">Sort: Price Low to High</option>
                  <option value="price_desc">Sort: Price High to Low</option>
                  <option value="rating">Sort: Highest Rating</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Filter Sidebar */}
              <aside className="lg:col-span-3 space-y-6 bg-white border border-zinc-200/80 rounded-xl p-5 self-start">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedBrand('All');
                      setMaxPriceFilter(200000);
                      setMinRatingFilter(0);
                      setInStockOnly(false);
                      setSortBy('newest');
                    }}
                    className="text-xs text-amber-700 hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-800">Category</label>
                  <div className="space-y-1">
                    {['All', ...categories.map((c) => c.name)].map((catName) => (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setSelectedCategory(catName)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          selectedCategory === catName
                            ? 'bg-zinc-900 text-white font-medium'
                            : 'text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {catName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <label className="block text-xs font-semibold text-zinc-800">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-2 text-xs text-zinc-800"
                  >
                    <option value="All">All Brands ({allBrands.length})</option>
                    {allBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800">Max Price</span>
                    <span className="font-mono-tabular text-zinc-600">
                      ₹{maxPriceFilter.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={200000}
                    step={5000}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full accent-zinc-900"
                  />
                </div>

                {/* Rating Filter */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <label className="block text-xs font-semibold text-zinc-800">
                    Minimum Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[0, 4.5, 4.7, 4.8].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setMinRatingFilter(r)}
                        className={`px-2.5 py-1 rounded text-xs font-mono-tabular border ${
                          minRatingFilter === r
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-600 border-zinc-200'
                        }`}
                      >
                        {r === 0 ? 'Any' : `${r}+ ★`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="pt-2 border-t border-zinc-100">
                  <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-zinc-300 accent-zinc-900"
                    />
                    <span>Exclude Out-of-Stock Products</span>
                  </label>
                </div>
              </aside>

              {/* Right Product Grid */}
              <div className="lg:col-span-9">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white border border-zinc-200/80 rounded-xl p-12 text-center space-y-3">
                    <div className="text-base font-semibold text-zinc-900">
                      No matching products found
                    </div>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto">
                      No products matched your current search or filter criteria. Reset filters to
                      explore all 16 products.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedBrand('All');
                        setMaxPriceFilter(200000);
                        setMinRatingFilter(0);
                        setInStockOnly(false);
                      }}
                      className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg"
                    >
                      Clear Search & Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => renderProductCard(product))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ROUTE 3: PRODUCT DETAIL VIEW (Section 6 - product_detail.html)
           ========================================================= */}
        {route === 'product_detail' && activeDetailProduct && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-12">
            <div>
              <button
                type="button"
                onClick={() => setRoute('products')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Products Catalog
              </button>
            </div>

            {/* Contiguous Purchase Module: Gallery Left, Purchase Specs Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 bg-[#F4F3EF] rounded-2xl overflow-hidden border border-zinc-200/80 aspect-[4/3]">
                <img
                  src={activeDetailProduct.image}
                  alt={activeDetailProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 space-y-6 sticky top-24">
                <div className="space-y-2 border-b border-zinc-100 pb-5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-800">
                      {activeDetailProduct.brand}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeDetailProduct.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular text-amber-700 font-medium">
                      {activeDetailProduct.rating} ★ Rating
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
                    {activeDetailProduct.name}
                  </h1>

                  <div className="flex items-baseline gap-3 pt-2 font-mono-tabular">
                    <span className="text-2xl font-bold text-zinc-900">
                      ₹
                      {getDiscountedPrice(
                        activeDetailProduct.price,
                        activeDetailProduct.discount
                      ).toLocaleString('en-IN')}
                    </span>
                    {activeDetailProduct.discount > 0 && (
                      <>
                        <span className="text-sm text-zinc-400 line-through">
                          ₹{activeDetailProduct.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-amber-700 font-semibold">
                          Save {activeDetailProduct.discount}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {activeDetailProduct.description}
                </p>

                <div className="space-y-3 pt-2 border-t border-zinc-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Availability Status:</span>
                    {activeDetailProduct.stock > 0 ? (
                      <span className="font-mono-tabular font-semibold text-emerald-700">
                        In Stock ({activeDetailProduct.stock} units available)
                      </span>
                    ) : (
                      <span className="font-mono-tabular font-semibold text-rose-600">
                        Out of Stock (0 units — Ordering Disabled)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Catalog Timestamp:</span>
                    <span className="font-mono-tabular text-zinc-700">
                      {activeDetailProduct.created_at}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector & Primary Actions */}
                {activeDetailProduct.stock > 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-700">Select Quantity</span>
                      <div className="flex items-center border border-zinc-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                          className="px-3 py-1.5 text-sm font-mono-tabular hover:bg-zinc-100"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 text-xs font-mono-tabular font-semibold">
                          {detailQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDetailQuantity((q) =>
                              Math.min(activeDetailProduct.stock, q + 1)
                            )
                          }
                          className="px-3 py-1.5 text-sm font-mono-tabular hover:bg-zinc-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(activeDetailProduct, detailQuantity, false)
                        }
                        className="py-3 px-4 rounded-lg border border-zinc-900 text-zinc-900 hover:bg-zinc-100 text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(activeDetailProduct, detailQuantity, true)
                        }
                        className="py-3 px-4 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    This product currently has 0 stock in SQLite (`product.stock == 0`). Ordering is
                    disabled until an administrator replenishes inventory in the Admin Panel.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ROUTE 4: SHOPPING CART (Section 9 - cart.html)
           ========================================================= */}
        {route === 'cart' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="border-b border-zinc-200 pb-5">
              <p className="text-xs text-zinc-500">Django ORM Cart · cart/views.py</p>
              <h1 className="text-3xl font-semibold text-zinc-900 mt-1">
                Your Shopping Cart ({cartTotalQuantity} items)
              </h1>
            </div>

            {userCart.length === 0 ? (
              <div className="bg-white border border-zinc-200/80 rounded-xl p-12 text-center space-y-4">
                <ShoppingBag className="w-8 h-8 text-zinc-400 mx-auto" />
                <div className="text-lg font-semibold text-zinc-900">Your cart is empty</div>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Explore our flagship electronics, watches, footwear, and accessories to add
                  items to your shopping bag.
                </p>
                <button
                  type="button"
                  onClick={() => setRoute('products')}
                  className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium rounded-lg"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs text-zinc-500 bg-zinc-50/60">
                        <th className="py-3.5 px-4 font-medium">Product</th>
                        <th className="py-3.5 px-4 font-medium">Unit Price</th>
                        <th className="py-3.5 px-4 font-medium">Quantity</th>
                        <th className="py-3.5 px-4 font-medium">Subtotal</th>
                        <th className="py-3.5 px-4 font-medium text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/70 text-sm">
                      {userCart.map((item) => {
                        const unitDiscounted = getDiscountedPrice(
                          item.product.price,
                          item.product.discount
                        );
                        const itemSubtotal = unitDiscounted * item.quantity;
                        return (
                          <tr key={item.id}>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-14 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                                />
                                <div>
                                  <div
                                    onClick={() => handleOpenProductDetail(item.product.id)}
                                    className="font-semibold text-zinc-900 hover:underline cursor-pointer"
                                  >
                                    {item.product.name}
                                  </div>
                                  <div className="text-xs text-zinc-500">
                                    {item.product.brand} · Stock: {item.product.stock}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono-tabular">
                              <div className="font-medium text-zinc-900">
                                ₹{unitDiscounted.toLocaleString('en-IN')}
                              </div>
                              {item.product.discount > 0 && (
                                <div className="text-xs text-zinc-400 line-through">
                                  ₹{item.product.price.toLocaleString('en-IN')}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="inline-flex items-center border border-zinc-300 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, -1)}
                                  className="px-2.5 py-1 text-xs font-mono-tabular hover:bg-zinc-100"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 text-xs font-mono-tabular font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, 1)}
                                  className="px-2.5 py-1 text-xs font-mono-tabular hover:bg-zinc-100"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono-tabular font-semibold text-zinc-900">
                              ₹{itemSubtotal.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveCartItem(item.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                                aria-label={`Remove ${item.product.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary Box */}
                <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-xl p-6 space-y-5">
                  <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-3">
                    Cart Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-zinc-600">
                      <span>Original Subtotal</span>
                      <span className="font-mono-tabular">
                        ₹{cartSummary.originalSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Product Discount Savings</span>
                      <span className="font-mono-tabular">
                        -₹{cartSummary.totalDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping</span>
                      <span className="font-mono-tabular">Free Express</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-zinc-900 pt-3 border-t border-zinc-200">
                      <span>Total Payable</span>
                      <span className="font-mono-tabular">
                        ₹{cartSummary.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        showNotice('Please login to proceed to checkout.');
                        setRoute('account');
                      } else {
                        setRoute('checkout');
                      }
                    }}
                    className="w-full py-3 px-4 bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Secure Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            ROUTE 5: CHECKOUT PAGE (Section 10 & 15 - checkout.html)
           ========================================================= */}
        {route === 'checkout' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="border-b border-zinc-200 pb-5">
              <p className="text-xs text-zinc-500">
                @login_required · @transaction.atomic · orders/views.py → checkout_view
              </p>
              <h1 className="text-3xl font-semibold text-zinc-900 mt-1">
                Checkout & Shipping Verification
              </h1>
            </div>

            {!currentUser ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center space-y-4">
                <Lock className="w-7 h-7 text-zinc-500 mx-auto" />
                <h2 className="text-lg font-semibold text-zinc-900">
                  Authentication Required for Checkout
                </h2>
                <p className="text-xs text-zinc-500">
                  Django’s @login_required decorator protects /orders/checkout/. Please sign in to
                  place your order.
                </p>
                <button
                  type="button"
                  onClick={() => setRoute('account')}
                  className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium rounded-lg"
                >
                  Go to Login / Register
                </button>
              </div>
            ) : (
              <form
                onSubmit={handlePlaceOrder}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-xl p-6 sm:p-8 space-y-6">
                  <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-3">
                    1. Shipping Address Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutFullName}
                        onChange={(e) => setCheckoutFullName(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={checkoutCity}
                        onChange={(e) => setCheckoutCity(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={checkoutState}
                        onChange={(e) => setCheckoutState(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutPincode}
                        onChange={(e) => setCheckoutPincode(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono-tabular focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      2. Payment Method (Educational / Local Mode)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                          checkoutPaymentMethod === 'Cash on Delivery'
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={checkoutPaymentMethod === 'Cash on Delivery'}
                            onChange={() => setCheckoutPaymentMethod('Cash on Delivery')}
                            className="accent-zinc-900"
                          />
                          <span className="text-sm font-semibold text-zinc-900">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          Pay upon doorstep delivery. Sets initial payment_status to Pending.
                        </p>
                      </label>

                      <label
                        className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                          checkoutPaymentMethod === 'Demo Online Payment'
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={checkoutPaymentMethod === 'Demo Online Payment'}
                            onChange={() => setCheckoutPaymentMethod('Demo Online Payment')}
                            className="accent-zinc-900"
                          />
                          <span className="text-sm font-semibold text-zinc-900">
                            Demo Online Payment
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          Educational/testing simulation only (no real money). Marks payment_status
                          as Paid.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Order Summary */}
                <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-xl p-6 space-y-5">
                  <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-3">
                    Order Summary ({cartTotalQuantity} items)
                  </h2>

                  <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                    {userCart.map((item) => {
                      const unitDiscounted = getDiscountedPrice(
                        item.product.price,
                        item.product.discount
                      );
                      return (
                        <div
                          key={item.id}
                          className="py-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-zinc-900">{item.product.name}</div>
                            <div className="text-zinc-500">
                              Qty: {item.quantity} × ₹{unitDiscounted.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="font-mono-tabular font-semibold text-zinc-900">
                            ₹{(unitDiscounted * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2.5 text-sm border-t border-zinc-200 pt-4">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span className="font-mono-tabular">
                        ₹{cartSummary.originalSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono-tabular">
                        -₹{cartSummary.totalDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                      <span>Grand Total</span>
                      <span className="font-mono-tabular">
                        ₹{cartSummary.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Place Order (₹{cartSummary.grandTotal.toLocaleString('en-IN')})
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* =========================================================
            ROUTE 6: ORDER SUCCESS PAGE (Section 10 & 12)
           ========================================================= */}
        {route === 'order_success' && lastPlacedOrder && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle2 className="w-7 h-7 shrink-0" />
                <div>
                  <div className="text-xs font-mono-tabular">
                    Order Confirmed · Stock Deducted · Cart Cleared
                  </div>
                  <h1 className="text-2xl font-semibold text-zinc-900">
                    Thank you! Your order has been placed.
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs">
                <div>
                  <span className="text-zinc-500 block">Order Number:</span>
                  <span className="font-mono-tabular font-bold text-zinc-900 text-sm">
                    {lastPlacedOrder.order_number}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Order Placed Timestamp (Django TZ):</span>
                  <span className="font-mono-tabular font-semibold text-zinc-900">
                    {lastPlacedOrder.created_at}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Payment Method & Status:</span>
                  <span className="font-medium text-zinc-900">
                    {lastPlacedOrder.payment_method} · {lastPlacedOrder.payment_status}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Order Status:</span>
                  <span className="font-semibold text-amber-700">{lastPlacedOrder.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoute('orders')}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg"
                >
                  Track Order Timeline in Order History
                </button>
                <button
                  type="button"
                  onClick={() => setRoute('admin')}
                  className="px-5 py-2.5 border border-zinc-300 hover:border-zinc-900 text-zinc-800 text-xs font-medium rounded-lg"
                >
                  Open Admin Dashboard to Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            ROUTE 7: CUSTOMER ORDERS & 6-STAGE TIMELINE (Section 11 & 12)
           ========================================================= */}
        {route === 'orders' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
              <div>
                <p className="text-xs text-zinc-500">
                  Real-Time Order Tracking & Timezone Timestamps · orders/views.py
                </p>
                <h1 className="text-3xl font-semibold text-zinc-900 mt-1">
                  Order History & Status Timeline ({userOrders.length})
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setRoute('admin')}
                className="px-4 py-2 border border-zinc-300 hover:border-zinc-900 rounded-lg text-xs font-medium text-zinc-800 self-start"
              >
                Change Order Status in Admin Panel →
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center space-y-3">
                <Package className="w-8 h-8 text-zinc-400 mx-auto" />
                <div className="text-base font-semibold text-zinc-900">No orders placed yet</div>
                <button
                  type="button"
                  onClick={() => setRoute('products')}
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map((order) => {
                  const currentStageIdx = ORDER_STATUS_PIPELINE.indexOf(order.status);
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 space-y-6"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="font-mono-tabular font-bold text-zinc-900 text-sm">
                              {order.order_number}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Customer: {order.customer_name}</span>
                          </div>
                          <div className="text-xs text-zinc-500 font-mono-tabular">
                            Order placed: {order.created_at} · Last updated: {order.updated_at}
                          </div>
                        </div>

                        <div className="text-right font-mono-tabular">
                          <div className="text-base font-bold text-zinc-900">
                            ₹{order.total_amount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {order.payment_method} · Payment: {order.payment_status}
                          </div>
                        </div>
                      </div>

                      {/* 6-Stage Order Status Timeline (Section 11) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-900">
                            Order Tracking Pipeline
                          </span>
                          <span
                            className={`font-semibold ${
                              isCancelled ? 'text-rose-600' : 'text-amber-700'
                            }`}
                          >
                            Current Status: {order.status}
                          </span>
                        </div>

                        {isCancelled ? (
                          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                            This order was marked as Cancelled.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                            {ORDER_STATUS_PIPELINE.map((stage, idx) => {
                              const completed = idx <= currentStageIdx;
                              const isCurrent = idx === currentStageIdx;
                              return (
                                <div
                                  key={stage}
                                  className={`p-3 rounded-lg border text-xs transition-colors ${
                                    completed
                                      ? 'bg-zinc-900 text-white border-zinc-900'
                                      : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                                  }`}
                                >
                                  <div className="font-mono-tabular text-[11px] opacity-75">
                                    Step 0{idx + 1}
                                  </div>
                                  <div className="font-semibold mt-0.5">
                                    {stage === 'Pending' ? 'Order Placed' : stage}
                                  </div>
                                  <div className="text-[11px] mt-1 opacity-80">
                                    {isCurrent
                                      ? 'Active Stage'
                                      : completed
                                      ? 'Completed'
                                      : 'Upcoming'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Ordered Items List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-xs">
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-zinc-900">{item.product_name}</div>
                              <div className="text-zinc-500">
                                {item.product_brand} · Qty: {item.quantity} × ₹
                                {item.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            ROUTE 8: AUTHENTICATION & USER PROFILE (Section 4)
           ========================================================= */}
        {route === 'account' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
              <div>
                <p className="text-xs text-zinc-500">
                  Django Authentication & Session Control · accounts/views.py
                </p>
                <h1 className="text-3xl font-semibold text-zinc-900 mt-1">
                  {currentUser ? `Account Profile: ${currentUser.full_name}` : 'Sign In or Register'}
                </h1>
              </div>

              {/* Instant Demo Account Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-500">Quick Switch User:</span>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setCurrentUserId(u.id);
                      showNotice(`Switched active session to ${u.full_name}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      currentUserId === u.id
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                    }`}
                  >
                    {u.username} ({u.is_staff ? 'Admin' : 'Customer'})
                  </button>
                ))}
              </div>
            </div>

            {currentUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-5 self-start">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div>
                      <div className="text-xs text-zinc-500">
                        {currentUser.is_staff ? 'Staff / Superuser Account' : 'Verified Customer'}
                      </div>
                      <h2 className="text-xl font-semibold text-zinc-900">
                        {currentUser.full_name}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUserId(null);
                        showNotice('Logged out safely.');
                      }}
                      className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Username:</span>
                      <span className="font-mono-tabular font-medium text-zinc-900">
                        {currentUser.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="text-zinc-900">{currentUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Phone:</span>
                      <span className="font-mono-tabular text-zinc-900">{currentUser.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Default Shipping:</span>
                      <span className="text-zinc-900">
                        {currentUser.address}, {currentUser.city}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Password Storage:</span>
                      <span className="font-mono-tabular text-zinc-500">
                        {currentUser.password_hash}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Recent Orders ({userOrders.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setRoute('orders')}
                      className="text-xs text-amber-700 font-medium hover:underline"
                    >
                      Open Full Timeline View →
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {userOrders.map((o) => (
                      <div
                        key={o.id}
                        className="py-3.5 flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="font-mono-tabular font-semibold text-zinc-900">
                            {o.order_number}
                          </div>
                          <div className="text-zinc-500">{o.created_at}</div>
                        </div>
                        <div className="text-right font-mono-tabular">
                          <div className="font-semibold text-zinc-900">
                            ₹{o.total_amount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-amber-700">{o.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white border border-zinc-200/80 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-md ${
                      authMode === 'login' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-md ${
                      authMode === 'register' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
                    }`}
                  >
                    Register New Account
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {authError}
                  </div>
                )}

                {authMode === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Username or Email *
                      </label>
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="abhishek_admin or priya_sharma"
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                    >
                      Sign In with CSRF Token
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">City</label>
                        <input
                          type="text"
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          placeholder="New Delhi"
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">State</label>
                        <input
                          type="text"
                          value={regState}
                          onChange={(e) => setRegState(e.target.value)}
                          placeholder="Delhi"
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Password (min 8 chars, non-numeric) *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                    >
                      Register & Create Account
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            ROUTE 9: ADMIN PANEL & DASHBOARD (Section 13 & 14)
           ========================================================= */}
        {route === 'admin' && (
          <AdminDashboardView
            products={products}
            categories={categories}
            orders={orders}
            users={users}
            onAddProduct={handleAdminAddProduct}
            onUpdateProduct={handleAdminUpdateProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onAddCategory={handleAdminAddCategory}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
          />
        )}

        {/* =========================================================
            ROUTE 10: DJANGO SOURCE CODE, WIREFRAMES & 20 VIVA Q&A
           ========================================================= */}
        {route === 'blueprint' && <DjangoBlueprintView />}
      </main>

      {/* Floating ShopSphere Voice Assistant (Sections 16 & 17) */}
      <VoiceAssistant onExecuteCommand={handleVoiceCommand} />

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-zinc-200/80 bg-white mt-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            <span className="font-semibold text-zinc-900">
              ShopSphere – Full Stack E-Commerce Shopping Platform
            </span>{' '}
            · All rights reserved Abhishek Shrivastava
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setRoute('blueprint')}
              className="hover:text-zinc-900 transition-colors"
            >
              Django Source Code & 20 Viva Q&A
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                setProducts(INITIAL_PRODUCTS);
                setCategories(INITIAL_CATEGORIES);
                setUsers(INITIAL_USERS);
                setOrders(INITIAL_ORDERS);
                setCurrentUserId(1);
                showNotice('Reset SQLite database state to initial 16 sample products.');
              }}
              className="hover:text-zinc-900 transition-colors"
            >
              Reset Sample Database
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

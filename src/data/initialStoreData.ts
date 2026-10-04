export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discount: number; // percentage e.g. 15 means 15% off
  stock: number;
  image: string;
  rating: number;
  is_trending?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAccount {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_staff: boolean;
  password_hash: string; // simulated PBKDF2 hash
  date_joined: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';
export type PaymentMethod = 'Cash on Delivery' | 'Demo Online Payment';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_brand: string;
  product_image: string;
  quantity: number;
  price: number; // discounted unit price at purchase time
}

export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  order_number: string;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export const ORDER_STATUS_PIPELINE: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export function formatDjangoTimestamp(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
}

export function getDiscountedPrice(price: number, discount: number): number {
  if (!discount || discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

// High-craft studio SVG product artwork generator for non-photo slots so zero external URLs fail
function createStudioProductSvg(
  title: string,
  subtitle: string,
  bgHex: string,
  accentHex: string,
  shapeType: 'phone' | 'laptop' | 'headphones' | 'watch' | 'shoe' | 'camera' | 'jacket' | 'bag' | 'speaker'
): string {
  let illustration = '';
  switch (shapeType) {
    case 'phone':
      illustration = `
        <rect x="240" y="85" width="120" height="230" rx="22" fill="#18181B" stroke="${accentHex}" stroke-width="3"/>
        <rect x="248" y="95" width="104" height="210" rx="16" fill="#27272A"/>
        <circle cx="300" cy="110" r="4" fill="#09090B"/>
        <circle cx="272" cy="135" r="14" fill="#18181B" stroke="${accentHex}" stroke-width="2"/>
        <circle cx="272" cy="168" r="14" fill="#18181B" stroke="${accentHex}" stroke-width="2"/>
      `;
      break;
    case 'laptop':
      illustration = `
        <rect x="175" y="95" width="250" height="160" rx="10" fill="#18181B" stroke="${accentHex}" stroke-width="3"/>
        <rect x="187" y="107" width="226" height="136" rx="4" fill="#27272A"/>
        <path d="M145 255 H455 L435 275 H165 Z" fill="#52525B"/>
      `;
      break;
    case 'headphones':
      illustration = `
        <path d="M210 210 V175 C210 120 390 120 390 175 V210" fill="none" stroke="#18181B" stroke-width="16" stroke-linecap="round"/>
        <rect x="192" y="185" width="36" height="72" rx="18" fill="${accentHex}" stroke="#18181B" stroke-width="3"/>
        <rect x="372" y="185" width="36" height="72" rx="18" fill="${accentHex}" stroke="#18181B" stroke-width="3"/>
      `;
      break;
    case 'watch':
      illustration = `
        <rect x="272" y="75" width="56" height="250" rx="10" fill="#3F3F46"/>
        <circle cx="300" cy="200" r="62" fill="#18181B" stroke="${accentHex}" stroke-width="5"/>
        <circle cx="300" cy="200" r="50" fill="#27272A"/>
        <line x1="300" y1="200" x2="300" y2="165" stroke="${accentHex}" stroke-width="3" stroke-linecap="round"/>
        <line x1="300" y1="200" x2="330" y2="200" stroke="#F4F4F5" stroke-width="2.5" stroke-linecap="round"/>
      `;
      break;
    case 'shoe':
      illustration = `
        <path d="M165 245 Q195 160 255 170 L335 205 Q410 210 425 245 L430 270 H160 Z" fill="#27272A" stroke="${accentHex}" stroke-width="3"/>
        <rect x="155" y="262" width="280" height="20" rx="8" fill="#F4F4F5" stroke="#18181B" stroke-width="2"/>
      `;
      break;
    case 'camera':
      illustration = `
        <rect x="185" y="125" width="230" height="150" rx="18" fill="#18181B" stroke="${accentHex}" stroke-width="3"/>
        <rect x="255" y="102" width="65" height="24" rx="6" fill="#27272A"/>
        <circle cx="300" cy="200" r="48" fill="#27272A" stroke="${accentHex}" stroke-width="4"/>
        <circle cx="300" cy="200" r="24" fill="#09090B"/>
      `;
      break;
    case 'jacket':
      illustration = `
        <path d="M235 95 L300 115 L365 95 L420 155 L390 285 H210 L180 155 Z" fill="#27272A" stroke="${accentHex}" stroke-width="3"/>
        <line x1="300" y1="115" x2="300" y2="285" stroke="${accentHex}" stroke-width="2"/>
      `;
      break;
    case 'bag':
      illustration = `
        <path d="M255 130 C255 85 345 85 345 130" fill="none" stroke="#18181B" stroke-width="8"/>
        <rect x="200" y="130" width="200" height="165" rx="16" fill="#27272A" stroke="${accentHex}" stroke-width="3"/>
        <rect x="275" y="185" width="50" height="24" rx="6" fill="${accentHex}"/>
      `;
      break;
    case 'speaker':
      illustration = `
        <rect x="220" y="85" width="160" height="230" rx="26" fill="#18181B" stroke="${accentHex}" stroke-width="3"/>
        <circle cx="300" cy="145" r="28" fill="#27272A" stroke="${accentHex}" stroke-width="2"/>
        <circle cx="300" cy="235" r="44" fill="#27272A" stroke="${accentHex}" stroke-width="3"/>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <radialGradient id="grad" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${bgHex}" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="600" height="450" fill="url(#grad)"/>
    <ellipse cx="300" cy="310" rx="165" ry="20" fill="#000000" opacity="0.08"/>
    ${illustration}
    <text x="300" y="372" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="600" fill="#18181B">${title}</text>
    <text x="300" y="398" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="2" fill="#71717A">${subtitle.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const HERO_BANNER_IMAGE = '/src/assets/images/shopsphere_hero_banner_1791109362832.jpg';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Electronics', description: 'Precision home audio, mirrorless imaging, and smart studio hardware.' },
  { id: 2, name: 'Mobile Phones', description: 'Flagship 5G smartphones with pro-grade computational optics and OLED displays.' },
  { id: 3, name: 'Laptops', description: 'Ultra-thin anodized aluminum workstations and creator notebooks.' },
  { id: 4, name: 'Headphones', description: 'Reference-grade active noise cancelling over-ear and true wireless acoustics.' },
  { id: 5, name: 'Shoes', description: 'Architectural performance running footwear and minimalist court sneakers.' },
  { id: 6, name: 'Watches', description: 'Mechanical chronographs, titanium field watches, and sapphire timepieces.' },
  { id: 7, name: 'Clothing', description: 'Technical merino outerwear, heavyweight organic cotton, and tailored essentials.' },
  { id: 8, name: 'Accessories', description: 'Full-grain vegetable-tanned leather goods, GaN chargers, and desk architecture.' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'AeroBook Pro 16 M4 Max',
    description: 'Machined from a single block of recycled space-gray aluminum. Features a 16.2-inch Liquid Retina XDR display, 36GB unified memory, 1TB NVMe SSD, and 22-hour battery endurance for software engineering and 8K video workflows.',
    category: 'Laptops',
    brand: 'AetherLabs',
    price: 189900,
    discount: 12,
    stock: 14,
    image: '/src/assets/images/product_laptop_pro_1791109378289.jpg',
    rating: 4.9,
    is_trending: true,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '01 October 2026, 10:15 AM',
    updated_at: '04 October 2026, 09:00 AM',
  },
  {
    id: 2,
    name: 'Sonoscapes Studio ANC Over-Ear',
    description: 'Bespoke 45mm beryllium-coated dynamic drivers paired with hybrid 8-microphone adaptive noise cancellation. Crafted with memory-foam lambskin ear cushions and brushed champagne aluminum yokes.',
    category: 'Headphones',
    brand: 'Klangwerk',
    price: 34990,
    discount: 15,
    stock: 22,
    image: '/src/assets/images/product_headphones_studio_1791109392968.jpg',
    rating: 4.8,
    is_trending: true,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '01 October 2026, 11:30 AM',
    updated_at: '04 October 2026, 09:15 AM',
  },
  {
    id: 3,
    name: 'Chronos Grade-5 Titanium Automatic',
    description: 'Swiss-calibrated automatic chronograph housed in a 40mm Grade-5 brushed titanium case with double-domed anti-reflective sapphire crystal, exhibition caseback, and Italian calfskin strap.',
    category: 'Watches',
    brand: 'Vanguard Horology',
    price: 64500,
    discount: 10,
    stock: 8,
    image: '/src/assets/images/product_watch_chronograph_1791109405439.jpg',
    rating: 4.9,
    is_trending: true,
    is_bestseller: false,
    is_new_arrival: true,
    created_at: '02 October 2026, 02:20 PM',
    updated_at: '04 October 2026, 10:00 AM',
  },
  {
    id: 4,
    name: 'CloudStride Carbon Knit Runner',
    description: 'Engineered 3D-knit breathable upper fused to a dual-density nitrogen-infused supercritical midsole with an embedded full-length carbon fiber propulsion plate.',
    category: 'Shoes',
    brand: 'Verge Athletics',
    price: 14990,
    discount: 20,
    stock: 30,
    image: '/src/assets/images/product_sneaker_runner_1791109416299.jpg',
    rating: 4.7,
    is_trending: false,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '02 October 2026, 04:10 PM',
    updated_at: '04 October 2026, 10:05 AM',
  },
  {
    id: 5,
    name: 'NovaPhone 16 Pro Titanium 256GB',
    description: 'Aerospace-grade titanium frame with a 6.3-inch 120Hz LTPO OLED ProMotion display, triple 48MP periscope telephoto camera array, hardware ray-tracing neural processor, and USB-C 10Gbps transfer.',
    category: 'Mobile Phones',
    brand: 'AetherLabs',
    price: 119900,
    discount: 8,
    stock: 19,
    image: createStudioProductSvg('NovaPhone 16 Pro', 'Mobile Phones · 256GB Titanium', '#F4F3EF', '#B45309', 'phone'),
    rating: 4.9,
    is_trending: true,
    is_bestseller: true,
    is_new_arrival: true,
    created_at: '02 October 2026, 05:45 PM',
    updated_at: '04 October 2026, 11:10 AM',
  },
  {
    id: 6,
    name: 'Lumixia S9 Full-Frame Mirrorless Camera',
    description: '24.2MP full-frame BSI CMOS sensor with 5-axis Dual I.S.2 stabilization, 6K open-gate internal 10-bit recording, phase-hybrid autofocus, and weather-sealed magnesium alloy body.',
    category: 'Electronics',
    brand: 'OptikWerk',
    price: 142000,
    discount: 10,
    stock: 6,
    image: createStudioProductSvg('Lumixia S9 Mirrorless', 'Full-Frame 6K Cinema Optics', '#F3F4F6', '#D97706', 'camera'),
    rating: 4.8,
    is_trending: false,
    is_bestseller: false,
    is_new_arrival: true,
    created_at: '03 October 2026, 09:00 AM',
    updated_at: '04 October 2026, 11:20 AM',
  },
  {
    id: 7,
    name: 'ZenithBook Air 14 OLED Ultralight',
    description: 'Weighing just 1.08 kg, the ZenithBook Air 14 pairs a 2.8K 120Hz HDR OLED panel with an NPU-accelerated 12-core processor, 16GB LPDDR5X RAM, and whisper-quiet fanless thermal architecture.',
    category: 'Laptops',
    brand: 'ZenithCompute',
    price: 94990,
    discount: 15,
    stock: 17,
    image: createStudioProductSvg('ZenithBook Air 14', '2.8K OLED · 1.08kg Ultralight', '#F5F5F4', '#0284C7', 'laptop'),
    rating: 4.6,
    is_trending: false,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '03 October 2026, 10:30 AM',
    updated_at: '04 October 2026, 11:40 AM',
  },
  {
    id: 8,
    name: 'PixelFold Horizon 5G Dual-Screen',
    description: 'Unfolds into an ultra-thin 8.0-inch inner tablet canvas with seamless titanium hinge mechanics, IPX8 water resistance, and pro-level AI computational night photography.',
    category: 'Mobile Phones',
    brand: 'VertexMobile',
    price: 154990,
    discount: 14,
    stock: 9,
    image: createStudioProductSvg('PixelFold Horizon 5G', '8.0-Inch Foldable OLED Flagship', '#F4F4F5', '#4F46E5', 'phone'),
    rating: 4.7,
    is_trending: true,
    is_bestseller: false,
    is_new_arrival: true,
    created_at: '03 October 2026, 11:15 AM',
    updated_at: '04 October 2026, 12:00 PM',
  },
  {
    id: 9,
    name: 'AcousticSphere Hi-Fi Spatial Smart Speaker',
    description: 'Room-calibrating 360-degree Dolby Atmos acoustic array with a dedicated 5-inch long-throw subwoofer, lossless Wi-Fi AirPlay 2 streaming, and spun-aluminum touch top surface.',
    category: 'Electronics',
    brand: 'Klangwerk',
    price: 28500,
    discount: 18,
    stock: 25,
    image: createStudioProductSvg('AcousticSphere 360', 'Lossless Spatial Studio Speaker', '#F5F5F4', '#B45309', 'speaker'),
    rating: 4.7,
    is_trending: false,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '03 October 2026, 12:40 PM',
    updated_at: '04 October 2026, 12:30 PM',
  },
  {
    id: 10,
    name: 'AetherPods Pro Lossless True Wireless',
    description: 'Planar magnetic micro-drivers with aptX Lossless Bluetooth 5.4, adaptive transparency mode, IP55 sweat protection, and wireless Qi2 charging case offering 38 hours of total playback.',
    category: 'Headphones',
    brand: 'AetherLabs',
    price: 21990,
    discount: 10,
    stock: 34,
    image: createStudioProductSvg('AetherPods Pro TWS', 'Planar Magnetic True Wireless', '#F4F3EF', '#059669', 'headphones'),
    rating: 4.8,
    is_trending: true,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '03 October 2026, 01:50 PM',
    updated_at: '04 October 2026, 01:00 PM',
  },
  {
    id: 11,
    name: 'TerraShell 3-Layer Gore-Tex Alpine Jacket',
    description: 'Stormproof 3-layer breathable membrane shell with fully taped micro-seams, articulated raglan sleeves, YKK AquaGuard zippers, and helmet-compatible storm hood.',
    category: 'Clothing',
    brand: 'NordicForm',
    price: 24990,
    discount: 25,
    stock: 15,
    image: createStudioProductSvg('TerraShell Alpine Jacket', '3-Layer Stormproof Technical Shell', '#F3F4F6', '#D97706', 'jacket'),
    rating: 4.8,
    is_trending: false,
    is_bestseller: false,
    is_new_arrival: true,
    created_at: '03 October 2026, 03:00 PM',
    updated_at: '04 October 2026, 01:15 PM',
  },
  {
    id: 12,
    name: 'Kyoto Selvedge Heavyweight Overshirt',
    description: 'Woven on vintage shuttle looms from 14oz organic Japanese cotton. Garment-washed for a supple hand feel with corozo nut buttons and dual chest utility pockets.',
    category: 'Clothing',
    brand: 'Atelier Kuro',
    price: 11500,
    discount: 15,
    stock: 21,
    image: createStudioProductSvg('Kyoto Selvedge Overshirt', '14oz Japanese Shuttle-Loom Cotton', '#F5F5F4', '#78716C', 'jacket'),
    rating: 4.6,
    is_trending: false,
    is_bestseller: false,
    is_new_arrival: true,
    created_at: '03 October 2026, 04:15 PM',
    updated_at: '04 October 2026, 01:30 PM',
  },
  {
    id: 13,
    name: 'bauhaus Minimalist Court Leather Sneaker',
    description: 'Hand-stitched in Portugal using full-grain Italian calfskin leather, vegetable-tanned leather lining, and a Margom recycled rubber cup sole for timeless daily wear.',
    category: 'Shoes',
    brand: 'Verge Athletics',
    price: 16800,
    discount: 10,
    stock: 12,
    image: createStudioProductSvg('Bauhaus Court Sneaker', 'Full-Grain Italian Calfskin', '#F4F3EF', '#B45309', 'shoe'),
    rating: 4.9,
    is_trending: false,
    is_bestseller: true,
    is_new_arrival: false,
    created_at: '03 October 2026, 05:00 PM',
    updated_at: '04 October 2026, 01:45 PM',
  },
  {
    id: 14,
    name: 'Solaris Sapphire Field Watch 38mm',
    description: 'Light-powered solar quartz movement with a 6-month power reserve, matte obsidian dial with Super-LumiNova numerals, 100m water resistance, and woven ballistic nylon NATO strap.',
    category: 'Watches',
    brand: 'Vanguard Horology',
    price: 22400,
    discount: 20,
    stock: 18,
    image: createStudioProductSvg('Solaris Field Watch 38mm', 'Sapphire Solar · 100m Water Resistant', '#F4F4F5', '#0D9488', 'watch'),
    rating: 4.7,
    is_trending: false,
    is_bestseller: false,
    is_new_arrival: false,
    created_at: '03 October 2026, 06:10 PM',
    updated_at: '04 October 2026, 02:00 PM',
  },
  {
    id: 15,
    name: 'Nomad Tuscan Leather Weekender Briefcase',
    description: 'Crafted from full-grain vegetable-tanned Bridle leather with solid brushed brass hardware, padded 16-inch laptop compartment, and trolley pass-through strap.',
    category: 'Accessories',
    brand: 'Sartoria Pelletteria',
    price: 29500,
    discount: 22,
    stock: 7,
    image: createStudioProductSvg('Tuscan Leather Briefcase', 'Full-Grain Vegetable-Tanned Leather', '#F5F5F0', '#92400E', 'bag'),
    rating: 4.9,
    is_trending: true,
    is_bestseller: false,
    is_new_arrival: false,
    created_at: '03 October 2026, 07:30 PM',
    updated_at: '04 October 2026, 02:10 PM',
  },
  {
    id: 16,
    name: 'VoltDock 140W GaN Pro Desktop Station',
    description: 'Machined aluminum 6-port Thunderbolt & USB-C PD 3.1 GaN charging hub with real-time OLED wattage readout and braided aramid-fiber power cable.',
    category: 'Accessories',
    brand: 'ZenithCompute',
    price: 8990,
    discount: 15,
    stock: 0, // Out of stock item to demonstrate zero-stock prevention!
    image: createStudioProductSvg('VoltDock 140W GaN Hub', '6-Port USB-C PD 3.1 Desktop Station', '#F4F4F5', '#E11D48', 'speaker'),
    rating: 4.5,
    is_trending: false,
    is_bestseller: false,
    is_new_arrival: true,
    created_at: '03 October 2026, 08:45 PM',
    updated_at: '04 October 2026, 02:30 PM',
  },
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    username: 'abhishek_admin',
    full_name: 'Abhishek Shrivastava',
    email: 'shrivastavaabhishek6677@gmail.com',
    phone: '+91 98765 43210',
    address: '42 Connaught Place, Block B',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    is_staff: true,
    password_hash: 'pbkdf2_sha256$720000$admin123',
    date_joined: '01 October 2026, 09:00 AM',
  },
  {
    id: 2,
    username: 'priya_sharma',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98111 22334',
    address: '18 Indiranagar 100 Feet Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    is_staff: false,
    password_hash: 'pbkdf2_sha256$720000$customer123',
    date_joined: '02 October 2026, 01:20 PM',
  },
  {
    id: 3,
    username: 'rahul_verma',
    full_name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 98220 55667',
    address: '704 Marine Drive Residency',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400020',
    is_staff: false,
    password_hash: 'pbkdf2_sha256$720000$customer123',
    date_joined: '03 October 2026, 04:05 PM',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 101,
    user_id: 1,
    customer_name: 'Abhishek Shrivastava',
    customer_email: 'shrivastavaabhishek6677@gmail.com',
    order_number: 'ORD-20261004-8841',
    subtotal_amount: 224890,
    discount_amount: 28036,
    total_amount: 196854,
    status: 'Shipped',
    payment_status: 'Paid',
    payment_method: 'Demo Online Payment',
    shipping_address: '42 Connaught Place, Block B',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    phone: '+91 98765 43210',
    created_at: '04 October 2026, 01:15 PM',
    updated_at: '04 October 2026, 02:45 PM',
    items: [
      {
        id: 1,
        order_id: 101,
        product_id: 1,
        product_name: 'AeroBook Pro 16 M4 Max',
        product_brand: 'AetherLabs',
        product_image: '/src/assets/images/product_laptop_pro_1791109378289.jpg',
        quantity: 1,
        price: 167112,
      },
      {
        id: 2,
        order_id: 101,
        product_id: 2,
        product_name: 'Sonoscapes Studio ANC Over-Ear',
        product_brand: 'Klangwerk',
        product_image: '/src/assets/images/product_headphones_studio_1791109392968.jpg',
        quantity: 1,
        price: 29742,
      },
    ],
  },
  {
    id: 102,
    user_id: 2,
    customer_name: 'Priya Sharma',
    customer_email: 'priya.sharma@example.com',
    order_number: 'ORD-20261004-7392',
    subtotal_amount: 64500,
    discount_amount: 6450,
    total_amount: 58050,
    status: 'Delivered',
    payment_status: 'Paid',
    payment_method: 'Cash on Delivery',
    shipping_address: '18 Indiranagar 100 Feet Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    phone: '+91 98111 22334',
    created_at: '03 October 2026, 05:30 PM',
    updated_at: '04 October 2026, 11:20 AM',
    items: [
      {
        id: 3,
        order_id: 102,
        product_id: 3,
        product_name: 'Chronos Grade-5 Titanium Automatic',
        product_brand: 'Vanguard Horology',
        product_image: '/src/assets/images/product_watch_chronograph_1791109405439.jpg',
        quantity: 1,
        price: 58050,
      },
    ],
  },
  {
    id: 103,
    user_id: 3,
    customer_name: 'Rahul Verma',
    customer_email: 'rahul.verma@example.com',
    order_number: 'ORD-20261004-9104',
    subtotal_amount: 29980,
    discount_amount: 5996,
    total_amount: 23984,
    status: 'Pending',
    payment_status: 'Pending',
    payment_method: 'Cash on Delivery',
    shipping_address: '704 Marine Drive Residency',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400020',
    phone: '+91 98220 55667',
    created_at: '04 October 2026, 03:10 PM',
    updated_at: '04 October 2026, 03:10 PM',
    items: [
      {
        id: 4,
        order_id: 103,
        product_id: 4,
        product_name: 'CloudStride Carbon Knit Runner',
        product_brand: 'Verge Athletics',
        product_image: '/src/assets/images/product_sneaker_runner_1791109416299.jpg',
        quantity: 2,
        price: 11992,
      },
    ],
  },
];

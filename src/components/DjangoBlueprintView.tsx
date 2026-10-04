import React, { useState } from 'react';
import { DJANGO_PROJECT_FILES, VIVA_QUESTIONS } from '../data/djangoProjectBlueprint';
import { Copy, Check, Terminal, Code2, BookOpen, CheckSquare, Layers } from 'lucide-react';

const INITIAL_TEST_CHECKLIST = [
  { id: 1, label: 'Register a new user account with password validation' },
  { id: 2, label: 'Login and verify session persistence in top bar' },
  { id: 3, label: 'Search products by name, brand, or category (e.g., "laptop")' },
  { id: 4, label: 'Open Product Detail page and inspect stock & specifications' },
  { id: 5, label: 'Verify zero-stock product (VoltDock 140W GaN) prevents ordering' },
  { id: 6, label: 'Add in-stock product to Cart and see navbar badge increment' },
  { id: 7, label: 'Increase/decrease quantity in Cart and verify subtotal/discount math' },
  { id: 8, label: 'Complete Checkout with Cash on Delivery or Demo Online Payment' },
  { id: 9, label: 'Place Order and verify unique Order Number & timezone timestamp' },
  { id: 10, label: 'Open Customer Order History and view 6-stage visual timeline' },
  { id: 11, label: 'Switch to Admin Dashboard and inspect 6 live revenue/order cards' },
  { id: 12, label: 'Admin changes Order Status (e.g. Shipped → Delivered)' },
  { id: 13, label: 'Customer sees updated Order Status immediately on Order Timeline' },
  { id: 14, label: 'Test ShopSphere Voice Assistant ("Search laptop", "Open cart", etc.)' },
];

export const DjangoBlueprintView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'structure' | 'files' | 'wireframes' | 'testing' | 'viva'
  >('files');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [checkedTests, setCheckedTests] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const currentFile = DJANGO_PROJECT_FILES[selectedFileIndex] || DJANGO_PROJECT_FILES[0];

  const handleCopyCode = (code: string, path: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const toggleTestCheck = (id: number) => {
    setCheckedTests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs text-zinc-500">
            Complete Django MVT Reference · Python + Django + SQLite3 · By Abhishek Shrivastava
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
            Django Source Code, Architecture & Viva Documentation
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSection('files')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'files'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            File-by-File Code
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('structure')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'structure'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Setup & CLI Commands
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('wireframes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'wireframes'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Wireframes & Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('testing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'testing'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Testing Checklist
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('viva')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSection === 'viva'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            School Explanation & 20 Viva Q&A
          </button>
        </div>
      </div>

      {/* SECTION 1: File-by-File Code Explorer */}
      {activeSection === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-medium text-zinc-500 px-1 mb-2">
              Select a Django project file to inspect:
            </div>
            {DJANGO_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                  selectedFileIndex === idx
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-800 border-zinc-200/80 hover:border-zinc-400'
                }`}
              >
                <div className="font-mono-tabular text-xs font-semibold">{file.path}</div>
                <div
                  className={`text-[11px] mt-1 ${
                    selectedFileIndex === idx ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  App: {file.app}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-zinc-500">FILE PATH</span>
                  <h2 className="text-lg font-mono-tabular font-semibold text-zinc-900">
                    shop_project/{currentFile.path}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentFile.code, currentFile.path)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
                >
                  {copiedPath === currentFile.path ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Full Code
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-zinc-100 text-xs">
                <div>
                  <div className="font-semibold text-zinc-900">Why this file is required</div>
                  <p className="text-zinc-600 mt-1 leading-relaxed">{currentFile.whyRequired}</p>
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">How it connects</div>
                  <p className="text-zinc-600 mt-1 leading-relaxed">{currentFile.connectsTo}</p>
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Architecture explanation</div>
                  <p className="text-zinc-600 mt-1 leading-relaxed">{currentFile.explanation}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#18181B] text-zinc-100 p-5 overflow-x-auto border border-zinc-800">
              <pre className="text-xs font-mono-tabular leading-relaxed">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Project Structure, Installation & Running Commands */}
      {activeSection === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              1. Complete Project Folder Structure
            </h2>
            <pre className="p-4 rounded-lg bg-zinc-900 text-zinc-100 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
{`shop_project/
│
├── manage.py                 # CLI runner for server, migrations & superuser
│
├── shop_project/             # Root project configuration package
│   ├── __init__.py           # Marks directory as Python package
│   ├── settings.py           # Installed apps, SQLite DB, templates, timezone
│   ├── urls.py               # Root URL router dispatching to 5 apps
│   ├── asgi.py               # ASGI entry point for async servers
│   └── wsgi.py               # WSGI entry point for production deployment
│
├── accounts/                 # Authentication: register, login, logout, profile
├── products/                 # Product & Category models, search, filters, details
├── cart/                     # Database-backed Cart model, quantity & stock checks
├── orders/                   # Checkout transaction, Order & OrderItem, timeline
├── dashboard/                # Custom Admin Panel for stock, orders & revenue
│
├── templates/                # Reusable HTML5 + Bootstrap 5 Django templates
├── static/
│   ├── css/                  # Custom stylesheet (style.css)
│   ├── js/                   # Voice Assistant (voice_assistant.js)
│   └── images/               # Studio product assets
│
└── db.sqlite3                # Relational SQLite database file`}
            </pre>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
              <h2 className="text-xl font-semibold text-zinc-900">
                2. Installation Commands (Run in Terminal)
              </h2>
              <pre className="p-4 rounded-lg bg-zinc-900 text-amber-300 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
{`# Step 1: Verify Python installation (run in any terminal folder)
python --version

# Step 2: Install Django & Pillow (for ImageField support)
pip install django pillow

# Step 3: Create root Django project (run in your workspace directory)
django-admin startproject shop_project

# Step 4: Move inside shop_project folder where manage.py resides
cd shop_project

# Step 5: Create the 5 modular applications
python manage.py startapp products
python manage.py startapp accounts
python manage.py startapp cart
python manage.py startapp orders
python manage.py startapp dashboard`}
              </pre>
            </div>

            <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
              <h2 className="text-xl font-semibold text-zinc-900">
                3. Running the Project Locally
              </h2>
              <pre className="p-4 rounded-lg bg-zinc-900 text-emerald-300 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
{`# 1. Generate migration blueprints from models.py
python manage.py makemigrations

# 2. Create database tables in db.sqlite3
python manage.py migrate

# 3. Create an Admin/Superuser account
python manage.py createsuperuser

# 4. Start the local development web server on http://127.0.0.1:8000/
python manage.py runserver`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ASCII Wireframes & Request Flow */}
      {activeSection === 'wireframes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              Browser Visual Wireframes (ASCII)
            </h2>
            <pre className="p-4 rounded-lg bg-zinc-900 text-zinc-100 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
{`┌──────────────────────────────────────────────────────────────┐
│ ShopSphere   Home · Products · Orders · Admin     Account 🛒 │
├──────────────────────────────────────────────────────────────┤
│                 SHOP EVERYTHING YOU LOVE                     │
│   Curated Flagship Electronics, Timepieces & Essentials      │
│   [ Search by name, brand, category... ]      [ Explore → ]  │
├──────────────────────────────────────────────────────────────┤
│ [ Trending ]  [ Best Sellers ]  [ New Arrivals ] [ Off % ]   │
│                                                              │
│ ┌──────────────────────┐        ┌──────────────────────┐     │
│ │  [ Studio Image ]    │        │  [ Studio Image ]    │     │
│ │  AetherLabs · 4.9 ★  │        │  Klangwerk · 4.8 ★   │     │
│ │  AeroBook Pro 16     │        │  Sonoscapes ANC      │     │
│ │  ₹1,67,112 (-12%)    │        │  ₹29,742 (-15%)      │     │
│ │  [Add Cart] [Details]│        │  [Add Cart] [Details]│     │
│ └──────────────────────┘        └──────────────────────┘     │
│                                           [ 🎤 Voice Asst ]  │
└──────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              Complete Django MVT Request-Response Lifecycle
            </h2>
            <pre className="p-4 rounded-lg bg-zinc-900 text-amber-300 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
{`1. Browser
   User clicks "Search laptop" or says "Search laptop" via 🎤 Voice Assistant
        ↓
2. URL Request (/products/?search=laptop)
   HTTP GET request sent to Django development server (127.0.0.1:8000)
        ↓
3. Django Root URLs (shop_project/urls.py → products/urls.py)
   Matches path('products/', views.product_list_view, name='product_list')
        ↓
4. Django View (products/views.py -> product_list_view)
   Extracts request.GET.get('search') and builds Q() query filter
        ↓
5. Django Model & ORM (products/models.py -> Product)
   Translates Product.objects.filter(Q(name__icontains='laptop')...) to SQL
        ↓
6. SQLite Database (db.sqlite3)
   Executes SELECT query and returns matching Product rows
        ↓
7. Django Template Engine (templates/products/product_list.html)
   Injects context dictionary into HTML5 + Bootstrap 5 template
        ↓
8. Browser
   Renders responsive Product Cards with prices, ratings & Add to Cart buttons`}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 4: Interactive Testing Checklist */}
      {activeSection === 'testing' && (
        <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                End-to-End Verification & Testing Checklist
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Every item below can be tested directly in this live application right now.
              </p>
            </div>
            <div className="text-xs font-mono-tabular text-zinc-600">
              {checkedTests.length} / {INITIAL_TEST_CHECKLIST.length} Verified
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {INITIAL_TEST_CHECKLIST.map((item) => {
              const isChecked = checkedTests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleTestCheck(item.id)}
                  className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                    isChecked
                      ? 'bg-zinc-50 border-zinc-900 text-zinc-900'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono-tabular shrink-0 ${
                      isChecked ? 'bg-zinc-900 text-white' : 'border border-zinc-300'
                    }`}
                  >
                    {isChecked ? '✓' : item.id}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: School/Demo Explanation & 20 Viva Questions */}
      {activeSection === 'viva' && (
        <div className="space-y-8">
          <div className="p-6 bg-white border border-zinc-200/80 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              School / College Project Presentation Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs leading-relaxed text-zinc-600">
              <div>
                <strong className="text-zinc-900 block mb-1">What I Built:</strong>
                ShopSphere is a complete full-stack e-commerce platform featuring multi-category product discovery, database search, cart math, atomic checkout, 6-stage order tracking, admin inventory control, and a Web Speech API voice assistant.
              </div>
              <div>
                <strong className="text-zinc-900 block mb-1">Why Django & SQLite:</strong>
                Django provides enterprise-grade security (CSRF, PBKDF2 password hashing), an expressive ORM, and rapid MVT structure. SQLite provides zero-configuration ACID relational storage in a portable single file (`db.sqlite3`).
              </div>
              <div>
                <strong className="text-zinc-900 block mb-1">How Voice Assistant Works:</strong>
                Uses the browser's `SpeechRecognition` API to transcribe spoken commands (`"Search laptop"`, `"Open cart"`, `"Show my orders"`) and automatically triggers the corresponding URL route or database query.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              20 Teacher Viva Questions & Answers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIVA_QUESTIONS.map((vq) => (
                <div
                  key={vq.number}
                  className="p-5 bg-white border border-zinc-200/80 rounded-xl space-y-2"
                >
                  <div className="text-xs font-mono-tabular text-amber-700 font-semibold">
                    Question {String(vq.number).padStart(2, '0')}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900">{vq.question}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{vq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

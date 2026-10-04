export interface DjangoFileEntry {
  path: string;
  app: string;
  whyRequired: string;
  connectsTo: string;
  explanation: string;
  code: string;
}

export interface VivaQuestion {
  number: number;
  question: string;
  answer: string;
}

export const DJANGO_PROJECT_FILES: DjangoFileEntry[] = [
  {
    path: 'manage.py',
    app: 'Root',
    whyRequired: 'Command-line utility that lets you interact with the Django project (runserver, makemigrations, migrate, createsuperuser).',
    connectsTo: 'Points to shop_project.settings to load the entire project configuration.',
    explanation: 'Sets DJANGO_SETTINGS_MODULE to shop_project.settings and delegates CLI arguments to django.core.management.',
    code: `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()`,
  },
  {
    path: 'shop_project/settings.py',
    app: 'shop_project',
    whyRequired: 'Central configuration file for database (SQLite), installed apps, templates, static/media paths, timezone, and security middleware.',
    connectsTo: 'Registers accounts, products, cart, orders, and dashboard apps, and connects templates/ and static/ folders.',
    explanation: 'Configures SQLite3 database engine, registers our 5 modular apps, sets template context processors, and enables timezone-aware timestamps.',
    code: `from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-shopsphere-educational-secret-key-abhishek-shrivastava'
DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # ShopSphere Custom Apps
    'accounts',
    'products',
    'cart',
    'orders',
    'dashboard',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'shop_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'cart.context_processors.cart_counter',
            ],
        },
    },
]

WSGI_APPLICATION = 'shop_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'`,
  },
  {
    path: 'shop_project/urls.py',
    app: 'shop_project',
    whyRequired: 'Root URL dispatcher that routes incoming browser requests to the appropriate app URL configuration.',
    connectsTo: 'Includes URLs from products, accounts, cart, orders, and dashboard apps.',
    explanation: 'Maps /, /accounts/, /cart/, /orders/, and /dashboard/ along with static/media serving in development.',
    code: `from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('', include('products.urls')),
    path('accounts/', include('accounts.urls')),
    path('cart/', include('cart.urls')),
    path('orders/', include('orders.urls')),
    path('dashboard/', include('dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])`,
  },
  {
    path: 'products/models.py',
    app: 'products',
    whyRequired: 'Defines the Category and Product database tables using Django ORM.',
    connectsTo: 'Referenced as ForeignKey by Cart (cart/models.py) and OrderItem (orders/models.py).',
    explanation: 'Includes Category(name, description) and Product(name, description, category, brand, price, discount, stock, image, rating, created_at, updated_at) plus a helper method get_discounted_price().',
    code: `from django.db import models
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    brand = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.PositiveIntegerField(
        default=0,
        help_text='Discount percentage (0 to 90)'
    )
    stock = models.PositiveIntegerField(default=10)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    is_trending = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.brand})"

    @property
    def discounted_price(self):
        if self.discount > 0:
            factor = Decimal(100 - self.discount) / Decimal(100)
            return round(self.price * factor, 2)
        return self.price`,
  },
  {
    path: 'products/views.py',
    app: 'products',
    whyRequired: 'Handles Homepage sections, Catalog Search (Q objects), Multi-facet Filtering, Sorting, and Product Detail view.',
    connectsTo: 'Queries Product and Category from products/models.py and renders home.html, product_list.html, and product_detail.html.',
    explanation: 'Uses Django Q() objects for database search across product name, brand, and category name, and supports price/rating/availability filtering and sorting.',
    code: `from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Product, Category


def home_view(request):
    categories = Category.objects.all()
    trending_products = Product.objects.filter(is_trending=True)[:4]
    bestseller_products = Product.objects.filter(is_bestseller=True)[:4]
    new_arrivals = Product.objects.filter(is_new_arrival=True).order_by('-created_at')[:4]
    discount_products = Product.objects.filter(discount__gte=15).order_by('-discount')[:4]

    context = {
        'categories': categories,
        'trending_products': trending_products,
        'bestseller_products': bestseller_products,
        'new_arrivals': new_arrivals,
        'discount_products': discount_products,
    }
    return render(request, 'products/home.html', context)


def product_list_view(request):
    products = Product.objects.select_related('category').all()
    categories = Category.objects.all()
    brands = Product.objects.values_list('brand', flat=True).distinct()

    # 1. Real Database Search by Name, Brand, or Category
    search_query = request.GET.get('search', '').strip()
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) |
            Q(brand__icontains=search_query) |
            Q(category__name__icontains=search_query) |
            Q(description__icontains=search_query)
        )

    # 2. Category Filter
    category_name = request.GET.get('category', '').strip()
    if category_name:
        products = products.filter(category__name__iexact=category_name)

    # 3. Brand Filter
    brand_name = request.GET.get('brand', '').strip()
    if brand_name:
        products = products.filter(brand__iexact=brand_name)

    # 4. Price Range Filter
    max_price = request.GET.get('max_price', '').strip()
    if max_price.isdigit():
        products = products.filter(price__lte=int(max_price))

    # 5. Minimum Rating Filter
    min_rating = request.GET.get('rating', '').strip()
    if min_rating:
        try:
            products = products.filter(rating__gte=float(min_rating))
        except ValueError:
            pass

    # 6. Availability Filter
    in_stock = request.GET.get('in_stock', '')
    if in_stock == 'true':
        products = products.filter(stock__gt=0)

    # 7. Sorting
    sort_by = request.GET.get('sort', 'newest')
    if sort_by == 'price_asc':
        products = products.order_by('price')
    elif sort_by == 'price_desc':
        products = products.order_by('-price')
    elif sort_by == 'rating':
        products = products.order_by('-rating')
    else:
        products = products.order_by('-created_at')

    context = {
        'products': products,
        'categories': categories,
        'brands': brands,
        'search_query': search_query,
        'selected_category': category_name,
        'selected_brand': brand_name,
        'sort_by': sort_by,
    }
    return render(request, 'products/product_list.html', context)


def product_detail_view(request, pk):
    product = get_object_or_404(Product, pk=pk)
    related_products = Product.objects.filter(
        category=product.category
    ).exclude(pk=product.pk)[:4]
    return render(request, 'products/product_detail.html', {
        'product': product,
        'related_products': related_products,
    })`,
  },
  {
    path: 'cart/models.py',
    app: 'cart',
    whyRequired: 'Stores persistent shopping cart items linked to the authenticated User and Product.',
    connectsTo: 'ForeignKey to django.contrib.auth.models.User and products.models.Product.',
    explanation: 'Calculates item subtotal and total discount dynamically and records created_at and updated_at timestamps.',
    code: `from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Cart(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} (x{self.quantity})"

    @property
    def original_subtotal(self):
        return self.product.price * self.quantity

    @property
    def discounted_subtotal(self):
        return self.product.discounted_price * self.quantity

    @property
    def item_discount(self):
        return self.original_subtotal - self.discounted_subtotal`,
  },
  {
    path: 'cart/views.py',
    app: 'cart',
    whyRequired: 'Implements Add to Cart, Increase/Decrease Quantity, Remove Item, and Stock Validation.',
    connectsTo: 'Uses Cart model from cart/models.py and Product model from products/models.py.',
    explanation: 'Validates that requested quantity never exceeds product.stock and prevents adding out-of-stock products.',
    code: `from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from products.models import Product
from .models import Cart


@login_required
def cart_detail_view(request):
    cart_items = Cart.objects.filter(user=request.user).select_related('product')
    subtotal = sum(item.original_subtotal for item in cart_items)
    total_discount = sum(item.item_discount for item in cart_items)
    grand_total = sum(item.discounted_subtotal for item in cart_items)

    return render(request, 'cart/cart.html', {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'total_discount': total_discount,
        'grand_total': grand_total,
    })


@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if product.stock <= 0:
        messages.error(request, f"Sorry, {product.name} is currently out of stock.")
        return redirect('product_detail', pk=product.id)

    qty = int(request.POST.get('quantity', 1))
    cart_item, created = Cart.objects.get_or_create(user=request.user, product=product)

    new_qty = qty if created else cart_item.quantity + qty
    if new_qty > product.stock:
        messages.warning(request, f"Only {product.stock} units available in stock.")
        cart_item.quantity = product.stock
    else:
        cart_item.quantity = new_qty

    cart_item.save()
    messages.success(request, f"Added {product.name} to your cart.")

    if request.POST.get('buy_now') == 'true':
        return redirect('checkout')
    return redirect('cart_detail')


@login_required
def update_cart_quantity(request, item_id, action):
    cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
    if action == 'increase':
        if cart_item.quantity < cart_item.product.stock:
            cart_item.quantity += 1
            cart_item.save()
        else:
            messages.warning(request, "Maximum available stock reached.")
    elif action == 'decrease':
        if cart_item.quantity > 1:
            cart_item.quantity -= 1
            cart_item.save()
        else:
            cart_item.delete()
    return redirect('cart_detail')


@login_required
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
    cart_item.delete()
    messages.info(request, "Item removed from your shopping cart.")
    return redirect('cart_detail')`,
  },
  {
    path: 'orders/models.py',
    app: 'orders',
    whyRequired: 'Defines Order and OrderItem tables with 7 order lifecycle statuses, 3 payment statuses, and timezone timestamps.',
    connectsTo: 'ForeignKey to User and Product; used by Checkout, Customer Order History, and Admin Dashboard.',
    explanation: 'Stores unique order_number, total_amount, status, payment_status, shipping_address, phone, created_at, and updated_at.',
    code: `from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Packed', 'Packed'),
        ('Shipped', 'Shipped'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Cash on Delivery', 'Cash on Delivery'),
        ('Demo Online Payment', 'Demo Online Payment (Educational Test)'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=40, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=15)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(
        max_length=40,
        choices=PAYMENT_METHOD_CHOICES,
        default='Cash on Delivery'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.order.order_number} - {self.product.name if self.product else 'Deleted'}"`,
  },
  {
    path: 'orders/views.py',
    app: 'orders',
    whyRequired: 'Executes atomic checkout transaction: creates Order, creates OrderItems, deducts Product stock, clears Cart, and generates order_number.',
    connectsTo: 'Reads Cart items, writes Order & OrderItem, updates Product.stock, and renders checkout.html & order_history.html.',
    explanation: 'Uses @transaction.atomic so stock deduction and order creation succeed or roll back together safely.',
    code: `import random
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.contrib import messages
from cart.models import Cart
from .models import Order, OrderItem


@login_required
@transaction.atomic
def checkout_view(request):
    cart_items = Cart.objects.filter(user=request.user).select_related('product')
    if not cart_items.exists():
        messages.warning(request, "Your cart is empty.")
        return redirect('product_list')

    subtotal = sum(item.original_subtotal for item in cart_items)
    total_discount = sum(item.item_discount for item in cart_items)
    grand_total = sum(item.discounted_subtotal for item in cart_items)

    if request.method == 'POST':
        # Validate stock before placing order
        for item in cart_items:
            if item.quantity > item.product.stock:
                messages.error(
                    request,
                    f"Insufficient stock for {item.product.name}. Available: {item.product.stock}"
                )
                return redirect('cart_detail')

        date_str = timezone.now().strftime('%Y%m%d')
        rand_suffix = random.randint(1000, 9999)
        order_number = f"ORD-{date_str}-{rand_suffix}"

        payment_method = request.POST.get('payment_method', 'Cash on Delivery')
        payment_status = 'Paid' if payment_method == 'Demo Online Payment' else 'Pending'

        # 1. Create Order
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            full_name=request.POST.get('full_name'),
            email=request.POST.get('email'),
            phone=request.POST.get('phone'),
            shipping_address=request.POST.get('address'),
            city=request.POST.get('city'),
            state=request.POST.get('state'),
            pincode=request.POST.get('pincode'),
            total_amount=grand_total,
            status='Pending',
            payment_method=payment_method,
            payment_status=payment_status,
        )

        # 2. Create OrderItems & 3. Reduce Product Stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.discounted_price,
            )
            item.product.stock -= item.quantity
            item.product.save()

        # 4. Clear Cart
        cart_items.delete()

        # 7. Redirect to Order Success Page
        return redirect('order_success', order_number=order.order_number)

    return render(request, 'orders/checkout.html', {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'total_discount': total_discount,
        'grand_total': grand_total,
    })


@login_required
def order_success_view(request, order_number):
    order = get_object_or_404(Order, order_number=order_number, user=request.user)
    return render(request, 'orders/order_success.html', {'order': order})


@login_required
def order_history_view(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
    return render(request, 'orders/order_history.html', {'orders': orders})`,
  },
  {
    path: 'accounts/views.py',
    app: 'accounts',
    whyRequired: 'Implements User Registration, Login, Logout, Profile Management, and Customer Order History access.',
    connectsTo: 'Uses Django UserCreationForm, AuthenticationForm, login, logout, and @login_required.',
    explanation: 'Hashes passwords securely via PBKDF2 and protects profile routes with @login_required.',
    code: `from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from orders.models import Order


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = request.POST.get('email', '')
            user.first_name = request.POST.get('full_name', '')
            user.save()
            login(request, user)
            messages.success(request, "Welcome to ShopSphere! Your account is ready.")
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get('next', 'home')
            return redirect(next_url)
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out safely.")
    return redirect('home')


@login_required
def profile_view(request):
    user_orders = Order.objects.filter(user=request.user).prefetch_related('items')
    return render(request, 'accounts/profile.html', {'orders': user_orders})`,
  },
  {
    path: 'dashboard/views.py',
    app: 'dashboard',
    whyRequired: 'Custom Admin Dashboard for managing products, categories, stock, customer accounts, order status, and revenue metrics.',
    connectsTo: 'Aggregates Product, Category, Order, and User models for staff/admin users.',
    explanation: 'Computes Total Products, Total Customers, Total Orders, Pending Orders, Delivered Orders, and Total Revenue, and lets admins update order status in real time.',
    code: `from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.db.models import Sum
from django.contrib import messages
from products.models import Product, Category
from orders.models import Order


@staff_member_required
def admin_dashboard_view(request):
    total_products = Product.objects.count()
    total_customers = User.objects.filter(is_staff=False).count()
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='Pending').count()
    delivered_orders = Order.objects.filter(status='Delivered').count()
    total_revenue = (
        Order.objects.exclude(status='Cancelled')
        .aggregate(total=Sum('total_amount'))['total'] or 0
    )

    recent_orders = Order.objects.select_related('user').all()[:15]
    products = Product.objects.select_related('category').all()
    categories = Category.objects.all()
    customers = User.objects.all()

    return render(request, 'dashboard/admin_dashboard.html', {
        'total_products': total_products,
        'total_customers': total_customers,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'delivered_orders': delivered_orders,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders,
        'products': products,
        'categories': categories,
        'customers': customers,
    })


@staff_member_required
def update_order_status(request, order_id):
    if request.method == 'POST':
        order = get_object_or_404(Order, id=order_id)
        order.status = request.POST.get('status', order.status)
        order.payment_status = request.POST.get('payment_status', order.payment_status)
        order.save()
        messages.success(request, f"Order {order.order_number} updated to {order.status}.")
    return redirect('admin_dashboard')`,
  },
  {
    path: 'static/js/voice_assistant.js',
    app: 'static',
    whyRequired: 'Powers the floating ShopSphere Voice Assistant using the browser Web Speech API (SpeechRecognition).',
    connectsTo: 'Included in templates/base.html so every page has the floating microphone button and voice command routing.',
    explanation: 'Listens through the microphone, converts speech to text, displays the recognized phrase, matches predefined commands, and navigates or searches automatically.',
    code: `// ShopSphere Voice Assistant - Web Speech API Implementation
(function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('shopsphere-voice-btn');
  const panel = document.getElementById('shopsphere-voice-panel');
  const statusEl = document.getElementById('voice-status-text');
  const transcriptEl = document.getElementById('voice-transcript-text');

  if (!micBtn) return;

  function processVoiceCommand(rawSpeech) {
    const command = rawSpeech.toLowerCase().trim();
    transcriptEl.textContent = 'You said: "' + rawSpeech + '"';

    if (command.startsWith('search ')) {
      const term = command.replace('search ', '').trim();
      statusEl.textContent = 'Searching catalog for ' + term + '...';
      window.location.href = '/products/?search=' + encodeURIComponent(term);
    } else if (command.includes('open mobile phones') || command.includes('mobile phones')) {
      window.location.href = '/products/?category=Mobile+Phones';
    } else if (command.includes('show my orders') || command.includes('open my orders')) {
      window.location.href = '/orders/history/';
    } else if (command.includes('open cart') || command.includes('show cart')) {
      window.location.href = '/cart/';
    } else if (command.includes('go to home') || command.includes('open home')) {
      window.location.href = '/';
    } else if (command.includes('show shoes') || command.includes('open shoes')) {
      window.location.href = '/products/?category=Shoes';
    } else if (command.includes('open profile') || command.includes('my profile')) {
      window.location.href = '/accounts/profile/';
    } else if (command.includes('buy laptop') || command.includes('show laptops')) {
      window.location.href = '/products/?search=laptop';
    } else {
      statusEl.textContent = "Sorry, I didn't understand that command.";
    }
  }

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      panel.classList.remove('d-none');
      statusEl.textContent = 'Listening...';
      transcriptEl.textContent = 'Speak a command like "Search laptop" or "Open cart"';
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
    };

    recognition.onerror = () => {
      statusEl.textContent = "Sorry, I didn't understand that command.";
    };
  }
})();`,
  },
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    number: 1,
    question: 'What is Django and why did you choose it for ShopSphere?',
    answer: 'Django is a high-level Python web framework that follows the MVT (Model-View-Template) architecture. We chose it for ShopSphere because it includes built-in authentication, ORM, CSRF security, session management, and an admin interface ("batteries-included").',
  },
  {
    number: 2,
    question: 'Explain the MVT (Model-View-Template) architecture in Django.',
    answer: 'Model defines the database structure (e.g., Product, Order). View contains the business logic that processes user requests and queries Models. Template is the HTML file enhanced with Django Template Language (DTL) that renders the response in the browser.',
  },
  {
    number: 3,
    question: 'Why did you use SQLite as the database?',
    answer: 'SQLite is a serverless, zero-configuration relational SQL database stored in a single file (db.sqlite3). It is built into Python and Django by default, making local setup and testing fast while supporting full ACID transactions and foreign keys.',
  },
  {
    number: 4,
    question: 'What is Django ORM and why is it better than writing raw SQL?',
    answer: 'ORM stands for Object-Relational Mapper. It lets us interact with database tables using Python classes and methods (like Product.objects.filter(stock__gt=0)) instead of raw SQL queries, preventing SQL injection and keeping code database-agnostic.',
  },
  {
    number: 5,
    question: 'How does ForeignKey work in your Product, Cart, and Order models?',
    answer: 'A ForeignKey establishes a many-to-one relationship. For example, each Product belongs to one Category, each Cart item links to one User and one Product, and each OrderItem links to one parent Order.',
  },
  {
    number: 6,
    question: 'What is the difference between makemigrations and migrate?',
    answer: '`python manage.py makemigrations` inspects changes in models.py and generates Python migration files. `python manage.py migrate` executes those migration files to create or alter actual tables inside db.sqlite3.',
  },
  {
    number: 7,
    question: 'How does real database search work in ShopSphere?',
    answer: 'We use `django.db.models.Q` objects with `icontains` lookups: `Product.objects.filter(Q(name__icontains=q) | Q(brand__icontains=q) | Q(category__name__icontains=q))` so a single search box matches product name, brand, or category case-insensitively.',
  },
  {
    number: 8,
    question: 'How do you prevent a customer from ordering a product when stock is zero?',
    answer: 'We validate stock both in the template (disabling the Add to Cart / Buy Now button when `product.stock == 0`) and on the server side inside `add_to_cart` and `checkout_view` before creating OrderItems.',
  },
  {
    number: 9,
    question: 'What happens inside the database when a customer clicks "Place Order"?',
    answer: 'Inside an `@transaction.atomic` block: 1) An `Order` row is created with a unique `order_number` and timestamp; 2) `OrderItem` rows are created for each cart item; 3) Each `Product.stock` is reduced by the ordered quantity; 4) The user’s `Cart` rows are deleted.',
  },
  {
    number: 10,
    question: 'How are timestamps stored and formatted in Django?',
    answer: 'We use `models.DateTimeField(auto_now_add=True)` for `created_at` and `auto_now=True` for `updated_at` with `USE_TZ = True` in settings.py so Django stores timezone-aware timestamps and formats them like `04 October 2026, 03:45 PM`.',
  },
  {
    number: 11,
    question: 'What is CSRF protection and why is {% csrf_token %} required in forms?',
    answer: 'CSRF (Cross-Site Request Forgery) protection prevents malicious websites from submitting unauthorized POST requests on behalf of a logged-in user. `{% csrf_token %}` injects a secret cryptographic token verified by `CsrfViewMiddleware`.',
  },
  {
    number: 12,
    question: 'How does Django store user passwords securely?',
    answer: 'Django never stores plain-text passwords. It hashes passwords using the PBKDF2 algorithm with a SHA-256 digest and a random salt (`pbkdf2_sha256$...`).',
  },
  {
    number: 13,
    question: 'What does the @login_required decorator do?',
    answer: 'It checks if `request.user.is_authenticated` is True before running a view (like Checkout, Cart, or Order History). If the user is anonymous, it automatically redirects them to `LOGIN_URL` (`/accounts/login/?next=/orders/checkout/`).',
  },
  {
    number: 14,
    question: 'How does the Admin Order Status pipeline update the customer view?',
    answer: 'Both the Admin Dashboard and the Customer Order History read from the same `Order` table in `db.sqlite3`. When the admin updates `order.status` (e.g., from `Confirmed` to `Shipped`), the customer immediately sees the updated stage on their timeline.',
  },
  {
    number: 15,
    question: 'How is the discounted price calculated in the Product model?',
    answer: 'Using a `@property` method `discounted_price` on the `Product` model: `price * (100 - discount) / 100`. This keeps discount math centralized and consistent across cards, cart, and checkout.',
  },
  {
    number: 16,
    question: 'How does the ShopSphere Voice Assistant work in the browser?',
    answer: 'It uses the HTML5 Web Speech API (`window.SpeechRecognition` or `window.webkitSpeechRecognition`) to capture audio from the microphone, convert speech to text, parse intent keywords (e.g. "search laptop", "open cart"), and navigate to the matching Django URL.',
  },
  {
    number: 17,
    question: 'What is the purpose of context processors in settings.py?',
    answer: 'A context processor is a Python function that injects variables into every template automatically. For example, our `cart_counter` context processor makes the user’s live cart item count available in the top navbar on every page.',
  },
  {
    number: 18,
    question: 'What is the difference between STATIC_URL and MEDIA_URL?',
    answer: '`STATIC_URL` serves developer assets that are part of the codebase (CSS, JS, UI icons). `MEDIA_URL` and `MEDIA_ROOT` serve user- or admin-uploaded files such as product photographs stored via `ImageField`.',
  },
  {
    number: 19,
    question: 'Why did we use @transaction.atomic on the checkout view?',
    answer: '`@transaction.atomic` guarantees database integrity: if an error occurs while creating `OrderItem` records or reducing `Product.stock`, the entire checkout transaction rolls back so partial orders or corrupt stock counts never happen.',
  },
  {
    number: 20,
    question: 'How are Cash on Delivery and Demo Online Payment differentiated?',
    answer: 'When the customer chooses Cash on Delivery, `payment_status` is initialized to `Pending` until delivery. When they choose Demo Online Payment (for educational testing), `payment_status` is marked `Paid` upon order creation.',
  },
];

"""
Script to add demo data for SHOEX project
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'SHOEX'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils import timezone
from SHOEX.products.models import Product, Category, ProductVariant, ProductImage
from SHOEX.store.models import Store
from SHOEX.discount.models import Voucher
from SHOEX.orders.models import Order, OrderItem
from SHOEX.address.models import Address
from SHOEX.users.models import User
import random

User = get_user_model()

def create_demo_users():
    """Create demo users"""
    print("Creating demo users...")

    # Create admin user if not exists
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@shoex.com',
            password='admin123',
            full_name='Admin User'
        )
        print("Created admin user")

    # Create demo customers
    customers = [
        {'username': 'customer1', 'email': 'customer1@example.com', 'full_name': 'Nguyễn Văn A', 'role': 'buyer'},
        {'username': 'customer2', 'email': 'customer2@example.com', 'full_name': 'Trần Thị B', 'role': 'buyer'},
        {'username': 'seller1', 'email': 'seller1@example.com', 'full_name': 'Lê Văn C', 'role': 'seller'},
        {'username': 'seller2', 'email': 'seller2@example.com', 'full_name': 'Phạm Thị D', 'role': 'seller'},
    ]

    for customer_data in customers:
        if not User.objects.filter(username=customer_data['username']).exists():
            User.objects.create_user(
                username=customer_data['username'],
                email=customer_data['email'],
                password='password123',
                full_name=customer_data['full_name'],
                role=customer_data['role']
            )
            print(f"Created user: {customer_data['username']}")

def create_demo_categories():
    """Create demo categories"""
    print("Creating demo categories...")

    categories = [
        {'name': 'Sneakers', 'description': 'Casual and sport sneakers'},
        {'name': 'Boots', 'description': 'Durable boots for all occasions'},
        {'name': 'Sandals', 'description': 'Comfortable sandals'},
        {'name': 'Formal Shoes', 'description': 'Professional formal footwear'},
        {'name': 'Running Shoes', 'description': 'High-performance running shoes'},
    ]

    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Created category: {cat_data['name']}")

def create_demo_stores():
    """Create demo stores"""
    print("Creating demo stores...")

    stores = [
        {'name': 'Shoex Downtown', 'address': '123 Main St, Downtown', 'phone': '0123456789'},
        {'name': 'Shoex Mall', 'address': '456 Shopping Mall, City Center', 'phone': '0987654321'},
        {'name': 'Shoex Online', 'address': 'Online Store', 'phone': '0111111111'},
    ]

    for store_data in stores:
        if not Store.objects.filter(name=store_data['name']).exists():
            # Generate store_id and slug from name
            store_id = store_data['name'].lower().replace(' ', '_').replace('shoex_', '')
            slug = store_data['name'].lower().replace(' ', '-').replace('shoex-', '')
            store = Store.objects.create(
                store_id=f"store_{store_id}",
                name=store_data['name'],
                slug=slug,
                address=store_data['address'],
                phone=store_data['phone'],
                join_date=timezone.now()
            )
            print(f"Created store: {store_data['name']}")
        else:
            print(f"Store {store_data['name']} already exists")

def create_demo_products():
    """Create demo products"""
    print("Creating demo products...")

    categories = list(Category.objects.all())
    stores = list(Store.objects.all())

    if not categories or not stores:
        print("No categories or stores found, skipping product creation")
        return

    products = [
        {
            'name': 'Classic White Sneakers',
            'description': 'Comfortable white sneakers for everyday wear',
            'base_price': 2500000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Black Leather Boots',
            'description': 'Stylish black leather boots',
            'base_price': 3500000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Running Performance Shoes',
            'description': 'High-performance running shoes with advanced cushioning',
            'base_price': 4200000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Casual Sandals',
            'description': 'Comfortable sandals for summer',
            'base_price': 800000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Formal Oxfords',
            'description': 'Classic formal oxford shoes',
            'base_price': 2800000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Basketball Shoes',
            'description': 'Professional basketball shoes',
            'base_price': 3800000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Hiking Boots',
            'description': 'Durable hiking boots for outdoor activities',
            'base_price': 3200000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
        {
            'name': 'Kids Sneakers',
            'description': 'Colorful sneakers for kids',
            'base_price': 1500000,
            'category': random.choice(categories),
            'store': random.choice(stores),
            'is_active': True
        },
    ]

    for product_data in products:
        if not Product.objects.filter(name=product_data['name']).exists():
            product = Product.objects.create(
                name=product_data['name'],
                description=product_data['description'],
                base_price=product_data['base_price'],
                category=product_data['category'],
                store=product_data['store'],
                is_active=product_data['is_active']
            )
            print(f"Created product: {product_data['name']}")

            # Create product variants (sizes)
            for size in ['36', '37', '38', '39', '40', '41', '42', '43']:
                variant, _ = ProductVariant.objects.get_or_create(
                    product=product,
                    sku=f"{product.name.replace(' ', '_')}_{size}",
                    defaults={
                        'price': product.base_price,
                        'stock': random.randint(5, 20),
                        'option_combinations': {'Size': size}
                    }
                )
        else:
            print(f"Product {product_data['name']} already exists")

def create_demo_vouchers():
    """Create demo vouchers"""
    print("Creating demo vouchers...")

    from datetime import date, timedelta

    vouchers = [
        {
            'code': 'WELCOME10',
            'type': 'platform',
            'discount_type': 'percent',
            'discount_value': 10.00,
            'min_order_amount': 500000.00,
            'max_discount': 50000.00,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=30),
            'usage_limit': 1000,
            'per_user_limit': 1,
            'is_active': True,
            'is_auto': False,
        },
        {
            'code': 'FLASH50K',
            'type': 'platform',
            'discount_type': 'fixed',
            'discount_value': 50000.00,
            'min_order_amount': 1000000.00,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=7),
            'usage_limit': 500,
            'per_user_limit': 1,
            'is_active': True,
            'is_auto': False,
        },
        {
            'code': 'SELLER20',
            'type': 'seller',
            'discount_type': 'percent',
            'discount_value': 20.00,
            'min_order_amount': 200000.00,
            'max_discount': 100000.00,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=14),
            'usage_limit': 200,
            'per_user_limit': 2,
            'is_active': True,
            'is_auto': False,
        },
    ]

    for voucher_data in vouchers:
        if not Voucher.objects.filter(code=voucher_data['code']).exists():
            # Get seller for seller voucher
            if voucher_data['type'] == 'seller':
                seller = Store.objects.filter(name='Shoex Mall').first()
                if seller:
                    voucher_data['seller'] = seller

            Voucher.objects.create(**voucher_data)
            print(f"Created voucher: {voucher_data['code']}")
        else:
            print(f"Voucher {voucher_data['code']} already exists")

def create_demo_orders():
    """Create demo orders"""
    print("Creating demo orders...")

    # Get demo users and products
    customers = User.objects.filter(role='buyer')[:2]  # Get first 2 buyers
    products = Product.objects.all()[:3]  # Get first 3 products

    if not customers.exists() or not products.exists():
        print("No customers or products found, skipping order creation")
        return

    # Get or create address for orders
    address, _ = Address.objects.get_or_create(
        user=customers[0],
        province='Hồ Chí Minh',
        ward='Phường Bến Nghé',
        detail='123 Đường ABC',
        defaults={
            'is_default': True
        }
    )

    orders_data = [
        {
            'buyer': customers[0],
            'address': address,
            'total_amount': 2500000.00,
            'status': 'delivered',
            'payment_method': 'COD',
            'payment_status': 'paid',
            'shipping_fee': 30000.00,
        },
        {
            'buyer': customers[1] if len(customers) > 1 else customers[0],
            'address': address,
            'total_amount': 1800000.00,
            'status': 'processing',
            'payment_method': 'Bank Transfer',
            'payment_status': 'paid',
            'shipping_fee': 25000.00,
        },
        {
            'buyer': customers[0],
            'address': address,
            'total_amount': 3200000.00,
            'status': 'pending',
            'payment_method': 'COD',
            'payment_status': 'pending',
            'shipping_fee': 40000.00,
        },
    ]

    for order_data in orders_data:
        if not Order.objects.filter(buyer=order_data['buyer'], total_amount=order_data['total_amount']).exists():
            order = Order.objects.create(**order_data)

            # Note: OrderItem creation requires SubOrder, skipping for demo simplicity
            print(f"Created order: #{order.order_id} for {order.buyer.username} (without items)")
        else:
            print(f"Order for {order_data['buyer'].username} with amount {order_data['total_amount']} already exists")

def main():
    print("Adding demo data to SHOEX database...")
    print("=" * 50)

    try:
        create_demo_users()
        create_demo_categories()
        create_demo_stores()  # Skip due to database issues
        create_demo_products()  # Skip due to database issues
        create_demo_vouchers()
        create_demo_orders()

        print("=" * 50)
        print("Demo data added successfully!")
        print("\nDemo accounts:")
        print("- Admin: admin / admin123")
        print("- Test Admin: testadmin / admin123")
        print("- Customer: customer1 / password123")
        print("- Seller: seller1 / password123")

    except Exception as e:
        print(f"Error adding demo data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
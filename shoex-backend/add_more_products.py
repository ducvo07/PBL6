import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.products.models import Product, Category, ProductVariant, ProductImage
from SHOEX.store.models import Store
from SHOEX.brand.models import Brand

# Add more products
print('Adding more products...')
categories = list(Category.objects.all())
stores = list(Store.objects.all())
brands = list(Brand.objects.all()) if Brand.objects.exists() else []

additional_products = [
    {
        'name': 'Winter Boots',
        'description': 'Warm and waterproof winter boots for cold weather',
        'base_price': 4500000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': True,
    },
    {
        'name': 'High-Top Sneakers',
        'description': 'Retro high-top sneakers with vintage design',
        'base_price': 3200000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': False,
    },
    {
        'name': 'Slip-On Loafers',
        'description': 'Elegant slip-on loafers for formal occasions',
        'base_price': 2900000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': False,
    },
    {
        'name': 'Trail Running Shoes',
        'description': 'Specialized trail running shoes with superior grip',
        'base_price': 4800000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': True,
    },
    {
        'name': 'Canvas Shoes',
        'description': 'Classic canvas shoes perfect for casual wear',
        'base_price': 1200000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': False,
    },
    {
        'name': 'Chelsea Boots',
        'description': 'Timeless Chelsea boots with elastic sides',
        'base_price': 3600000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': False,
    },
    {
        'name': 'Discontinued Model',
        'description': 'Old model that is no longer available',
        'base_price': 2000000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': False,
        'is_featured': False,
    },
    {
        'name': 'Limited Edition Sneakers',
        'description': 'Exclusive limited edition sneakers',
        'base_price': 5500000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': True,
    },
    {
        'name': 'Work Safety Boots',
        'description': 'Heavy-duty safety boots for industrial work',
        'base_price': 2800000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': False,
    },
    {
        'name': 'Dance Shoes',
        'description': 'Specialized shoes for dance performances',
        'base_price': 3500000.00,
        'category': random.choice(categories),
        'store': random.choice(stores),
        'brand': random.choice(brands) if brands else None,
        'is_active': True,
        'is_featured': False,
    },
]

for product_data in additional_products:
    if not Product.objects.filter(name=product_data['name']).exists():
        product = Product.objects.create(**product_data)
        print(f'Created product: {product_data["name"]} - Active: {product_data["is_active"]} - Featured: {product_data["is_featured"]}')

        # Create product variants (sizes)
        sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
        for size in sizes:
            if product.is_active:
                stock = random.randint(0, 25)  # Some sizes might be out of stock
            else:
                stock = 0  # Inactive products have no stock

            variant, created = ProductVariant.objects.get_or_create(
                product=product,
                sku=f"{product.name.replace(' ', '_')}_{size}",
                defaults={
                    'price': product.base_price + random.randint(-50000, 100000),  # Slight price variation
                    'stock': stock,
                    'option_combinations': {'Size': size},
                    'weight': random.uniform(0.5, 1.5),
                    'is_active': product.is_active
                }
            )
            if created:
                print(f'  Created variant: {variant.sku} - Stock: {stock}')
    else:
        print(f'Product {product_data["name"]} already exists')

print('\nDone adding additional demo products!')
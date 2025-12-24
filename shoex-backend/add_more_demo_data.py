import os
import django
from datetime import date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.discount.models import Voucher
from SHOEX.orders.models import Order
from SHOEX.store.models import Store
from SHOEX.users.models import User
from SHOEX.address.models import Address

# Add more vouchers
print('Adding more vouchers...')
additional_vouchers = [
    {
        'code': 'NEWUSER5',
        'type': 'platform',
        'discount_type': 'percent',
        'discount_value': 5.00,
        'min_order_amount': 100000.00,
        'start_date': date.today(),
        'end_date': date.today() + timedelta(days=60),
        'usage_limit': 500,
        'per_user_limit': 1,
        'is_active': True,
        'is_auto': True,
    },
    {
        'code': 'BLACKFRIDAY',
        'type': 'platform',
        'discount_type': 'percent',
        'discount_value': 25.00,
        'min_order_amount': 500000.00,
        'max_discount': 200000.00,
        'start_date': date.today() - timedelta(days=5),
        'end_date': date.today() + timedelta(days=10),
        'usage_limit': 1000,
        'per_user_limit': 1,
        'is_active': True,
        'is_auto': False,
    },
    {
        'code': 'EXPIRED50',
        'type': 'platform',
        'discount_type': 'percent',
        'discount_value': 50.00,
        'min_order_amount': 1000000.00,
        'start_date': date.today() - timedelta(days=30),
        'end_date': date.today() - timedelta(days=1),
        'usage_limit': 100,
        'per_user_limit': 1,
        'is_active': False,
        'is_auto': False,
    },
    {
        'code': 'STORE15',
        'type': 'seller',
        'discount_type': 'percent',
        'discount_value': 15.00,
        'min_order_amount': 300000.00,
        'start_date': date.today(),
        'end_date': date.today() + timedelta(days=30),
        'usage_limit': 200,
        'per_user_limit': 1,
        'is_active': True,
        'is_auto': False,
    },
]

for voucher_data in additional_vouchers:
    if not Voucher.objects.filter(code=voucher_data['code']).exists():
        if voucher_data['type'] == 'seller':
            store = Store.objects.filter(name='Shoex Mall').first()
            if store:
                voucher_data['seller'] = store

        Voucher.objects.create(**voucher_data)
        print(f'Created voucher: {voucher_data["code"]}')
    else:
        print(f'Voucher {voucher_data["code"]} already exists')

# Add more orders
print('\nAdding more orders...')
customers = list(User.objects.filter(role='buyer'))
if customers:
    address = Address.objects.filter(user=customers[0]).first()
    if not address:
        address = Address.objects.create(
            user=customers[0],
            province='Hà Nội',
            ward='Phường Hoàn Kiếm',
            detail='456 Đường DEF'
        )

    additional_orders = [
        {
            'buyer': customers[0],
            'address': address,
            'total_amount': 1500000.00,
            'status': 'confirmed',
            'payment_method': 'Momo',
            'payment_status': 'paid',
            'shipping_fee': 35000.00,
        },
        {
            'buyer': customers[1] if len(customers) > 1 else customers[0],
            'address': address,
            'total_amount': 4500000.00,
            'status': 'shipped',
            'payment_method': 'Bank Transfer',
            'payment_status': 'paid',
            'shipping_fee': 50000.00,
        },
        {
            'buyer': customers[0],
            'address': address,
            'total_amount': 800000.00,
            'status': 'cancelled',
            'payment_method': 'COD',
            'payment_status': 'pending',
            'shipping_fee': 20000.00,
        },
        {
            'buyer': customers[1] if len(customers) > 1 else customers[0],
            'address': address,
            'total_amount': 2200000.00,
            'status': 'returned',
            'payment_method': 'ZaloPay',
            'payment_status': 'refunded',
            'shipping_fee': 30000.00,
        },
    ]

    for order_data in additional_orders:
        if not Order.objects.filter(buyer=order_data['buyer'], total_amount=order_data['total_amount']).exists():
            order = Order.objects.create(**order_data)
            print(f'Created order: #{order.order_id} for {order.buyer.username} - {order.status} - {order.payment_status}')
        else:
            print(f'Order for {order_data["buyer"].username} with amount {order_data["total_amount"]} already exists')

print('\nDone adding additional demo data!')
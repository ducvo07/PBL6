import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
import django
django.setup()

from SHOEX.discount.models import Voucher

# Create a test voucher
voucher = Voucher.objects.create(
    code='EDITTEST',
    type='platform',
    discount_type='percent',
    discount_value=15.0,
    start_date='2024-01-01',
    end_date='2024-12-31'
)
print(f'Created voucher: {voucher.code} - ID: {voucher.voucher_id}')

# Check all vouchers
vouchers = Voucher.objects.all()
print(f'Total vouchers: {len(vouchers)}')
for v in vouchers:
    print(f'{v.voucher_id} - {v.code} - {v.type} - {v.discount_type} - {v.discount_value}%')
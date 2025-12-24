import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
import django
django.setup()

from SHOEX.users.models import User
from SHOEX.address.models import Address

# Check users
users = User.objects.all()
print(f'Users: {len(users)}')
for u in users:
    print(f'ID: {u.id}, Username: {u.username}')

# Check addresses
addresses = Address.objects.all()
print(f'Addresses: {len(addresses)}')
for a in addresses:
    print(f'ID: {a.address_id}, User: {a.user.username if a.user else None}')
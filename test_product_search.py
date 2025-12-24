import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shoex-backend'))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

query = '''
query {
  products(search: "Shoes") {
    productId
    name
    basePrice
  }
}
'''

result = schema.execute(query)
print('Search result for Shoes:')
if result.data:
    products = result.data['products']
    print(f'Found {len(products)} products')
    for p in products[:5]:  # Show first 5
        print(f'- {p["name"]}: {p["basePrice"]}')
else:
    print('No data')
if result.errors:
    print('Errors:', result.errors)
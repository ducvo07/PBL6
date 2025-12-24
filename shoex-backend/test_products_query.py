import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

# Test query without auth
query = '''
query {
  products {
    productId
    name
    basePrice
    isActive
    store {
      name
    }
    category {
      name
    }
    createdAt
  }
}
'''

result = schema.execute(query)
print('Query result without auth:')
if result.errors:
    print('Errors:')
    for error in result.errors:
        print(error)
else:
    print('Success - data returned')
    print(f'Number of products: {len(result.data["products"])}')
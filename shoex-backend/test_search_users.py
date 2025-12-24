import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

# Test search query
query = '''
query {
  users(search: "customer") {
    id
    username
    email
    fullName
    role
    isActive
  }
}
'''

result = schema.execute(query)
print('Search result for "customer":')
if result.errors:
    print('Errors:')
    for error in result.errors:
        print(error)
else:
    print('Success!')
    users = result.data['users']
    print(f'Found {len(users)} users:')
    for user in users:
        print(f'  {user["username"]} - {user["email"]}')
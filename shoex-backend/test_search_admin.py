import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

# Test search query with specific username
query = '''
query {
  users(search: "admin") {
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
print('Search result for "admin":')
if result.errors:
    print('Errors:')
    for error in result.errors:
        print(error)
else:
    users = result.data['users']
    print(f'Found {len(users)} users:')
    for user in users:
        print(f'  ID: {user["id"]}, Username: {user["username"]}, Email: {user["email"]}')
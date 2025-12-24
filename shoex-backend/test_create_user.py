import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

# Test create user mutation
mutation = '''
mutation {
  userCreate(input: {
    username: "testuser123"
    email: "test@example.com"
    password: "TestPass123!"
    fullName: "Test User"
    role: "buyer"
    isActive: true
  }) {
    success
    user {
      id
      username
      email
      fullName
      role
      isActive
    }
    errors
  }
}
'''

result = schema.execute(mutation)
print('Mutation result:')
if result.errors:
    print('Errors:')
    for error in result.errors:
        print(error)
else:
    print('Success!')
    print(result.data)
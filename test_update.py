import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shoex-backend'))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

query = '''
mutation {
  userUpdate(id: "10", input: {username: "testuser_updated", email: "test@example.com"}) {
    success
    user {
      id
      username
      email
    }
    errors
  }
}
'''

result = schema.execute(query)
print('Update result:')
print(result)
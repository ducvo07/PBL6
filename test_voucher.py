import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SHOEX.config.settings')
django.setup()

from SHOEX.graphql_api.api import schema

# Test create voucher mutation
mutation = '''
mutation {
  create_voucher(input: {
    code: "TESTVOUCHER",
    type: "platform",
    discountType: "percent",
    discountValue: 10.0,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  }) {
    success
    message
    voucher {
      voucherId
      code
      type
      discountType
      discountValue
    }
  }
}
'''

result = schema.execute(mutation)
print('Mutation result:')
print(result)
if result.errors:
    print('Errors:')
    for error in result.errors:
        print(error)
else:
    print('Success!')
import requests

url = 'http://localhost:8000/graphql'
headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
query = '{ orders { orderId buyer { username fullName } totalAmount status paymentStatus createdAt } }'
try:
    resp = requests.post(url, json={'query': query}, headers=headers, timeout=10)
    print('Status:', resp.status_code)
    print('Content-Type:', resp.headers.get('Content-Type'))
    print('\nResponse body:\n')
    print(resp.text)
except Exception as e:
    print('Request error:', e)

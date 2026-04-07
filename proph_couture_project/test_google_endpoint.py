import requests
import json

url = 'http://localhost:8000/api/users/google/'
data = {'access_token': 'dummy_token_from_python_script'}
headers = {'Content-Type': 'application/json'}

try:
    print(f"Sending POST to {url} with data: {data}")
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")

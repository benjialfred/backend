import requests
import json

url = "http://localhost:8000/api/users/register/"
data = {
    "email": "debug_crash_test@example.com",
    "password": "StrongPass123!",
    "confirm_password": "StrongPass123!",
    "nom": "CrashTest",
    "role": "CLIENT"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response Content:")
    print(response.text[:2000]) # First 2000 chars to see the exception
except Exception as e:
    print(f"Request failed: {e}")

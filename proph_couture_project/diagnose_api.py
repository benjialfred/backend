
import requests

base_urls = [
    "https://api.nelsius.com/v1/payments",
    "https://api.nelsius.com/payments",
    "https://api.nelsius.com/api/v1/payments",
    "https://nelsius.com/api/v1/payments"
]

for url in base_urls:
    print(f"Testing {url}...")
    try:
        response = requests.post(url, json={}, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)

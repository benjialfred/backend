import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

url = "https://www.googleapis.com/oauth2/v3/userinfo"
print(f"Testing connectivity to {url}...")

try:
    response = requests.get(url, verify=False, timeout=10)
    print(f"Response Code: {response.status_code}")
    print("Connectivity: OK (even if 401/403 which is expected without token)")
    print(f"Content snippet: {response.text[:100]}")
except Exception as e:
    print(f"Connectivity: FAILED")
    print(f"Error: {e}")

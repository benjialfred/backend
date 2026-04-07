
import os
import django
import requests
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from payments.services.nelsius_service import NelsiusService

try:
    print("Initializing Nelsius Service...")
    service = NelsiusService()
    print(f"API Key: {service.api_key}")
    print(f"Base URL: {service.base_url}")
    print(f"Headers: {service.headers}")
    
    # Simulate a payment verification call (lightweight) or just a raw request check
    print("\nTesting connection to Nelsius API with configured key...")
    
    test_payload = {
        "operator": "global",
        "amount": "1000",
        "currency": "XAF",
        "email": "test@example.com",
        "description": "Test Connection",
        "success_url": "http://localhost/success",
        "cancel_url": "http://localhost/cancel"
    }
    
    response = requests.post(
        f"{service.base_url}/payments/mobile-money",
        headers=service.headers,
        json=test_payload,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 401:
        print("\nERROR: 401 Unauthorized. This usually means the API Key is invalid or this endpoint requires a Secret Key.")
    elif response.status_code == 200:
         print("\nSUCCESS: Connection established.")

except Exception as e:
    print(f"Error during verification: {e}")

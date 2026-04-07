
import os
import sys
import django

# Setup Django environment
sys.path.append('c:/PhC/proph_couture_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.conf import settings
from payments.services.nelsius_service import NelsiusService
from orders.models import Order

def test_config():
    print(f"API KEY Starting with: {settings.NELSIUS_API_KEY[:5]}...")
    print(f"SECRET KEY Starting with: {settings.NELSIUS_SECRET_KEY[:5]}...")
    
    service = NelsiusService()
    
    # Try to generate signature with dummy data
    data = {"test": "data"}
    sig = service._generate_signature(data)
    print(f"Generated Signature with current secret: {sig}")

    # Create dummy order for testing initiation
    # We won't actually call Nelsius because we don't want to spam real API with bad requests if we can avoid it, 
    # BUT the best test is to try and see if it returns 401 or 200.
    
    # Let's try verify_payment with a random ID to check auth
    print("Testing Auth with random verification...")
    res = service.verify_payment("random_id_123")
    print(f"Verification Result: {res}")

if __name__ == "__main__":
    test_config()

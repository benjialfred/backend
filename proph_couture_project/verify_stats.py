import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS += ['testserver']

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from users.models import UserRole

User = get_user_model()

def test_dashboard_stats():
    print("Testing Dashboard Stats Endpoint...")
    
    # Get or create an admin user
    try:
        admin_user = User.objects.filter(role=UserRole.ADMIN).first()
        if not admin_user:
            print("No admin user found. Creating one...")
            admin_user = User.objects.create_user(
                email='test_admin_stats@example.com',
                password='password123',
                role=UserRole.ADMIN,
                nom='Admin',
                prenom='Test'
            )
    except Exception as e:
        print(f"Error getting admin user: {e}")
        return

    # Create client and authenticate
    client = APIClient()
    client.force_authenticate(user=admin_user)

    # Execute request
    try:
        response = client.get('/api/orders/dashboard/stats/')
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.data
            print("\nResponse Data Keys:")
            print(data.keys())
            
            print("\nMonthly Orders Sample:")
            print(json.dumps(data['monthly_orders'][:3], indent=2))
            
            print("\nYearly Orders Sample:")
            print(json.dumps(data['yearly_orders'][:3], indent=2))
            
            print("\nBest Products:")
            print(json.dumps(data['best_products'], indent=2))
            
            print("\nSUCCESS: Endpoint is working and returning structured data.")
        else:
            print(f"FAILURE: Unexpected status code. {response.data}")

    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_dashboard_stats()

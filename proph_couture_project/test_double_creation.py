import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from products.models import Product, Category

def test_product_creation():
    # Clear products first or just count them
    initial_count = Product.objects.count()
    print(f"Initial product count: {initial_count}")
    
    cat, _ = Category.objects.get_or_create(nom="Test Category")
    
    from rest_framework.test import APIClient
    from django.contrib.auth import get_user_model
    User = get_user_model()
    admin_user, _ = User.objects.get_or_create(email="admin@test.com", username="admin_test", role="SUPER_ADMIN")
    admin_user.set_password("password123")
    admin_user.save()
    
    client = APIClient()
    client.force_authenticate(user=admin_user)
    
    data = {
        "nom": "Test double creation",
        "description": "Just testing",
        "prix": 15000,
        "stock": 10,
        "category_id": cat.id,
        "sku": "SKU-9999",
        "image_principale": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
    
    response = client.post('/api/products/', data, format='json')
    print(f"Response status: {response.status_code}")
    print(f"Response data: {response.data}")
    
    final_count = Product.objects.count()
    print(f"Final product count: {final_count}")
    print(f"Difference: {final_count - initial_count}")

test_product_creation()

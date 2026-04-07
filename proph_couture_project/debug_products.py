import os
import sys

# Setup Django first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
import django
from django.conf import settings
if not settings.configured:
    django.setup()
    settings.ALLOWED_HOSTS.append('testserver')
else:
    # If already configured (e.g. by import side effect), patch it
    if 'testserver' not in settings.ALLOWED_HOSTS:
        settings.ALLOWED_HOSTS.append('testserver')


# Now import Django parts
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from django.contrib.auth import get_user_model
from products.views import ProductViewSet, CategoryViewSet

User = get_user_model()
try:
    user = User.objects.get(email='admin@phc.com')
except User.DoesNotExist:
    users = User.objects.filter(is_superuser=True)
    if users.exists():
        user = users.first()
    else:
        print("No admin user found for test")
        exit(1)

print(f"Using user: {user.email} Role: {getattr(user, 'role', 'N/A')}")

factory = RequestFactory()

# Test Products (API uses /api/products/)
print("\n--- Testing Products API (List) ---")
request = factory.get('/api/products/')
force_authenticate(request, user=user)
product_view = ProductViewSet.as_view({'get': 'list'})

try:
    response = product_view(request)
    print("Products Status Code:", response.status_code)
    if hasattr(response, 'data'):
        data = response.data
        if 'results' in data:
            print("Products Count:", len(data['results']))
            if len(data['results']) > 0:
                  print("First Product Name:", data['results'][0].get('nom'))
        elif isinstance(data, list):
             print(f"Products List Count: {len(data)}")
        else:
             print("Products Data Structure:", type(data))
except Exception as e:
    print("Error calling Product view:", e)
    import traceback
    traceback.print_exc()

# Test Categories (API uses /api/products/categories/)
print("\n--- Testing Categories API (List) ---")
# Since we suspect URL routing conflict, let's test BOTH logic paths if possible
# But here we invoke ViewSet directly.
# 1. ProductViewSet.categories action
request_cats_action = factory.get('/api/products/categories/')
force_authenticate(request_cats_action, user=user)
product_view_cats = ProductViewSet.as_view({'get': 'categories'})

print(">> Action: ProductViewSet.categories")
try:
    response = product_view_cats(request_cats_action)
    print("Status:", response.status_code)
    print("Data Type:", type(response.data))
    if isinstance(response.data, list):
         print("Count:", len(response.data))
    else:
         print("Data Keys:", response.data.keys())
except Exception as e:
    print("Error:", e)

# 2. CategoryViewSet.list
request_cats_list = factory.get('/api/products/categories/')
force_authenticate(request_cats_list, user=user)
category_view = CategoryViewSet.as_view({'get': 'list'})

print("\n>> ViewSet: CategoryViewSet.list")
try:
    response = category_view(request_cats_list)
    print("Status:", response.status_code)
    if 'results' in response.data:
         print("Count:", len(response.data['results']))
    else:
         print("Data structure:", type(response.data))
except Exception as e:
    print("Error:", e)

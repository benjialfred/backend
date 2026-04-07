import os
import sys

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')

import django
from django.conf import settings

if not settings.configured:
    django.setup()
    settings.ALLOWED_HOSTS.append('testserver')
else:
    if 'testserver' not in settings.ALLOWED_HOSTS:
        settings.ALLOWED_HOSTS.append('testserver')

# 2. Imports requiring settings to be configured
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from communications.views import EventViewSet

# 3. Get Admin User
User = get_user_model()
try:
    user = User.objects.get(email='admin@phc.com')
except User.DoesNotExist:
    users = User.objects.filter(is_superuser=True)
    if users.exists():
        user = users.first()
        print(f"Using fallback superuser: {user.email}")
    else:
        print("No admin user found")
        sys.exit(1)

factory = RequestFactory()
view = EventViewSet.as_view({'post': 'create'})

print("--- Testing Event Creation (No Image) ---")
data = {
    'title': 'Test Event No Image',
    'description': 'Description without image',
    'category': 'AUTRE',
    'date': '2024-02-01',
    'location': 'Test Location',
    'is_active': 'true' 
}
# Use multipart to simulate exact frontend behavior (FormData)
request = factory.post('/api/events/', data, format='multipart')
force_authenticate(request, user=user)

try:
    response = view(request)
    print("Status:", response.status_code)
    if response.status_code >= 400:
        print("Error Data:", response.data)
    else:
        print("Success Data:", response.data['title'])
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()

print("\n--- Testing Event Creation (With Image) ---")
image = SimpleUploadedFile("test_image.jpg", b"file_content", content_type="image/jpeg")
data['title'] = 'Test Event With Image'
data['image'] = image

request = factory.post('/api/events/', data, format='multipart')
force_authenticate(request, user=user)

try:
    response = view(request)
    print("Status:", response.status_code)
    if response.status_code >= 400:
        print("Error Data:", response.data)
    else:
        print("Success Data:", response.data['title'])
except Exception as e:
    print("Error:", e)

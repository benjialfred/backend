
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from communications.views import AnnouncementViewSet
from communications.models import Announcement
from users.models import User, UserRole
import traceback

def test_announcements():
    print("--- Testing Announcements ---")
    
    # 1. Check DB
    try:
        count = Announcement.objects.count()
        print(f"Announcement count: {count}")
    except Exception as e:
        print(f"DB Error: {e}")
        return
    
    # 2. Test Unauthenticated
    factory = APIRequestFactory()
    view = AnnouncementViewSet.as_view({'get': 'list'})
    request = factory.get('/api/communications/announcements/')
    
    try:
        print("Sending Unauthenticated Request...")
        response = view(request)
        print(f"Unauthenticated Response: {response.status_code}")
        if response.status_code >= 400:
            print(f"Response Data: {response.data}")
    except Exception as e:
        print("CRASH Unauthenticated:")
        traceback.print_exc()

    # 3. Test Authenticated (Client)
    print("\n--- Testing with Client User ---")
    try:
        user, created = User.objects.get_or_create(email='test_client_debug@example.com', defaults={'nom': 'TestDebug', 'role': UserRole.CLIENT})
        if created:
             user.set_password('pass123')
             user.save()
             
        request = factory.get('/api/communications/announcements/')
        force_authenticate(request, user=user)
        response = view(request)
        print(f"Client Response: {response.status_code}")
        if response.status_code >= 400:
            print(f"Response Data: {response.data}")
    except Exception as e:
        print("CRASH Client:")
        traceback.print_exc()

if __name__ == '__main__':
    test_announcements()

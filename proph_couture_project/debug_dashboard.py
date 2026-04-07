import os
import django
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from users.views import UserStatsView

User = get_user_model()
try:
    user = User.objects.get(email='admin@phc.com')
except User.DoesNotExist:
    print("Admin user not found for test")
    exit(1)

factory = RequestFactory()
request = factory.get('/api/users/stats/')
force_authenticate(request, user=user)

view = UserStatsView.as_view()
try:
    response = view(request)
    print("Status Code:", response.status_code)
    print("Data:", response.data)
except Exception as e:
    print("Error calling view:", e)
    import traceback
    traceback.print_exc()

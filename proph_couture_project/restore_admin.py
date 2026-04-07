import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

User = get_user_model()
email = 'admin@phc.com'
password = 'PhC_Admin_Secure_2024!'

try:
    user = User.objects.get(email=email)
    print(f"User {email} found. Updating password...")
    user.set_password(password)
    user.role = 'SUPER_ADMIN'
    user.is_superuser = True
    user.is_staff = True
    user.account_enabled = True
    user.save()
    print("Password updated and permissions matched.")
except User.DoesNotExist:
    print(f"User {email} not found. Creating...")
    # Using simple create then setting password/role to avoid validation issues if any
    user = User.objects.create(
        email=email,
        nom='Admin',
        prenom='System',
        role='SUPER_ADMIN',
        is_superuser=True,
        is_staff=True,
        account_enabled=True,
        email_verified=True
    )
    user.set_password(password)
    user.save()
    print("Superuser created successfully.")
except Exception as e:
    print(f"Error: {e}")

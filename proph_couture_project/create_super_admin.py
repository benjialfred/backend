import os
import django
from django.contrib.auth import get_user_model

# Setup Django environment
# Setup Django environment
import sys
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

User = get_user_model()

def create_super_admin():
    email = "admin@phc.com"
    password = "PhC_Admin_Secure_2024!"
    
    try:
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.set_password(password)
            user.role = 'SUPER_ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Existing admin updated. Email: {email}, Password: {password}")
        else:
            User.objects.create_superuser(
                email=email,
                password=password,
                role='SUPER_ADMIN',
                nom="Admin",
                prenom="PhC",
                telephone="+237 680655136"
            )
            print(f"Super Admin created. Email: {email}, Password: {password}")
            
    except Exception as e:
        print(f"Error creating super admin: {str(e)}")

if __name__ == "__main__":
    create_super_admin()

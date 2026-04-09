"""
Script à exécuter sur Render via le Shell pour créer un admin de production.
Commande: python create_render_admin.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from users.models import User
from users.models import UserRole

email = 'benjaminadzessa@gmail.com'
password = 'Admin@PhC2026!'

user, created = User.objects.get_or_create(email=email)
user.set_password(password)
user.is_staff = True
user.is_superuser = True
user.is_active = True
try:
    user.role = UserRole.SUPER_ADMIN
except:
    pass
user.save()

print(f"{'Créé' if created else 'Mis à jour'} : {user.email}")
print(f"Mot de passe : {password}")
print(f"is_staff: {user.is_staff} | is_superuser: {user.is_superuser}")

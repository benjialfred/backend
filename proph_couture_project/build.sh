#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Création automatique du super admin de production
python manage.py shell -c "
from users.models import User
email='benjaminadzessa@gmail.com'
pwd='Admin@PhC2026!'
u,c=User.objects.get_or_create(email=email)
u.set_password(pwd)
u.is_staff=True
u.is_superuser=True
u.is_active=True
try:
    from users.models import UserRole
    u.role=UserRole.SUPER_ADMIN
except: pass
u.save()
print(f'Admin {email} OK (created={c})')
"

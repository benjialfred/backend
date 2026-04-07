
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import UserRole, Worker, Apprentice, WorkerFunction, GroupType, ApprenticeGrade

User = get_user_model()

def create_test_users():
    print("--- Creating Test Users ---")

    # 1. Create/Update WORKER
    worker_email = 'worker@phc.com'
    try:
        worker_user, created = User.objects.get_or_create(email=worker_email)
        worker_user.set_password('Worker123!')
        worker_user.nom = 'Benjamin'
        worker_user.prenom = 'Adzessa'
        worker_user.role = UserRole.WORKER
        worker_user.is_active = True
        worker_user.email_verified = True
        worker_user.save()
        
        # Create Worker Profile
        Worker.objects.get_or_create(
            user=worker_user,
            defaults={
                'fonction': WorkerFunction.SUPERVISEUR,
                'groupe': GroupType.PRODUCTION
            }
        )
        print(f"[OK] Worker created/updated: {worker_email} / Worker123!")
    except Exception as e:
        print(f"[ERROR] Error creating Worker: {e}")

    # 2. Create/Update APPRENTICE
    apprentice_email = 'apprentice@phc.com'
    try:
        apprentice_user, created = User.objects.get_or_create(email=apprentice_email)
        apprentice_user.set_password('Apprentice123!')
        apprentice_user.nom = 'Fraide'
        apprentice_user.prenom = 'Benji'
        apprentice_user.role = UserRole.APPRENTI
        apprentice_user.is_active = True
        apprentice_user.email_verified = True
        apprentice_user.save()
        
        # Create Apprentice Profile
        Apprentice.objects.get_or_create(
            user=apprentice_user,
            defaults={
                'grade': ApprenticeGrade.DEBUTANT
            }
        )
        print(f"[OK] Apprentice created/updated: {apprentice_email} / Apprentice123!")
    except Exception as e:
        print(f"[ERROR] Error creating Apprentice: {e}")

    # 3. Create/Update CLIENT (for completeness)
    client_email = 'client@phc.com'
    try:
        client_user, created = User.objects.get_or_create(email=client_email)
        client_user.set_password('Client123!')
        client_user.nom = 'Doe'
        client_user.prenom = 'Jane'
        client_user.role = UserRole.CLIENT
        client_user.is_active = True
        client_user.email_verified = True
        client_user.save()
        print(f"[OK] Client created/updated: {client_email} / Client123!")
    except Exception as e:
        print(f"[ERROR] Error creating Client: {e}")

    print("\n--- Seeding Complete ---")

if __name__ == "__main__":
    create_test_users()

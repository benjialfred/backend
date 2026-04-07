
import os
import django
import sys
import uuid
import datetime

# Setup Django environment
sys.path.append(r'C:\PhC\proph_couture_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import WorkerGroup, WorkerProject, Apprentice, UserRole, Material
from communications.models import DailyJournal, GroupInvitation

User = get_user_model()

def verify_backend():
    print("Starting Dashboard Backend Verification...")
    
    # 1. Verify/Create Users for testing
    print("\n--- Verifying Users ---")
    apprentice_user, _ = User.objects.get_or_create(email="apprentice_test@test.com", defaults={
        "nom": "Apprentice", "prenom": "Test", "role": UserRole.APPRENTI, "is_active": True
    })
    worker_user, _ = User.objects.get_or_create(email="worker_test@test.com", defaults={
        "nom": "Worker", "prenom": "Test", "role": UserRole.WORKER, "is_active": True
    })
    
    # Create Apprentice profile if not exists
    if not hasattr(apprentice_user, 'apprentice_profile'):
        Apprentice.objects.create(user=apprentice_user, grade='DEBUTANT')
        print("Created Apprentice profile.")
        
    print(f"Users ready: {apprentice_user.email} (Apprentice), {worker_user.email} (Worker)")

    # 2. Daily Journal
    print("\n--- Testing Daily Journal ---")
    journal, created = DailyJournal.objects.get_or_create(
        apprentice=apprentice_user,
        date=datetime.date.today(),
        defaults={"content": "Aujourd'hui, j'ai appris à coudre un bouton."}
    )
    print(f"Journal Entry: {journal.content} (Created: {created})")
    
    # 3. Worker Group
    print("\n--- Testing Worker Group ---")
    group, created = WorkerGroup.objects.get_or_create(
        name="Test Workshop Group",
        leader=worker_user,
        defaults={"description": "A test group for verification."}
    )
    print(f"Worker Group: {group.name} (Leader: {group.leader})")
    
    # 4. Worker Project
    print("\n--- Testing Worker Project ---")
    project, created = WorkerProject.objects.get_or_create(
        title="Test Project Robe",
        worker=worker_user,
        defaults={"description": "Confection robe rouge", "status": "PLANNED"}
    )
    print(f"Worker Project: {project.title} (Status: {project.status})")
    
    # 5. Inventory (Material)
    print("\n--- Testing Inventory ---")
    material, created = Material.objects.get_or_create(
        name="Ciseaux Professionnels",
        owner=apprentice_user,
        defaults={"quantity": 1, "status": "BON_ETAT", "description": "Mes ciseaux persos"}
    )
    print(f"Material: {material.name} (Owner: {material.owner.get_full_name()})")
    
    print("\nBackend Verification Complete. Data models and basic operations are functional.")

if __name__ == "__main__":
    try:
        verify_backend()
    except Exception as e:
        print(f"Verification Failed: {e}")

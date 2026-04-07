
import os
import django
import sys
import datetime

# Setup Django environment
sys.path.append(r'C:\PhC\proph_couture_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import UserRole
from communications.models import Notification, Announcement, GroupInvitation, DailyJournal
from communications.signals import create_invitation_notification, notify_apprentice_feedback

User = get_user_model()

def verify_notifications():
    print("Starting Notification Logic Verification...")
    
    # Setup Users
    admin, _ = User.objects.get_or_create(email="admin_verify@test.com", defaults={
        "nom": "Admin", "prenom": "Verify", "role": UserRole.ADMIN, "is_active": True, "is_staff": True
    })
    worker, _ = User.objects.get_or_create(email="worker_verify@test.com", defaults={
        "nom": "Worker", "prenom": "Verify", "role": UserRole.WORKER, "is_active": True
    })
    apprentice, _ = User.objects.get_or_create(email="apprentice_verify@test.com", defaults={
        "nom": "Apprentice", "prenom": "Verify", "role": UserRole.APPRENTI, "is_active": True
    })
    
    # 1. Test Announcement creation
    print("\n--- Testing Announcement ---")
    announcement = Announcement.objects.create(
        author=admin,
        title="Admin Test Announcement",
        content="Testing admin announcement creation.",
        target_role="ALL",
        is_public=True
    )
    print(f"Announcement created: {announcement.title}")
    
    # 2. Test Group Invitation Notification Link
    print("\n--- Testing Invitation Notification ---")
    # Clean previous notifications
    Notification.objects.filter(user=worker).delete()
    
    # Worker invites Apprentice (simulating logic where signal triggers)
    # Important: Signal relies on recipient_email.
    
    # Clean prev invitation
    GroupInvitation.objects.filter(recipient_email=apprentice.email).delete()
    
    # Create group first
    from users.models import WorkerGroup
    group, _ = WorkerGroup.objects.get_or_create(name="Verify Group", leader=worker)

    # Create invitation with group
    invitation = GroupInvitation.objects.create(
        sender=worker,
        recipient_email=apprentice.email,
        group=group
    )
    
    # Check if notification key created for Apprentice
    notif = Notification.objects.filter(user=apprentice, title="Nouvelle invitation de groupe").first()
    if notif:
        print(f"SUCCESS: Notification created for invitation: {notif.message}")
    else:
        print("FAILURE: No notification found for invitation.")
        
    # 3. Test Journal Feedback Notification
    print("\n--- Testing Journal Feedback Notification ---")
    journal, _ = DailyJournal.objects.get_or_create(
        apprentice=apprentice,
        date=datetime.date.today(),
        defaults={"content": "Learning verification."}
    )
    
    # Update with feedback
    journal.supervisor_feedback = "Great job!"
    journal.save()
    
    # Check notification for apprentice
    notif_journal = Notification.objects.filter(user=apprentice, title="Nouveau feedback reçu").first()
    if notif_journal:
        print(f"SUCCESS: Notification created for feedback: {notif_journal.message}")
    else:
        print("FAILURE: No notification found for feedback.")

    # 4. Cleanup
    # Optional cleanup

if __name__ == "__main__":
    try:
        verify_notifications()
    except Exception as e:
        print(f"Verification Failed: {e}")

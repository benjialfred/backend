from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GroupInvitation, Notification
from users.models import User

@receiver(post_save, sender=GroupInvitation)
def create_invitation_notification(sender, instance, created, **kwargs):
    if created and instance.status == 'PENDING':
        try:
            # Check if user exists with this email
            user = User.objects.filter(email=instance.recipient_email).first()
            if user:
                # Link the user to the invitation for easier lookup
                instance.recipient = user
                instance.save(update_fields=['recipient']) # Avoid recursion loop
                
                # Create notification
                Notification.objects.create(
                    user=user,
                    title="Nouvelle invitation de groupe",
                    message=f"Vous avez été invité à rejoindre le groupe '{instance.group.name}' par {instance.sender.get_full_name()}.",
                    type="INFO"
                )
        except Exception as e:
            print(f"Error creating notification: {e}")
    
    # Notify Sender when invitation is updated (Accepted/Rejected)
    if not created and instance.status in ['ACCEPTED', 'REJECTED']:
        try:
            Notification.objects.create(
                user=instance.sender,
                title=f"Invitation {instance.get_status_display()}",
                message=f"L'invitation envoyée à {instance.recipient_email} pour le groupe '{instance.group.name}' a été {instance.get_status_display().lower()}.",
                type="SUCCESS" if instance.status == 'ACCEPTED' else "WARNING"
            )
        except Exception as e:
            print(f"Error notifying sender: {e}")

from .models import DailyJournal

@receiver(post_save, sender=DailyJournal)
def notify_apprentice_feedback(sender, instance, created, **kwargs):
    # Notify apprentice if supervisor_feedback is added/changed
    # We need to check if it changed. Since post_save doesn't provide 'previous' state easily without a custom Tracker, 
    # we can just assume if feedback is present and updated_at is recent, we notify? 
    # Or cleaner: Only if feedback is NOT empty.
    # To reduce spam, we might only want to do this if it WAS empty or changed. 
    # For MVP, let's just notify if feedback is present.
    
    if not created and instance.supervisor_feedback:
        # Avoid spamming (this is a simple implementation, ideally check against DB pre-save or use dirty fields)
        try:
            Notification.objects.create(
                user=instance.apprentice,
                title="Nouveau feedback reçu",
                message=f"Un superviseur a laissé un feedback sur votre journal du {instance.date}.",
                type="INFO"
            )
        except Exception as e:
            print(f"Error feedback notification: {e}")

from products.models import Product
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=Product)
def notify_users_new_product(sender, instance, created, **kwargs):
    if created:
        try:
            # 1. Notifier les Administrateurs
            admins = User.objects.filter(role__in=['ADMIN', 'SUPER_ADMIN'])
            for admin in admins:
                Notification.objects.create(
                    user=admin,
                    title="Nouveau Produit Ajouté",
                    message=f"Le produit '{instance.nom}' a été enregistré dans le système.",
                    type="INFO"
                )
                
            # 2. Notifier TOUS les clients (Broadcast)
            clients = User.objects.filter(role='CLIENT', is_active=True)
            for client in clients:
                Notification.objects.create(
                    user=client,
                    title="Nouvelle merveille disponible ✨",
                    message=f"Découvrez notre nouvelle création : {instance.nom}.",
                    type="INFO"
                )
                
            client_emails = [c.email for c in clients if c.email]
            if client_emails:
                subject = "Nouvelle création chez Prophétique Couture ✨"
                message = f"Bonjour,\n\nNous venons d'ajouter une nouvelle création à notre catalogue : {instance.nom}.\n\nConnectez-vous vite sur notre application pour la découvrir et passer commande !\n\nL'équipe Prophétique Couture."
                # Pour éviter le spam massif ou de montrer tous les emails, fail_silently=True gère la sécurité.
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, client_emails, fail_silently=True)
                
        except Exception as e:
            print(f"Error product notification: {e}")

@receiver(post_save, sender=User)
def notify_admin_new_user(sender, instance, created, **kwargs):
    if created and instance.role not in ['ADMIN', 'SUPER_ADMIN']:
        try:
            admins = User.objects.filter(role__in=['ADMIN', 'SUPER_ADMIN'])
            for admin in admins:
                # get_role_display might fail if instance has no role choices initialized, fallback to role string
                role_display = getattr(instance, 'get_role_display', lambda: instance.role)()
                Notification.objects.create(
                    user=admin,
                    title="Nouvel Utilisateur Inscrit",
                    message=f"Un nouvel utilisateur ({instance.email}) s'est inscrit en tant que {role_display}.",
                    type="INFO"
                )
        except Exception as e:
            print(f"Error user notification: {e}")

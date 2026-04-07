from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Worker, Apprentice, UserRole

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Crée ou met à jour le profil (Worker/Apprentice) associé selon le rôle de l'utilisateur.
    """
    if instance.role == UserRole.WORKER:
        Worker.objects.get_or_create(user=instance)
        # Si l'utilisateur avait un profil Apprenti, on pourrait vouloir le supprimer ou le garder
        # Pour l'instant, on laisse tel quel pour éviter la perte de données accidentelle
        
    elif instance.role == UserRole.APPRENTI:
        Apprentice.objects.get_or_create(user=instance)

    # Note: On ne supprime pas automatiquement les profils si le rôle change
    # pour éviter de perdre l'historique ou des données importantes.
    # Cela devra être géré via une action d'administration spécifique si nécessaire.

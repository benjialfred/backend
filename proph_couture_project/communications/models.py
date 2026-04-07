from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Announcement(models.Model):
    TARGET_ROLES = [
        ('ALL', 'Tout le monde'),
        ('WORKER', 'Travailleurs uniquement'),
        ('APPRENTI', 'Apprentis uniquement'),
        ('CLIENT', 'Clients uniquement'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='announcements')
    target_role = models.CharField(max_length=20, choices=TARGET_ROLES, default='ALL')
    is_public = models.BooleanField(default=False, help_text="Si coché, visible sur la page d'accueil pour tous (y compris non connectés)")
    published_at = models.DateTimeField(default=timezone.now, help_text="Date de publication de l'annonce")
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Date d'expiration de l'annonce")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Notification(models.Model):
    TYPES = [
        ('INFO', 'Information'),
        ('WARNING', 'Avertissement'),
        ('SUCCESS', 'Succès'),
        ('ERROR', 'Erreur'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=TYPES, default='INFO')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class DailyJournal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    apprentice = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='journals',
        limit_choices_to={'role': 'APPRENTI'}
    )
    date = models.DateField(default=timezone.now)
    content = models.TextField(verbose_name="Contenu du journal")
    supervisor_feedback = models.TextField(blank=True, null=True, verbose_name="Feedback du superviseur")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        unique_together = ['apprentice', 'date']

    def __str__(self):
        return f"Journal de {self.apprentice.get_full_name()} du {self.date}"

class GroupInvitation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('ACCEPTED', 'Acceptée'),
        ('REJECTED', 'Refusée'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sended_invitations'
    )
    recipient_email = models.EmailField()
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='received_invitations'
    )
    group = models.ForeignKey(
        'users.WorkerGroup', 
        on_delete=models.CASCADE, 
        related_name='invitations'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invitation pour {self.recipient_email} par {self.sender.get_full_name()}"

class ContactMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Nom complet")
    email = models.EmailField(verbose_name="Adresse email")
    subject = models.CharField(max_length=200, verbose_name="Sujet")
    message = models.TextField(verbose_name="Message")
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False, verbose_name="Traité")

    def __str__(self):
        return f"Message de {self.name} - {self.subject}"

    class Meta:
        ordering = ['-created_at']

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('DEFILE', 'Défilé de Mode'),
        ('SOUTENANCE', 'Soutenance Apprenti'),
        ('DON', 'Don Caritatif'),
        ('PARTENARIAT', 'Partenariat'),
        ('AUTRE', 'Autre'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name="Titre")
    description = models.TextField(verbose_name="Description")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='AUTRE', verbose_name="Catégorie")
    image = models.ImageField(upload_to='events/', verbose_name="Image à la une", blank=True, null=True)
    date = models.DateField(default=timezone.now, verbose_name="Date de l'évènement")
    location = models.CharField(max_length=200, blank=True, null=True, verbose_name="Lieu")
    is_active = models.BooleanField(default=True, verbose_name="Afficher sur le site")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = "Évènement"
        verbose_name_plural = "Évènements"

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('VALIDATED', 'Validé'),
        ('CANCELLED', 'Annulé'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    date_requested = models.DateTimeField(verbose_name="Date et heure souhaitée")
    reason = models.TextField(verbose_name="Motif du rendez-vous")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_requested']
        verbose_name = "Rendez-vous"
        verbose_name_plural = "Rendez-vous"

    def __str__(self):
        return f"RDV de {self.client.get_full_name()} le {self.date_requested.strftime('%d/%m/%Y %H:%M')}"

import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
import re
# ==========================================
# 1. GESTION DES RÔLES ET TYPES D'UTILISATEURS
# ==========================================
# Ces classes définissent les différentes énumérations utilisées dans la base de données.
# J'ai opté pour des TextChoices (Django 3.0+) car ils sont plus propres et plus faciles à manipuler
# avec Django REST Framework pour la validation côté frontend.

class UserRole(models.TextChoices):
    CLIENT = 'CLIENT', 'Client'
    APPRENTI = 'APPRENTI', 'Apprenti'
    WORKER = 'WORKER', 'Worker'
    ADMIN = 'ADMIN', 'Admin'
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'

# Configuration pour l'authentification à deux facteurs (2FA).
# Le type "NONE" est la valeur par défaut.
class TwoFactorType(models.TextChoices):
    EMAIL = 'EMAIL', 'Email'
    SMS = 'SMS', 'SMS'
    AUTHENTICATOR = 'AUTHENTICATOR', 'Authenticator'
    NONE = 'NONE', 'None'

# Définition des postes de travail spécifiques pour le rôle 'WORKER'
class WorkerFunction(models.TextChoices):
    COORDINATEUR = 'COORDINATEUR', 'Coordinateur'
    SUPERVISEUR = 'SUPERVISEUR', 'Superviseur'
    TECHNICIEN = 'TECHNICIEN', 'Technicien'
    COMMERCIAL = 'COMMERCIAL', 'Commercial'
    
# Ici in cree une classe qui  va nous permettre de de definir le type de groupe pour l'organisation du travail (prevu uniquement en cas d'evolution de l'evolution)
class GroupType(models.TextChoices):
    PRODUCTION = 'PRODUCTION', 'Production'
    QUALITE = 'QUALITE', 'Qualité'
    LIVRAISON = 'LIVRAISON', 'Livraison'
    SUPPORT = 'SUPPORT', 'Support'
    CREATION = 'CREATION', 'Création'


class GroupRole(models.TextChoices):
    LEADER = 'LEADER', 'Leader'
    MEMBRE = 'MEMBRE', 'Membre'
    APPRENTI = 'APPRENTI', 'Apprenti'
    SUPERVISEUR = 'SUPERVISEUR', 'Superviseur'
# Gradation des apprentis pour suivre leur évolution au sein de l'entreprise.
class ApprenticeGrade(models.TextChoices):
    DEBUTANT = 'DEBUTANT', 'Débutant'
    INTERMEDIAIRE = 'INTERMEDIAIRE', 'Intermédiaire'
    AVANCE = 'AVANCE', 'Avancé'
    MAITRE = 'MAITRE', 'Maître'
 
# ==========================================
# 2. GESTIONNAIRE D'UTILISATEURS PERSONNALISÉ
# ==========================================
# J'ai redéfini le BaseUserManager car j'utilise l'Email comme identifiant principal
# au lieu du classique 'username' de Django. C'est plus ergonomique pour les clients.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email est obligatoire')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.SUPER_ADMIN)
        extra_fields.setdefault('email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

from django.core.exceptions import ValidationError

# Validateur pour isoler la logique de contrôle du format téléphonique camerounais.
def validate_phone(value):
    # Accepte +237 ou 237 (optionnel), suivi éventuellement d'un espace ou tiret
    # Ensuite un 6 (pour mobile: 65,66,67,68,69,62) ou 2 (pour fixe: 22,23,24) et 7 chiffres.
    # Ex: +237680655136, 680655136, 237680655136
    pattern = r'^(?:\+237|237)?(?:\s|-)?(?:6[256789]|2[234])\d{7}$'
    # On supprime les espaces ou tirets éventuels pour faciliter la validation stricte
    cleaned_value = value.replace(' ', '').replace('-', '')
    if not re.match(pattern, cleaned_value):
        raise ValidationError('Format de téléphone invalide. Doit être un numéro du Cameroun (ex: 6XXXXXXXX ou +2376XXXXXXXX).')
# 3. MODÈLE UTILISATEUR CENTRAL (User)

# C'est la table maîtresse. Elle étend AbstractBaseUser pour un contrôle total de l'authentification.
# J'ai isolé les informations globales ici (Email, Téléphone, 2FA, Sécurité) et 
# relégué les données métier dans des tables liées (Worker, Apprentice) via OneToOneField.
class User(AbstractBaseUser, PermissionsMixin):
    # J'utilise UUID au lieu d'AutoField classique pour des raisons de sécurité 
    # (plus difficile à deviner dans les URLs et requêtes API).
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True, max_length=150)
    measurements = models.JSONField(default=dict, blank=True)
    telephone = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        validators=[validate_phone]
    )
    photo_profil = models.CharField(
        max_length=255, 
        default='/assets/images/profiles/default.png'
    )
    role = models.CharField(
        max_length=20, 
        choices=UserRole.choices, 
        default=UserRole.CLIENT
    )
    # SUPPRIMÉ: password_hash et password_salt car gérés par AbstractBaseUser (champ password)
    
    # 2FA : on gere l'authentification a deux facteurs (on choisit le type pour la recuperation du mot de passe )
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_type = models.CharField(
        max_length=20, 
        choices=TwoFactorType.choices, 
        default=TwoFactorType.NONE
    )
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    two_factor_backup_codes = models.JSONField(default=list)
    last_2fa_used = models.DateTimeField(blank=True, null=True)
    
    # Sécurité
    password_history = models.JSONField(default=list)
    password_changed_at = models.DateTimeField(default=timezone.now)
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(blank=True, null=True)
    account_enabled = models.BooleanField(default=True)
    
    # Tracking
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    last_login_user_agent = models.TextField(blank=True, null=True)
    
    # Adresse
    adresse_livraison = models.TextField(blank=True, null=True)
    ville = models.CharField(max_length=100, blank=True, null=True)
    pays = models.CharField(max_length=100, default='Cameroun')
    
    # Vérification
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    verification_token_expires = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    last_password_change = models.DateTimeField(default=timezone.now)
    
    # Champs Django par défaut (nécessaires pour le bon fonctionnement du panel admin)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    # Surcharge de la méthode save() pour garantir la synchronisation entre
    # mon champ "role" personnalisé et les permissions natives de Django.
    def save(self, *args, **kwargs):
        if self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            self.is_staff = True
            if self.role == UserRole.SUPER_ADMIN:
                self.is_superuser = True
        elif not self.is_superuser: # Sécurité : empêcher la rétrogradation accidentelle d'un super admin
             # Actually strict sync is better:
             self.is_staff = False
             # self.is_superuser = False # Dangerous to unset superuser automatically if not intended? 
             # Let's stick to the logic: If role is NOT Admin/SuperAdmin, they shouldn't be staff.
        
        # Correction logic
        if self.role == UserRole.SUPER_ADMIN:
            self.is_superuser = True
            self.is_staff = True
        elif self.role == UserRole.ADMIN:
            self.is_staff = True
            self.is_superuser = False
        else:
            self.is_staff = False
            self.is_superuser = False
            
        super().save(*args, **kwargs)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['account_enabled']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.prenom or ''} {self.nom}".strip()
    
    def get_short_name(self):
        return self.prenom or self.nom.split()[0] if self.nom else self.email

# ==========================================
# 4. PROFILS SPÉCIFIQUES
# ==========================================
# Table d'extension pour les "Travailleurs". Liée 1-à-1 avec l'Utilisateur.
# Ce pattern garantit une base de données propre d'un point de vue architectural
# (Les attributs 'fonction' et 'groupe' ne polluent pas la table des clients normaux).
class Worker(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='worker_profile'
    )
    fonction = models.CharField(
        max_length=20, 
        choices=WorkerFunction.choices,
        blank=True, 
        null=True
    )
    groupe = models.CharField(
        max_length=20, 
        choices=GroupType.choices,
        blank=True, 
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'workers'
    
    def __str__(self):
        return f"{self.user.email} - {self.fonction}"

# Table d'extension pour les "Apprentis".
class Apprentice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='apprentice_profile'
    )
    grade = models.CharField(
        max_length=20, 
        choices=ApprenticeGrade.choices, 
        default=ApprenticeGrade.DEBUTANT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'apprentices'
    
    def __str__(self):
        return f"{self.user.email} - {self.grade}"

# Gestion de groupes de travailleurs (Leader et Membres)
class WorkerGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    leader = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='led_groups',
        limit_choices_to={'role': UserRole.WORKER}
    )
    members = models.ManyToManyField(
        User, 
        related_name='worker_groups',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# ==========================================
# 5. GESTION DES PROJETS ET TÂCHES INTERNES
# ==========================================
class WorkerProject(models.Model):
    PROJECT_STATUS = [
        ('PLANNED', 'Planifié'),
        ('IN_PROGRESS', 'En cours'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='projects',
        limit_choices_to={'role': UserRole.WORKER}
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=PROJECT_STATUS, 
        default='PLANNED'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.title} ({self.worker.get_full_name()})"

# Cette table relie les tâches individuelles à un projet spécifique.
class WorkerTask(models.Model):
    TASK_STATUS = [
        ('TODO', 'À faire'),
        ('IN_PROGRESS', 'En cours'),
        ('REVIEW', 'En revue'),
        ('DONE', 'Terminé'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(WorkerProject, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='TODO')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.title} - {self.status}"



# users/serializers.py - Version corrigée
from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from .models import User, Worker, Apprentice, UserRole, WorkerGroup, WorkerProject, WorkerTask
from communications.models import GroupInvitation
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    photo_profil = serializers.CharField(required=False, allow_null=True)

    
    class Meta:
        model = User
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'photo_profil',
            'role', 'password', 'confirm_password', 'ville', 'pays',
            'adresse_livraison', 'email_verified', 'phone_verified',
            'two_factor_enabled',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email_verified', 'phone_verified', 'two_factor_enabled',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        if 'password' in data:
            if 'confirm_password' not in data:
                raise serializers.ValidationError({
                    "confirm_password": "Ce champ est requis."
                })
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError({
                    "password": "Les mots de passe ne correspondent pas."
                })
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)
        
        user = User.objects.create_user(password=password, **validated_data)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)
        
        if password:
            instance.set_password(password)
            instance.password_changed_at = timezone.now()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'nom', 'prenom', 'email', 'telephone', 
            'password', 'confirm_password', 'role',
            'ville', 'pays', 'adresse_livraison'
        ]
        extra_kwargs = {
            'prenom': {'required': False, 'allow_blank': True},
            'telephone': {'required': False, 'allow_blank': True},
            'ville': {'required': False, 'allow_blank': True},
            'pays': {'required': False, 'allow_blank': True, 'default': 'Cameroun'},
            'adresse_livraison': {'required': False, 'allow_blank': True},
            'role': {'read_only': True}
        }
    
    def validate(self, data):
        # Vérification de la confirmation du mot de passe
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                "confirm_password": "Les mots de passe ne correspondent pas."
            })
        
        # Vérification de l'email unique
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({
                "email": "Cet email est déjà utilisé."
            })
        
        return data
    
    def create(self, validated_data):
        # Retirer confirm_password avant de créer l'utilisateur
        confirm_password = validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Récupérer les valeurs avec des valeurs par défaut
        email = validated_data.get('email')
        nom = validated_data.get('nom')
        prenom = validated_data.get('prenom', '')
        telephone = validated_data.get('telephone', '')
        role = UserRole.CLIENT # Force role to CLIENT for public registration
        ville = validated_data.get('ville', '')
        pays = validated_data.get('pays', 'Cameroun')
        adresse_livraison = validated_data.get('adresse_livraison', '')
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            email=email,
            password=password,
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            role=role,
            ville=ville,
            pays=pays,
            adresse_livraison=adresse_livraison
        )
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Les mots de passe ne correspondent pas."})
        return data

class TwoFactorSetupSerializer(serializers.Serializer):
    # No fields needed for setup request, maybe password for security re-check?
    password = serializers.CharField(write_only=True)

class TwoFactorVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)


# ... reste du fichier inchangé ...
class WorkerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Worker
        fields = ['id', 'user', 'user_id', 'fonction', 'groupe', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        try:
            user = User.objects.get(id=user_id)
            worker = Worker.objects.create(user=user, **validated_data)
            return worker
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "user_id": "Utilisateur non trouvé."
            })

from inventory.serializers import MaterialSerializer

class ApprenticeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    materials = MaterialSerializer(source='user.materials', many=True, read_only=True)
    
    class Meta:
        model = Apprentice
        fields = ['id', 'user', 'user_id', 'grade', 'materials', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        try:
            user = User.objects.get(id=user_id)
            apprentice = Apprentice.objects.create(user=user, **validated_data)
            return apprentice
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "user_id": "Utilisateur non trouvé."
            })

class WorkerGroupSerializer(serializers.ModelSerializer):
    leader_details = UserSerializer(source='leader', read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.filter(role=UserRole.WORKER),
        source='members',
        write_only=True,
        required=False
    )
    members_details = UserSerializer(source='members', many=True, read_only=True)

    class Meta:
        model = WorkerGroup
        fields = ['id', 'name', 'description', 'leader', 'leader_details', 'members', 'member_ids', 'members_details', 'created_at']
        read_only_fields = ['leader', 'created_at']
        extra_kwargs = {
             'members': {'read_only': True}
        }

    def create(self, validated_data):
        # Leader is set in view
        return super().create(validated_data)

class WorkerTaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = WorkerTask
        fields = ['id', 'project', 'title', 'description', 'status', 'assigned_to', 'assigned_to_name', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] # project is writable

class WorkerProjectSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.get_full_name', read_only=True)
    tasks = WorkerTaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkerProject
        fields = ['id', 'worker', 'worker_name', 'title', 'description', 'start_date', 'end_date', 'status', 'tasks', 'created_at']
        read_only_fields = ['worker', 'created_at']

class GroupInvitationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = GroupInvitation
        fields = ['id', 'sender', 'sender_name', 'recipient_email', 'group', 'group_name', 'status', 'token', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'status', 'token', 'created_at', 'updated_at']
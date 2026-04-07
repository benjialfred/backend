# users/views.py - VERSION COMPLÈTE CORRIGÉE (ASCII LOGS)

from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
# from rest_framework.authtoken.models import Token # REMOVED: No longer using DRF Token
from rest_framework_simplejwt.tokens import RefreshToken # ADDED: SimpleJWT
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from django.db import models
import random
from .models import User, Worker, Apprentice, WorkerGroup, WorkerProject, WorkerTask, UserRole
from communications.models import GroupInvitation
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer,
    TwoFactorSetupSerializer, TwoFactorVerifySerializer,
    WorkerSerializer, ApprenticeSerializer,
    WorkerGroupSerializer, WorkerProjectSerializer, WorkerTaskSerializer,
    GroupInvitationSerializer
)
from products.models import Product
try:
    from orders.models import Order
except ImportError:
    Order = None

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import requests
import urllib3
# import pyotp
# import qrcode
import io
import base64
from django.core.mail import send_mail
from django.conf import settings

# DANGER: Désactiver la vérification SSL pour le développement Windows local
# Cela corrige "SSLError: [SSL: CERTIFICATE_VERIFY_FAILED]" quand requests appelle Google
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
old_request = requests.Session.request
def new_request(*args, **kwargs):
    kwargs['verify'] = False
    return old_request(*args, **kwargs)
requests.Session.request = new_request

class GoogleLogin(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] 

    def post(self, request):
        try:
            token = request.data.get('access_token')
            if not token:
                return Response({'error': 'No access token provided'}, status=status.HTTP_400_BAD_REQUEST)

            print(f"[INFO] Manual Google Login processing for token: {token[:10]}...")

            # 1. Verify token with Google
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            try:
                # Verify=False because of Windows SSL issues
                res = requests.get(user_info_url, params={'access_token': token}, verify=False)
            except Exception as e:
                print(f"[ERROR] Failed to connect to Google: {str(e)}")
                return Response({'error': f'Failed to connect to Google: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            if res.status_code != 200:
                print(f"[ERROR] Google rejected token: {res.text}")
                return Response({'error': 'Invalid Google Token', 'details': res.json()}, status=status.HTTP_401_UNAUTHORIZED)
            
            google_data = res.json()
            email = google_data.get('email')
            
            if not email:
                return Response({'error': 'Google account has no email'}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Find or Create User
            print(f"[OK] Google Token valid. Email: {email}")
            
            try:
                user = User.objects.get(email=email)
                created = False
            except User.DoesNotExist:
                print(f"Creating new user for {email}")
                user = User.objects.create(
                    email=email,
                    nom=google_data.get('family_name', 'Inconnu'),
                    prenom=google_data.get('given_name', 'Inconnu'),
                    photo_profil=google_data.get('picture', ''),
                    role='CLIENT',
                    account_enabled=True,
                    email_verified=True
                )
                created = True
                user.set_unusable_password()
                user.save()

            # 3. Generate App Token (JWT)
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'token': str(refresh.access_token), # Access Token
                'refresh': str(refresh),            # Refresh Token
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


# Vue pour vérifier l'email (NOUVELLE CLASSE)
class CheckEmailView(APIView):
    """
    Vérifie si un email existe déjà dans la base de données
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        email = request.query_params.get('email')
        
        if not email:
            return Response(
                {'error': 'Le paramètre email est requis.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = User.objects.filter(email=email).exists()
        
        return Response({
            'exists': exists,
            'message': 'Email déjà utilisé' if exists else 'Email disponible'
        })
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'L\'email est requis.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = User.objects.filter(email=email).exists()
        
        return Response({
            'exists': exists,
            'message': 'Email déjà utilisé' if exists else 'Email disponible'
        })

# Vue pour les statistiques du dashboard
class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_count = User.objects.count()
        product_count = Product.objects.count()
        
        if Order:
            from django.db.models import Sum
            order_count = Order.objects.count()
            revenue_data = Order.objects.filter(payment_status='paid').aggregate(Sum('total_amount'))
            total_revenue = revenue_data['total_amount__sum'] or 0
            pending_orders = Order.objects.filter(status='pending').count()
            today = timezone.now().date()
            orders_today = Order.objects.filter(created_at__date=today).count()
            current_month = timezone.now().month
            current_year = timezone.now().year
            monthly_revenue_data = Order.objects.filter(
                payment_status='paid',
                paid_at__month=current_month,
                paid_at__year=current_year
            ).aggregate(Sum('total_amount'))
            revenue_this_month = monthly_revenue_data['total_amount__sum'] or 0
        else:
            order_count = 0
            total_revenue = 0
            pending_orders = 0
            orders_today = 0
            revenue_this_month = 0
        
        active_apprentices = Apprentice.objects.filter(user__is_active=True).count() if 'Apprentice' in globals() else 0

        # Get recent activity
        recent_activity = []
        
        # Recent users
        recent_users = User.objects.order_by('-created_at')[:5]
        for user in recent_users:
            recent_activity.append({
                'type': 'user_registered',
                'message': f"Nouvel utilisateur: {user.get_full_name() or user.email}",
                'date': user.created_at
            })
            
        # Recent orders (if Order model exists)
        if Order:
            recent_orders = Order.objects.order_by('-created_at')[:5]
            for order in recent_orders:
                recent_activity.append({
                    'type': 'new_order',
                    'message': f"Nouvelle commande #{order.order_number} ({order.total_amount} FCFA)",
                    'date': order.created_at
                })
        
        # Sort combined activity by date desc
        recent_activity.sort(key=lambda x: x['date'], reverse=True)
        recent_activity = recent_activity[:10]

        stats = {
            'total_users': user_count,
            'total_products': product_count,
            'total_orders': order_count,
            'total_revenue': total_revenue,
            'pending_orders': pending_orders,
            'orders_today': orders_today,
            'revenue_this_month': revenue_this_month,
            'active_apprentices': active_apprentices,
            'recent_activity': recent_activity
        }
        
        # Add withdrawal stats if model exists
        try:
            from payments.models import Withdrawal
            # Count both pending and processed as "committed" funds to prevent double spend
            withdrawn = Withdrawal.objects.exclude(status='rejected').aggregate(Sum('amount'))['amount__sum'] or 0
            stats['total_withdrawn'] = withdrawn
            stats['available_balance'] = total_revenue - withdrawn
        except ImportError:
            stats['total_withdrawn'] = 0
            stats['available_balance'] = total_revenue

        return Response(stats)

# Vue d'inscription
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # IMPORTANT: désactive l'authentification
    
    def create(self, request, *args, **kwargs):
        try:
            print("[INFO] Données reçues:", request.data)
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                print("[ERROR] Erreurs de validation:", serializer.errors)
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = serializer.save()
            print(f"[OK] Utilisateur créé: {user.email}")
            
            # Generate JWT
            refresh = RefreshToken.for_user(user)
            
            # Envoyer e-mail de bienvenue
            try:
                from django.core.mail import EmailMultiAlternatives
                from django.template.loader import render_to_string
                from django.conf import settings
                
                context = {
                    'subject': 'Bienvenue chez ProphCouture',
                    'title': 'Bienvenue dans notre univers',
                    'greeting': f'Bonjour {user.prenom}',
                    'message': 'Nous sommes ravis de vous compter parmi nos membres privilèges. L\'excellence sur-mesure est désormais à votre portée. Découvrez nos dernières créations et commencez à concevoir votre vestiaire idéal.',
                    'button_url': f"{settings.FRONTEND_URL}/shop" if hasattr(settings, 'FRONTEND_URL') else "https://prophcouture.com/shop",
                    'button_text': "Explorer la boutique",
                    'extra_info': 'Consultez votre tableau de bord pour suivre vos commandes et prendre rendez-vous avec l\'atelier.'
                }
                
                html_content = render_to_string('emails/action.html', context)
                text_content = f"Bienvenue chez ProphCouture {user.prenom}. Découvrez nos collections sur notre site."
                
                msg = EmailMultiAlternatives(
                    context['subject'],
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send(fail_silently=True)
            except Exception as e:
                print(f"Erreur d'envoi de l'email de bienvenue: {e}")
            
            return Response({
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'nom': user.nom,
                    'prenom': user.prenom,
                    'role': user.role,
                    'telephone': user.telephone,
                    'ville': user.ville,
                    'pays': user.pays,
                    'adresse_livraison': user.adresse_livraison,
                },
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Inscription réussie!'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"[ERROR] Exception dans RegisterView: {str(e)}")
            return Response({
                'error': 'Erreur interne du serveur',
                'detail': str(e)  # En mode DEBUG
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vue de connexion
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(email=email, password=password)
            
            if user:
                if not user.account_enabled:
                    return Response({
                        'error': 'Compte désactivé.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                if user.account_locked_until and user.account_locked_until > timezone.now():
                    wait_time = (user.account_locked_until - timezone.now()).seconds // 60
                    return Response({
                        'error': f'Compte temporairement bloqué. Réessayez dans {wait_time + 1} minutes.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                user.last_login = timezone.now()
                user.failed_login_attempts = 0
                user.save()
                
                # 2FA Check
                if user.two_factor_enabled:
                    otp = request.data.get('otp')
                    if not otp:
                        return Response({
                            '2fa_required': True,
                            'message': 'Authentification à deux facteurs requise'
                        })
                    
                    if not user.two_factor_secret:
                        # Should not happen if enabled, but safety fallback
                        pass 
                    else:
                        totp = pyotp.TOTP(user.two_factor_secret)
                        if not totp.verify(otp):
                            return Response({
                                'error': 'Code A2F invalide',
                                '2fa_required': True
                            }, status=status.HTTP_400_BAD_REQUEST)

                # Generate JWT
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh': str(refresh),
                    'message': 'Connexion réussie!'
                })
            
            try:
                user = User.objects.get(email=email)
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= 5:
                    user.account_locked_until = timezone.now() + timezone.timedelta(minutes=15)
                user.save()
            except User.DoesNotExist:
                pass
            
            return Response({
                'error': 'Email ou mot de passe incorrect.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vue de déconnexion
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, Exception):
            pass
        
        return Response({
            'message': 'Déconnexion réussie!'
        }, status=status.HTTP_200_OK)

# Vue pour les utilisateurs
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'SUPER_ADMIN']:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    def perform_create(self, serializer):
        new_user = serializer.save()
        if self.request.user and self.request.user.is_authenticated and self.request.user.id != new_user.id:
            from communications.models import Notification
            name_display = new_user.get_full_name() or new_user.email
            Notification.objects.create(
                user=self.request.user,
                title="Utilisateur ajouté",
                message=f"Vous avez enregistré un nouvel utilisateur : {name_display}",
                type='SYSTEME'
            )

    def perform_update(self, serializer):
        updated_user = serializer.save()
        if self.request.user and self.request.user.is_authenticated and self.request.user.id != updated_user.id:
            from communications.models import Notification
            name_display = updated_user.get_full_name() or updated_user.email
            Notification.objects.create(
                user=self.request.user,
                title="Utilisateur modifié",
                message=f"Les informations de {name_display} ont été mises à jour.",
                type='SYSTEME'
            )

    def perform_destroy(self, instance):
        name_display = instance.get_full_name() or instance.email
        if self.request.user and self.request.user.is_authenticated and self.request.user.id != instance.id:
            from communications.models import Notification
            Notification.objects.create(
                user=self.request.user,
                title="Utilisateur supprimé",
                message=f"L'utilisateur {name_display} a été supprimé.",
                type='SYSTEME'
            )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not old_password or not new_password or not confirm_password:
            return Response({
                'error': 'Tous les champs sont requis.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                'error': 'Les nouveaux mots de passe ne correspondent pas.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(old_password):
            return Response({
                'error': 'Ancien mot de passe incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save()
        
        return Response({
            'message': 'Mot de passe changé avec succès!'
        })

# Vue pour les workers
class WorkerViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'SUPER_ADMIN']:
            return Worker.objects.all()
        return Worker.objects.filter(user=user)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

# Vue pour les apprentis
class ApprenticeViewSet(viewsets.ModelViewSet):
    serializer_class = ApprenticeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in ['ADMIN', 'SUPER_ADMIN']:
            return Apprentice.objects.all()
        return Apprentice.objects.filter(user=user)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class WorkerGroupViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return WorkerGroup.objects.all()
        # Workers see groups they lead or are members of
        if user.role == UserRole.WORKER:
            return WorkerGroup.objects.filter(models.Q(leader=user) | models.Q(members=user)).distinct()
        return WorkerGroup.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.WORKER:
             serializer.save(leader=self.request.user)
        else:
             serializer.save()

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id, role=UserRole.WORKER)
            group.members.add(user)
            return Response({'status': 'Member added'})
        except User.DoesNotExist:
            return Response({'error': 'Worker not found'}, status=status.HTTP_404_NOT_FOUND)

class WorkerProjectViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return WorkerProject.objects.all()
        if user.role == UserRole.WORKER:
            return WorkerProject.objects.filter(worker=user)
        return WorkerProject.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == UserRole.WORKER:
            serializer.save(worker=user)
        elif user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
             # Admin can assign project to a worker if 'worker_id' is provided
             worker_id = self.request.data.get('worker_id')
             if worker_id:
                 from django.shortcuts import get_object_or_404
                 worker_user = get_object_or_404(User, id=worker_id, role=UserRole.WORKER)
                 serializer.save(worker=worker_user)
             else:
                 # If admin is also a worker (unlikely given models but possible in logic), try to assign to self?
                 # Or raise error?
                 raise serializers.ValidationError({"worker_id": "L'ID du travailleur est requis pour une création administrateur."})
        else:
            raise serializers.ValidationError("Vous n'avez pas la permission de créer un projet.")


class WorkerTaskViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return WorkerTask.objects.all()
        if user.role == UserRole.WORKER:
            # Workers see tasks in their projects OR tasks assigned to them
            return WorkerTask.objects.filter(
                models.Q(project__worker=user) | models.Q(assigned_to=user)
            ).distinct()
        return WorkerTask.objects.none()

    def perform_create(self, serializer):
        # Ensure the project belongs to the worker (or admin override)
        project = serializer.validated_data.get('project')
        user = self.request.user
        if user.role == UserRole.WORKER and project.worker != user:
             raise serializers.ValidationError("Vous ne pouvez créer des tâches que pour vos projets.")
        serializer.save()


class GroupInvitationViewSet(viewsets.ModelViewSet):
    serializer_class = GroupInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return GroupInvitation.objects.all()
        # Workers see invitations they sent
        # Users see invitations they received (via email logic)
        return GroupInvitation.objects.filter(
            models.Q(sender=user) | 
            models.Q(recipient_email=user.email) |
            models.Q(recipient=user)
        ).distinct()

    def perform_create(self, serializer):
        # Auto-set sender
        invitation = serializer.save(sender=self.request.user)
        
        # Try to link recipient if user exists
        recipient_email = serializer.validated_data.get('recipient_email')
        try:
            recipient_user = User.objects.get(email=recipient_email)
            invitation.recipient = recipient_user
            invitation.save()
        except User.DoesNotExist:
            pass # Invitation remains pending for email

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        user = request.user
        
        # Verify token if provided (optional security layer)
        token = request.data.get('token')
        if token and str(invitation.token) != token:
             return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify recipient
        if invitation.recipient_email != user.email:
             return Response({'error': 'Cet email ne correspond pas à votre compte'}, status=status.HTTP_403_FORBIDDEN)

        # Accept logic
        invitation.status = 'ACCEPTED'
        invitation.recipient = user
        invitation.save()
        
        # Add to group
        invitation.group.members.add(user)
        
        return Response({'status': 'Invitation accepted', 'group': invitation.group.name})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        invitation = self.get_object()
        if invitation.recipient_email != request.user.email and invitation.sender != request.user:
             return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
             
        invitation.status = 'REJECTED'
        invitation.save()
        return Response({'status': 'Invitation rejected'})

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            otp = str(random.randint(100000, 999999))
            user.verification_token = otp
            user.verification_token_expires = timezone.now() + timedelta(minutes=10)
            user.save()
            print(f"DEBUG OTP for {email}: {otp}") 
            
            try:
                from django.core.mail import EmailMultiAlternatives
                from django.template.loader import render_to_string
                
                context = {
                    'subject': 'Réinitialisation de votre mot de passe',
                    'title': 'Code de réinitialisation',
                    'greeting': f'Bonjour',
                    'message': f'Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification à 6 chiffres :\n\n{otp}',
                    'extra_info': 'Si vous n\'avez pas fait cette demande, veuillez ignorer cet e-mail.'
                }
                
                html_content = render_to_string('emails/action.html', context)
                text_content = f"Votre code est : {otp}"
                
                msg = EmailMultiAlternatives(
                    'Réinitialisation Code - ProphCouture',
                    text_content,
                    'noreply@prophcouture.com',
                    [email]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send(fail_silently=True)
            except Exception as e:
                print(f"Erreur d'envoi d'email: {e}")
        except User.DoesNotExist:
            pass
            
        return Response({'message': 'Envoyé'})

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
             
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        try:
            user = User.objects.get(email=email)
            # Check OTP
            if user.verification_token == otp and user.verification_token_expires > timezone.now():
                return Response({'valid': True})
            return Response({'error': 'Code invalide ou expiré'}, status=400)
        except User.DoesNotExist:
             return Response({'error': 'Erreur'}, status=400)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)
            if user.verification_token == otp and user.verification_token_expires > timezone.now():
                user.set_password(new_password)
                user.verification_token = None
                user.save()
                return Response({'message': 'Mot de passe modifié.'})
            return Response({'error': 'Code invalide'}, status=400)
        except User.DoesNotExist:
             return Response({'error': 'Erreur'}, status=400)

class TwoFactorSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        # Generate Secret
        if not user.two_factor_secret:
            user.two_factor_secret = pyotp.random_base32()
            user.save()
            
        # Generate QR Code
        totp = pyotp.TOTP(user.two_factor_secret)
        provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="ProphCouture")
        
        qr = qrcode.make(provisioning_uri)
        stream = io.BytesIO()
        qr.save(stream, format='PNG')
        qr_image = base64.b64encode(stream.getvalue()).decode('utf-8')
        
        return Response({
            'secret': user.two_factor_secret,
            'qr_code': f"data:image/png;base64,{qr_image}"
        })

class TwoFactorVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        otp = serializer.validated_data['otp']
        user = request.user
        
        if not user.two_factor_secret:
             return Response({'error': '2FA not setup'}, status=400)
             
        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(otp):
            user.two_factor_enabled = True
            user.save()
            return Response({'message': '2FA Active'})
        
        return Response({'error': 'Invalid Code'}, status=400)

class TwoFactorDisableView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.two_factor_enabled = False
        user.two_factor_secret = None  # Optional: clear secret
        user.save()
        return Response({'message': '2FA Désactivé'})

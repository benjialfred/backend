from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django.utils import timezone
from .models import Announcement, Notification, DailyJournal, GroupInvitation, ContactMessage, Event
from .serializers import (
    AnnouncementSerializer, NotificationSerializer, 
    DailyJournalSerializer, GroupInvitationSerializer,
    ContactMessageSerializer, EventSerializer
)
from users.permissions import IsAdmin, IsWorker

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()] if self.action == 'list' else [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Announcement.objects.all().order_by('-created_at')
        
        if self.action == 'list':
             now = timezone.now()
             # Base filter: Must be published and not expired (unless admin)
             if not user.is_authenticated:
                 return queryset.filter(is_public=True, published_at__lte=now).filter(models.Q(expires_at__isnull=True) | models.Q(expires_at__gte=now))
             
             # Admin sees everything (no date filter needed, or optional)
             if user.role in ['ADMIN', 'SUPER_ADMIN']:
                 return queryset

             # Common filter for users: published <= now AND (expires >= now OR expires is NULL)
             active_filter = models.Q(published_at__lte=now) & (models.Q(expires_at__isnull=True) | models.Q(expires_at__gte=now))
             
             # Role based filtering combined with active_filter
             if user.role == 'WORKER':
                 return queryset.filter(active_filter).filter(models.Q(target_role__in=['ALL', 'WORKER']) | models.Q(is_public=True))
             elif user.role == 'APPRENTI':
                 return queryset.filter(active_filter).filter(models.Q(target_role__in=['ALL', 'APPRENTI']) | models.Q(is_public=True))
             else: # Client
                 return queryset.filter(active_filter).filter(models.Q(target_role__in=['ALL', 'CLIENT']) | models.Q(is_public=True))

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class DailyJournalViewSet(viewsets.ModelViewSet):
    serializer_class = DailyJournalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'APPRENTI':
            return DailyJournal.objects.filter(apprentice=user)
        # Admin and Worker (Supervisors) can see all (or filter by apprentice_id param)
        if user.role in ['ADMIN', 'SUPER_ADMIN', 'WORKER']:
            queryset = DailyJournal.objects.all()
            apprentice_id = self.request.query_params.get('apprentice_id')
            if apprentice_id:
                queryset = queryset.filter(apprentice_id=apprentice_id)
            return queryset
        return DailyJournal.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == 'APPRENTI':
            serializer.save(apprentice=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role == 'APPRENTI':
            # Apprentices cannot modify supervisor_feedback
            if 'supervisor_feedback' in serializer.validated_data:
                serializer.validated_data.pop('supervisor_feedback', None)
        serializer.save()

class GroupInvitationViewSet(viewsets.ModelViewSet):
    serializer_class = GroupInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Users see invitations they sent or received
        return GroupInvitation.objects.filter(
            models.Q(sender=user) | models.Q(recipient_email=user.email)
        )

    def perform_create(self, serializer):
         serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def accept(self, request, pk=None):
        # Can accept via token (public) or logged in
        token = request.data.get('token')
        try:
            invitation = GroupInvitation.objects.get(pk=pk, token=token, status='PENDING')
        except GroupInvitation.DoesNotExist:
            return Response({'error': 'Invalid invitation'}, status=status.HTTP_400_BAD_REQUEST)
        
        invitation.status = 'ACCEPTED'
        # Add to group
        user = invitation.recipient
        if not user:
             # Try to find user again if they just registered
             user = User.objects.filter(email=invitation.recipient_email).first()
        
        if user:
            invitation.group.members.add(user)
            invitation.recipient = user # ensure link
            invitation.save()
            return Response({'status': 'Invitation accepted'})
        else:
             return Response({'error': 'User not found, please register first'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'REJECTED'
        invitation.save()
        return Response({'status': 'Invitation rejected'})

class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny] # Public endpoint

    def get_queryset(self):
        # Users only see their own messages (if authenticated), or Admin sees all
        if self.request.user.is_staff:
             return ContactMessage.objects.all()
        return ContactMessage.objects.none() # Public users can't list messages for security / privacy

    def perform_create(self, serializer):
        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string
        from django.conf import settings
        
        instance = serializer.save()
        
        # Send Email to Admin
        try:
            context = {
                'subject': f"Nouveau message de contact : {instance.subject}",
                'title': 'Nouveau Message',
                'greeting': 'Bonjour',
                'message': f"Un nouveau message a été reçu via le formulaire de contact du site de la part de {instance.name} ({instance.email}).\n\nSujet: {instance.subject}\n\nMessage:\n{instance.message}",
                'extra_info': f"ID du message: {instance.id}"
            }
            html_content = render_to_string('emails/action.html', context)
            text_content = f"Message de {instance.name} :\n{instance.message}"
            
            msg = EmailMultiAlternatives(
                context['subject'],
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [settings.DEFAULT_FROM_EMAIL]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=True)
        except Exception as e:
            print(f"Failed to send email: {e}")


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    
    def get_permissions(self):
        # Admin can create/update/delete, anyone can list/view
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Event.objects.all().order_by('-date')
        
        # Public users only see active events
        if not self.request.user.is_staff:
             queryset = queryset.filter(is_active=True)
             
        # Filter by category if needed
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset

class AppointmentViewSet(viewsets.ModelViewSet):
    from .serializers import AppointmentSerializer
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role in ['ADMIN', 'SUPER_ADMIN']:
            return self.serializer_class.Meta.model.objects.all()
        return self.serializer_class.Meta.model.objects.filter(client=user)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def perform_update(self, serializer):
        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string
        from django.conf import settings

        old_status = serializer.instance.status
        instance = serializer.save()
        
        if old_status == 'PENDING' and instance.status == 'VALIDATED':
            try:
                # Format date nicely
                date_str = instance.date_requested.strftime("%A %d %B %Y à %H:%M")
                
                context = {
                    'subject': 'Confirmation de votre Rendez-vous Atelier',
                    'title': 'Rendez-vous Confirmé',
                    'greeting': f"Bonjour {instance.client.get_full_name() or instance.client.prenom}",
                    'message': f"Nous avons le plaisir de vous confirmer que votre rendez-vous pour le motif \"{instance.reason}\" a été validé par l'atelier.\n\nDate et Heure : {date_str}\n\nNous vous attendons avec impatience.",
                    'button_url': f"{settings.FRONTEND_URL}/client/dashboard" if hasattr(settings, 'FRONTEND_URL') else "https://prophcouture.com/client/dashboard",
                    'button_text': "Voir mon tableau de bord",
                    'extra_info': "Si vous devez annuler ou reporter ce rendez-vous, merci de nous contacter le plus rapidement possible.",
                }
                
                html_content = render_to_string('emails/action.html', context)
                text_content = f"Votre rendez-vous pour le {date_str} est confirmé."
                
                msg = EmailMultiAlternatives(
                    context['subject'],
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [instance.client.email]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send(fail_silently=True)
            except Exception as e:
                print(f"Erreur d'envoi d'email pour RDV: {e}")

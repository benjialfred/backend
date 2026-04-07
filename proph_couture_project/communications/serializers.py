from rest_framework import serializers
from .models import Announcement, Notification, DailyJournal, GroupInvitation, ContactMessage, Event, Appointment
from users.serializers import UserSerializer

class AnnouncementSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'author', 'author_details', 'target_role', 'is_public', 'published_at', 'expires_at', 'created_at']
        read_only_fields = ['author', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'read', 'created_at']
        read_only_fields = ['created_at']

class DailyJournalSerializer(serializers.ModelSerializer):
    apprentice_name = serializers.CharField(source='apprentice.get_full_name', read_only=True)
    
    class Meta:
        model = DailyJournal
        fields = ['id', 'apprentice', 'apprentice_name', 'date', 'content', 'supervisor_feedback', 'created_at']
        read_only_fields = ['apprentice', 'created_at'] 

class GroupInvitationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = GroupInvitation
        fields = ['id', 'sender', 'sender_name', 'recipient_email', 'group', 'group_name', 'status', 'token', 'created_at']
        read_only_fields = ['sender', 'token', 'status', 'created_at', 'recipient']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'category', 'image', 'date', 'location', 'is_active', 'created_at']
        read_only_fields = ['created_at']

class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'client', 'client_name', 'date_requested', 'reason', 'status', 'created_at', 'updated_at']
        read_only_fields = ['client', 'status', 'created_at', 'updated_at']

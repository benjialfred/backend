from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnnouncementViewSet, NotificationViewSet, 
    DailyJournalViewSet, GroupInvitationViewSet,
    ContactMessageViewSet, EventViewSet, AppointmentViewSet
)

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'daily-journals', DailyJournalViewSet, basename='daily-journal')
router.register(r'group-invitations', GroupInvitationViewSet, basename='group-invitation')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'events', EventViewSet, basename='event')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]

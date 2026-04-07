# users/urls.py - VERSION CORRIGÉE COMPLÈTE

from django.urls import path, include  # ← AJOUTEZ 'include' !
from .views import (
    RegisterView, CheckEmailView, LoginView, LogoutView,
    ForgotPasswordView, VerifyOTPView, ResetPasswordView,
    TwoFactorSetupView, TwoFactorVerifyView, TwoFactorDisableView,
    UserViewSet, WorkerViewSet, ApprenticeViewSet, UserStatsView,
    WorkerGroupViewSet, WorkerProjectViewSet, WorkerTaskViewSet,
    GroupInvitationViewSet,
    GoogleLogin
)
from rest_framework.routers import DefaultRouter

# Router SEULEMENT pour workers et apprentices
router = DefaultRouter()
router.register(r'workers', WorkerViewSet, basename='worker')
router.register(r'apprentices', ApprenticeViewSet, basename='apprentice')
router.register(r'worker-groups', WorkerGroupViewSet, basename='worker-group')
router.register(r'worker-projects', WorkerProjectViewSet, basename='worker-project')
router.register(r'worker-tasks', WorkerTaskViewSet, basename='worker-task')
router.register(r'group-invitations', GroupInvitationViewSet, basename='group-invitation')

urlpatterns = [
    # Authentication endpoints (DOIVENT ÊTRE EN PREMIER)
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('check-email/', CheckEmailView.as_view(), name='check-email'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Password Reset
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    
    # 2FA
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa-disable'),
    
    # User profile endpoints
    path('me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('me/update/', UserViewSet.as_view({'put': 'update_profile'}), name='user-update-profile'),
    path('me/change-password/', UserViewSet.as_view({'put': 'change_password'}), name='user-change-password'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
    # User management (admin only - optionnel)
    path('', UserViewSet.as_view({'get': 'list', 'post': 'create'}), name='user-list'),
    path('<uuid:pk>/', UserViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='user-detail'),
    
    # Include router for workers and apprentices
    path('', include(router.urls)),  # ← CELA REQUIERT 'include'
]
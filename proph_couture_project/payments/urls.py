from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import WithdrawalViewSet, AdminFinanceStatsView
from .nelsius_webhook import NelsiusWebhookView

router = DefaultRouter()
router.register(r'withdrawals', WithdrawalViewSet, basename='withdrawal')

urlpatterns = [
    path('finance-stats/', AdminFinanceStatsView.as_view(), name='finance-stats'),
    path('webhook/nelsius/', NelsiusWebhookView.as_view(), name='nelsius-webhook'),
] + router.urls
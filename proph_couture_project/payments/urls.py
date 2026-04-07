from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import WithdrawalViewSet, AdminFinanceStatsView

router = DefaultRouter()
router.register(r'withdrawals', WithdrawalViewSet, basename='withdrawal')

urlpatterns = [
    path('finance-stats/', AdminFinanceStatsView.as_view(), name='finance-stats'),
] + router.urls
# payments/views.py
import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from orders.models import Order
from django.utils import timezone
from .services.nelsius_service import NelsiusService
from django.db.models import Sum

logger = logging.getLogger(__name__)

from rest_framework import viewsets, permissions
from .models import Withdrawal
from .serializers import WithdrawalSerializer
from users.permissions import IsAdmin

class WithdrawalViewSet(viewsets.ModelViewSet):
    """Gère les demandes de retrait"""
    queryset = Withdrawal.objects.all()
    serializer_class = WithdrawalSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def perform_create(self, serializer):
        amount = serializer.validated_data.get('amount')
        
        # Vérifier le solde disponible
        total_revenue = Order.objects.filter(
            status__in=['paid', 'confirmed', 'shipped', 'delivered', 'ready']
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        total_withdrawn = Withdrawal.objects.filter(
            status__in=['pending', 'processed']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        available_balance = total_revenue - total_withdrawn
        
        if amount > available_balance:
            raise serializers.ValidationError({"amount": "Le montant demandé dépasse le solde disponible."})
            
        serializer.save(user=self.request.user)

class AdminFinanceStatsView(APIView):
    """Affiche les statistiques financières globales pour l'admin"""
    
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # 1. Revenu total (Commandes payées)
        total_revenue = Order.objects.filter(
            status__in=['paid', 'confirmed', 'shipped', 'delivered', 'ready']
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # 2. Total retiré ou en attente
        withdrawals_summary = Withdrawal.objects.filter(
            status__in=['pending', 'processed']
        ).aggregate(total=Sum('amount'))
        
        total_withdrawn = withdrawals_summary['total'] or 0
        
        # 3. Solde disponible
        available_balance = total_revenue - total_withdrawn
        
        return Response({
            'total_revenue': float(total_revenue),
            'total_withdrawn': float(total_withdrawn),
            'available_balance': float(available_balance)
        })



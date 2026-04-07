from rest_framework import serializers
from .models import NelsiusTransaction, Withdrawal

class NelsiusTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NelsiusTransaction
        fields = '__all__'

class WithdrawalSerializer(serializers.ModelSerializer):
    """Serializer pour les retraits"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Withdrawal
        fields = ['id', 'user', 'user_name', 'amount', 'status', 'details', 'processed_at', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'processed_at', 'created_at']

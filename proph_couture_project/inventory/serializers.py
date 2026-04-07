from rest_framework import serializers
from .models import Material
from users.serializers import UserSerializer

class MaterialSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    date_added = serializers.DateTimeField(source='date_registered', read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'name', 'description', 'quantity', 'status', 
            'owner', 'owner_details', 'owner_name',
            'date_registered', 'date_added', 'last_updated'
        ]
        read_only_fields = ['owner', 'date_registered', 'date_added', 'last_updated', 'owner_details', 'owner_name']

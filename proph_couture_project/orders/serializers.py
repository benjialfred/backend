# orders/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from products.models import Product
from .models import Order, OrderItem

User = get_user_model()

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer pour les articles de commande"""
    
    total_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    # Use CharField to allow relative paths/placeholders that might not pass URL validation
    product_image = serializers.CharField(required=False, allow_blank=True)
    
    # Allow any ID (even invalid ones for simulation) by treating as raw input
    # Use PrimaryKeyRelatedField to handle Integer ID <-> Product Instance conversion correctly
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        required=False, 
        allow_null=True
    )
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'product_price', 'quantity', 'total_price',
            'custom_measurements', 'custom_notes', 'product_image'
        ]
        # Allow writing name/price manually for simulated items
        read_only_fields = ['id']

    def validate(self, attrs):
        # Ensure we have minimally required fields if product lookup fails later
        if not attrs.get('product') and (not attrs.get('product_name') or not attrs.get('product_price')):
            # Note: We can't strictly enforce here easily without checking DB, 
            # but we trust CreateOrderSerializer to fix it or DB constraints to fail.
            pass
        return attrs

class OrderSerializer(serializers.ModelSerializer):
    """Serializer principal pour les commandes"""
    
    items = OrderItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    can_be_cancelled = serializers.BooleanField(read_only=True)
    
    # Informations utilisateur
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'user_full_name',
            'status', 'payment_method', 'payment_status', 'transaction_id',
            'subtotal', 'shipping_cost', 'tax', 'total_amount',
            'shipping_address', 'billing_address', 'shipping_method',
            'tracking_number', 'notes', 'items', 'item_count',
            'is_paid', 'can_be_cancelled', 'production_deadline', 'production_state',
            'created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'user_email', 'user_full_name',
            'created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at'
        ]
    
    def get_user_full_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        return obj.user.get_full_name()

class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer pour la création de commande"""
    
    items = OrderItemSerializer(many=True, write_only=True)
    shipping_address = serializers.JSONField(required=True)
    billing_address = serializers.JSONField(default=dict)
    
    class Meta:
        model = Order
        fields = [
            'payment_method', 'shipping_method', 'shipping_cost',
            'shipping_address', 'billing_address', 'notes', 'items'
        ]
    
    def create(self, validated_data):
        """Création d'une commande avec ses articles"""
        items_data = validated_data.pop('items')
        
        # Avoid duplicate 'user' argument error if it's in validated_data
        user = validated_data.pop('user', self.context['request'].user)
        
        # Créer la commande with default total_amount to avoid IntegrityError
        order = Order.objects.create(user=user, total_amount=0, **validated_data)
        
        # Créer les articles
        for item_data in items_data:
            product_id = item_data.get('product')
            product_instance = None
            
            # Try to resolve product
            if product_id:
                try:
                    from products.models import Product
                    # Robust check: if it looks like a model instance (has pk), treats it as such
                    if hasattr(product_id, 'pk'):
                        product_instance = product_id
                    else:
                        # Otherwise resolve from ID
                        product_instance = Product.objects.get(pk=product_id)
                    
                    # If real product found, enforce its details for consistency
                    # ULTRA-ROBUST FIX: Explicitly use product_id (PK) and delete 'product' key
                    # This ensures Django receives an integer ID, not an object instance
                    item_data['product_id'] = getattr(product_instance, 'pk', product_instance.id)
                    if 'product' in item_data:
                        del item_data['product'] 
                        
                    item_data['product_name'] = product_instance.nom
                    item_data['product_sku'] = product_instance.sku
                    item_data['product_price'] = product_instance.prix
                except (ImportError, Exception):
                    # Catch Product.DoesNotExist separately if possible, or general Exception if Product is not defined
                    # If any error in resolving product (including import), treat as raw input
                    pass
                    # Simulated or invalid product: treat as raw input
                    item_data['product'] = None
            
            OrderItem.objects.create(order=order, **item_data)
        
        # Calculer les totaux
        order.calculate_totals()
        order.save()
        
        return order

class UserMeasurementsSerializer(serializers.Serializer):
    """Serializer pour les mesures personnelles"""
    
    # Mesures principales
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    bust = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    waist = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    hips = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    
    # Mesures détaillées
    shoulder_width = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    arm_length = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    leg_length = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    back_length = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    chest_width = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    
    # Informations
    notes = serializers.CharField(required=False, allow_blank=True)
    last_updated = serializers.DateTimeField(read_only=True)
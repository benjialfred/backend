# orders/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid

User = get_user_model()

# ==========================================
# 1. GESTION DES COMMANDES (ORDER)
# ==========================================
# Ce modèle gère le cycle de vie complet d'un achat, du panier (pending) à la livraison (delivered).
# J'ai structuré les statuts de manière séquentielle pour faciliter le suivi par le client et les ouvriers.
class Order(models.Model):
    """Modèle principal de transaction E-commerce"""
    
    STATUS_CHOICES = [
        ('pending', 'En attente de paiement'),
        ('processing', 'En traitement'),
        ('confirmed', 'Confirmée'),
        ('paid', 'Payée'),
        ('shipped', 'Expédiée'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    ]
    
    PRODUCTION_STATE_CHOICES = [
        ('not_started', 'Non commencée'),
        ('measurements_taken', 'Mesures prises'),
        ('cutting', 'En coupe'),
        ('sewing', 'En couture'),
        ('fitting', 'Passer essayer'),
        ('in_production', 'En confection'),
        ('ready', 'Couture terminée / Prête'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Paiement à la livraison'),
        ('nelsius', 'Nelsius (Mobile Money/Carte)'),
        ('bank_transfer', 'Virement bancaire'),
    ]
    
    # Informations de base
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    production_state = models.CharField(max_length=50, choices=PRODUCTION_STATE_CHOICES, default='not_started')
    
    # Informations de paiement
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='nelsius')
    payment_status = models.CharField(max_length=20, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Montants
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    shipping_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Informations de livraison
    shipping_address = models.JSONField(default=dict)
    billing_address = models.JSONField(default=dict)
    shipping_method = models.CharField(max_length=50, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    production_deadline = models.DateTimeField(null=True, blank=True)
    
    # Métadonnées
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
    
    def __str__(self):
        return f"Commande #{self.order_number} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        """Génère automatiquement le numéro de commande"""
        if not self.order_number:
            self.order_number = self._generate_order_number()
        
        # Calcul du total si nécessaire, mais seulement si la commande existe déjà
        if self.pk and (not self.total_amount or self.total_amount == 0):
            self.calculate_totals()
        
        super().save(*args, **kwargs)
    
    def _generate_order_number(self):
        """Génère un numéro de commande unique"""
        import random
        import string
        prefix = "CMD"
        timestamp = self.created_at.strftime('%Y%m%d') if self.created_at else timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}-{timestamp}-{random_str}"
    
    def calculate_totals(self):
        """Calcule les totaux de la commande"""
        subtotal = sum(item.total_price for item in self.items.all()) or Decimal('0.00')
        self.subtotal = subtotal
        self.total_amount = subtotal + Decimal(str(self.shipping_cost)) + Decimal(str(self.tax))
        return self.total_amount
    
    @property
    def item_count(self):
        """Retourne le nombre d'articles"""
        return self.items.count()
    
    @property
    def is_paid(self):
        """Vérifie si la commande est payée"""
        return self.payment_status == 'paid' or self.status == 'paid'
    
    @property
    def can_be_cancelled(self):
        """Vérifie si la commande peut être annulée"""
        return self.status in ['pending', 'confirmed', 'processing']

# ==========================================
# 2. LIGNES DE COMMANDE (ORDER ITEMS)
# ==========================================
# J'ai séparé les articles de la commande globale. Cela permet d'avoir plusieurs produits
# différents dans un seul panier, et surtout de stocker les "Mesures personnalisées" (custom_measurements)
# au niveau de l'article lui-même, essentiel pour une maison de couture !
class OrderItem(models.Model):
    """Détail d'un article spécifique dans une commande globale"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100, blank=True)
    product_price = models.DecimalField(max_digits=15, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    # Pour les commandes sur mesure
    custom_measurements = models.JSONField(default=dict, blank=True)
    custom_notes = models.TextField(blank=True)
    
    # Images
    product_image = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Article de commande'
        verbose_name_plural = 'Articles de commande'
    
    def __str__(self):
        return f"{self.quantity}x {self.product_name}"
    
    @property
    def total_price(self):
        """Calcule le prix total pour cet article"""
        return self.product_price * self.quantity
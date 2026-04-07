# payments/models.py
from django.db import models
from django.conf import settings

class NelsiusTransaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('initiated', 'Initier'),
        ('processing', 'En traitement'),
        ('success', 'Réussi'),
        ('failed', 'Échoué'),
        ('cancelled', 'Annulé'),
    ]
    
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='nelsius_transactions')
    nelsius_transaction_id = models.CharField(max_length=100, unique=True)
    merchant_reference = models.CharField(max_length=50)  # Votre référence (numéro de commande)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='XOF')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Informations client Nelsius
    customer_name = models.CharField(max_length=255, blank=True)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    
    # Données de retour
    payment_method = models.CharField(max_length=50, blank=True)  # 'mobile_money', 'card'
    operator = models.CharField(max_length=50, blank=True)  # 'orange', 'mtn', 'moov'
    
    # URL de redirection
    payment_url = models.URLField(blank=True)
    callback_url = models.URLField(blank=True)
    
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Transaction Nelsius"
        verbose_name_plural = "Transactions Nelsius"
    
    def __str__(self):
        return f"Nelsius: {self.nelsius_transaction_id} - {self.amount} {self.currency}"

class Withdrawal(models.Model):
    """Modèle pour gérer les retraits de fonds par l'admin"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processed', 'Traité'),
        ('rejected', 'Rejeté'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Détails du retrait (compte bancaire, mobile money, etc.)
    details = models.TextField(blank=True, help_text="Détails du compte de destination")
    
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Retrait de {self.amount} par {self.user}"
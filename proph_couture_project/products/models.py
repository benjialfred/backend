from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import settings

# ==========================================
# 1. GESTION DES CATÉGORIES
# ==========================================
class Category(models.Model):
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name_plural = "Catégories"

# ==========================================
# 2. PRODUIT PRINCIPAL DU CATALOGUE
# ==========================================
class Product(models.Model):
    TAILLE_CHOICES = [
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
        ('XXL', 'XXL'),
        ('UNIQUE', 'Unique'),
    ]
    
    STYLE_CHOICES = [
        ('CLASSIC', 'Classic'),
        ('MODERN', 'Modern'),
        ('SPORT', 'Sport'),
        ('CASUAL', 'Casual'),
        ('FORMAL', 'Formal'),
    ]

    nom = models.CharField(max_length=255)
    description = models.TextField()
    description_detaillee = models.TextField(blank=True, null=True)
    prix = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    prix_promotion = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    taille = models.CharField(max_length=50, choices=TAILLE_CHOICES, blank=True, null=True)
    couleur = models.CharField(max_length=100, blank=True, null=True)
    materiau = models.CharField(max_length=100, blank=True, null=True)
    style = models.CharField(max_length=100, choices=STYLE_CHOICES, default='CLASSIC')
    image_principale = models.ImageField(upload_to='products/images/')
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sku = models.CharField(max_length=100, unique=True)
    
    # Nouveaux champs: Suggestions d'utilisation et Consignes de sécurité
    suggestions_utilisation = models.TextField(
        blank=True, null=True,
        help_text="Suggestions d'utilisation pour le client (ex: occasions, associations vestimentaires)"
    )
    consignes_securite = models.TextField(
        blank=True, null=True,
        help_text="Consignes de sécurité pour la commande (ex: précautions, allergènes, entretien)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['is_active']),
            models.Index(fields=['category', 'is_active']),
        ]

# ==========================================
# 3. GALERIE D'IMAGES MULTIPLES
# ==========================================
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='galerie_images')
    image = models.ImageField(upload_to='products/gallery/')
    ordre = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['ordre']

# ==========================================
# 4. FAVORIS
# ==========================================
class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} ♥ {self.product.nom}"

# ==========================================
# 5. COMMENTAIRES / AVIS PRODUIT
# ==========================================
class ProductComment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='product_comments'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    text = models.TextField()
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Note de 1 à 5"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # Un utilisateur ne peut commenter un produit qu'une seule fois
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} - {self.product.nom} ({self.rating}★)"

# ==========================================
# 6. MODÈLES DE CONCEPTION / INSPIRATIONS
# ==========================================
class Model(models.Model):
    nom = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='models/images/')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='models')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['-created_at']
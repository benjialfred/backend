from django.contrib import admin
from .models import Product, Category, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'ordre']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['nom', 'sku', 'prix', 'stock', 'is_active', 'is_featured', 'created_at']
    list_filter = ['is_active', 'is_featured', 'category', 'taille']
    search_fields = ['nom', 'sku', 'description']
    inlines = [ProductImageInline]
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description', 'description_detaillee', 'sku', 'category')
        }),
        ('Prix et Stock', {
            'fields': ('prix', 'prix_promotion', 'stock')
        }),
        ('Caractéristiques', {
            'fields': ('taille', 'couleur', 'materiau', 'style')
        }),
        ('Images', {
            'fields': ('image_principale',)
        }),
        ('Statut', {
            'fields': ('is_active', 'is_featured')
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['nom', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['nom']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'ordre', 'created_at']
    list_filter = ['product']
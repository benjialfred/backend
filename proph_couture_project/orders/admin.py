# orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_price', 'total_price']
    can_delete = False
    
    def has_add_permission(self, request, obj):
        return False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order_number', 'user__email', 'user__nom', 'user__prenom']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Paiement', {
            'fields': ('payment_method', 'payment_status', 'transaction_id')
        }),
        ('Montants', {
            'fields': ('subtotal', 'shipping_cost', 'tax', 'total_amount')
        }),
        ('Livraison', {
            'fields': ('shipping_address', 'billing_address', 'shipping_method', 'tracking_number')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at')
        }),
        ('Autres', {
            'fields': ('notes', 'metadata')
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'quantity', 'product_price', 'total_price']
    list_filter = ['order__status']
    search_fields = ['product_name', 'order__order_number']
    readonly_fields = ['product_name', 'product_price', 'total_price']
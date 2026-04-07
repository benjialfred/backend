from django.contrib import admin
from .models import Material

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'quantity', 'status', 'date_registered')
    list_filter = ('status', 'date_registered')
    search_fields = ('name', 'owner__email', 'description')

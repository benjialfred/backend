from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Worker, Apprentice

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'nom', 'prenom', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    ordering = ('email',)
    search_fields = ('email', 'nom', 'prenom')
    
    # Configuration pour UserAdmin avec email comme username
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'prenom', 'telephone', 'photo_profil', 'adresse_livraison', 'ville', 'pays')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'nom', 'prenom', 'role'),
        }),
    )

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('user', 'fonction', 'groupe')
    search_fields = ('user__email', 'user__nom')

@admin.register(Apprentice)
class ApprenticeAdmin(admin.ModelAdmin):
    list_display = ('user', 'grade')
    search_fields = ('user__email', 'user__nom')

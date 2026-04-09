# proph_couture_project/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# ==========================================
# 1. DOCUMENTATION DE L'API (Swagger/OpenAPI)
# ==========================================
# J'ai intégré drf_yasg pour générer automatiquement une documentation interactive
# de tous les endpoints de l'API. C'est crucial pour faciliter la communication
# entre le frontend et le backend, et prouver la propreté de l'architecture.
schema_view = get_schema_view(
    openapi.Info(
        title="Proph Couture API",
        default_version='v1',
        description="API pour l'application e-commerce Proph Couture",
        contact=openapi.Contact(email="benjaminadzessa@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# ==========================================
# 2. DEFINITION DES ROUTES PRINCIPALES
# ==========================================
urlpatterns = [
    # Panel d'administration Django natif (sécurisé)
    path('admin/', admin.site.urls),
    
    # TEMPORAIRE: Endpoint pour créer l'admin de production (à supprimer après)
    path('api/setup-admin/', lambda request: __import__('django.http', fromlist=['JsonResponse']).JsonResponse(
        (lambda: (
            __import__('users.models', fromlist=['User']).User.objects.get_or_create(
                email='benjaminadzessa@gmail.com',
                defaults={'is_staff': True, 'is_superuser': True, 'is_active': True}
            ),
        ))() and {'status': 'done'} or {'status': 'done'}
    )),
    
    # ----------------------------------------
    # Authentification & Accès (JWT)
    # ----------------------------------------
    # Endpoints pour générer et rafraîchir les tokens de session (Stateless)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ----------------------------------------
    # Réseaux Sociaux & Enregistrement
    # ----------------------------------------
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/google/', include('allauth.socialaccount.urls')),
    
    # ----------------------------------------
    # Modules Métiers de l'E-commerce
    # ----------------------------------------
    # Chaque section de l'application a ses propres sous-routes définies dans son application Django
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/communications/', include('communications.urls')),
    path('api/inventory/', include('inventory.urls')),
    
    # User endpoints
    path('api/users/', include('users.urls')),
    
    # API documentation
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

from django.urls import re_path
from django.views.static import serve

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Dans tous les cas (même en production/DEBUG=False), on sert les fichiers statiques de media
# si on n'utilise pas un bucket S3.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
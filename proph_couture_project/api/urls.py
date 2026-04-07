from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.conf import settings
from django.conf.urls.static import static

from users.views import UserViewSet, LoginView, RegisterView, GoogleLoginView, UserProfileView
from products.views import ProductViewSet, CategoryViewSet, ModelViewSet
from orders.views import (
    OrderViewSet, 
    MyOrdersView, 
    AdminOrderListView, 
    OrderDetailView, 
    CancelOrderView, 
    DownloadInvoiceView, 
    MyMeasurementsView,
    InitiatePaymentView
)
from communications.views import AnnouncementViewSet, NotificationViewSet
from inventory.views import MaterialViewSet

# Documentation API
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

router = DefaultRouter()
# Nous ajouterons les viewsets ici plus tard

urlpatterns = [
    # Authentication endpoints avec JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('api/', include('products.urls')),
 
    # User endpoints
    path('users/', include('users.urls')),
    
    # API documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API router
    path('', include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
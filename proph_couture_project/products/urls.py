# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# IMPORTANT: L'ordre est crucial - 'categories' doit être avant ''
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'models', views.ModelViewSet, basename='model')
router.register(r'', views.ProductViewSet, basename='product')

urlpatterns = [
    path('favorites/', views.FavoritesListView.as_view(), name='favorites-list'),
    path('my-comments/', views.MyCommentsListView.as_view(), name='my-comments-list'),
    path('', include(router.urls)),
]
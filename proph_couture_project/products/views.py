from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, Category, Style, Model, Favorite, ProductComment
from .serializers import (
    ProductSerializer, CategorySerializer, StyleSerializer, ModelSerializer,
    ProductCommentSerializer, ProductCommentCreateSerializer,
    FavoriteSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée :
    - Lecture autorisée pour tous
    - Écriture réservée aux administrateurs
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        from users.models import UserRole
        return request.user.is_staff or request.user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les opérations CRUD sur les produits
    """
    queryset = Product.objects.select_related('category').prefetch_related('galerie_images', 'comments', 'comments__user').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = self.queryset
        
        category_id = self.request.query_params.get('category_id')
        is_active = self.request.query_params.get('is_active')
        is_featured = self.request.query_params.get('is_featured')
        search = self.request.query_params.get('search')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(description__icontains=search) |
                Q(sku__icontains=search)
            )
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        product = serializer.save()
        if self.request.user and self.request.user.is_authenticated:
            from communications.models import Notification
            try:
                Notification.objects.create(
                    user=self.request.user,
                    title="Produit ajouté",
                    message=f"Vous avez ajouté le produit : {product.nom}",
                    type='INFO'
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error creating notification: {e}")

    def perform_update(self, serializer):
        product = serializer.save()
        if self.request.user and self.request.user.is_authenticated:
            from communications.models import Notification
            try:
                Notification.objects.create(
                    user=self.request.user,
                    title="Produit modifié",
                    message=f"Le produit {product.nom} a été mis à jour avec succès.",
                    type='INFO'
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error creating notification: {e}")

    def perform_destroy(self, instance):
        nom = instance.nom
        if self.request.user and self.request.user.is_authenticated:
            from communications.models import Notification
            try:
                Notification.objects.create(
                    user=self.request.user,
                    title="Produit supprimé",
                    message=f"Le produit {nom} a été supprimé.",
                    type='INFO'
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error creating notification: {e}")
        instance.delete()

    @action(detail=True, methods=['patch'])
    def toggle_featured(self, request, id=None):
        """Toggle le statut 'featured' d'un produit"""
        product = self.get_object()
        product.is_featured = not product.is_featured
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, id=None):
        """Toggle le statut 'active' d'un produit"""
        product = self.get_object()
        product.is_active = not product.is_active
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_favorite(self, request, id=None):
        """Ajouter/Retirer un produit des favoris"""
        product = self.get_object()
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            product=product
        )
        if not created:
            favorite.delete()
            return Response({'status': 'removed', 'is_favorite': False}, status=status.HTTP_200_OK)
        return Response({'status': 'added', 'is_favorite': True}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, id=None):
        """Ajouter un commentaire/avis sur un produit"""
        product = self.get_object()
        
        # Vérifier si l'utilisateur a déjà commenté ce produit
        existing = ProductComment.objects.filter(user=request.user, product=product).first()
        if existing:
            # Mettre à jour le commentaire existant
            serializer = ProductCommentCreateSerializer(existing, data=request.data, partial=True)
        else:
            serializer = ProductCommentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            if existing:
                serializer.save()
            else:
                serializer.save(user=request.user, product=product)
            
            # Retourner le commentaire complet avec les infos utilisateur
            comment = existing if existing else ProductComment.objects.filter(user=request.user, product=product).first()
            response_serializer = ProductCommentSerializer(comment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, id=None):
        """Lister les commentaires d'un produit"""
        product = self.get_object()
        comments = product.comments.select_related('user').all()
        serializer = ProductCommentSerializer(comments, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class StyleViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les styles
    """
    queryset = Style.objects.all()
    serializer_class = StyleSerializer
    permission_classes = [IsAdminOrReadOnly]


class ModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les modèles de couture
    """
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        category_id = self.request.query_params.get('category_id')
        search = self.request.query_params.get('search')

        if category_id:
            try:
                if category_id != 'all':
                   queryset = queryset.filter(category_id=category_id)
            except ValueError:
                pass 

        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset.order_by('-created_at') 


class FavoritesListView(generics.ListAPIView):
    """
    Retourne la liste des produits favoris de l'utilisateur connecté
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        favorite_product_ids = Favorite.objects.filter(
            user=self.request.user
        ).values_list('product_id', flat=True)
        return Product.objects.filter(
            id__in=favorite_product_ids
        ).select_related('category').prefetch_related('galerie_images', 'comments', 'comments__user')

class MyCommentsListView(generics.ListAPIView):
    """
    Retourne la liste des commentaires de l'utilisateur connecté
    """
    serializer_class = ProductCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProductComment.objects.filter(
            user=self.request.user
        ).select_related('product', 'user').order_by('-created_at')
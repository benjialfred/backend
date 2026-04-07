from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from django.db.models import Avg
from .models import Product, ProductImage, Category, Model, Favorite, ProductComment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'nom', 'description', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    image = Base64ImageField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'ordre']
        read_only_fields = ['id']


class ProductCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_photo = serializers.SerializerMethodField()

    class Meta:
        model = ProductComment
        fields = ['id', 'user_name', 'user_photo', 'text', 'rating', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_user_photo(self, obj):
        return obj.user.photo_profil


class ProductCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductComment
        fields = ['text', 'rating']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'product', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    image_principale = Base64ImageField(required=True)
    galerie_images = serializers.ListField(
        child=Base64ImageField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    category = CategorySerializer(read_only=True)
    galerie_images_list = ProductImageSerializer(
        source='galerie_images', 
        many=True, 
        read_only=True
    )
    
    # Commentaires et favoris
    comments_list = ProductCommentSerializer(
        source='comments',
        many=True,
        read_only=True
    )
    is_favorite = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'nom', 'description', 'description_detaillee',
            'prix', 'prix_promotion', 'stock', 'category_id', 'category',
            'taille', 'couleur', 'materiau', 'style',
            'image_principale', 'is_featured', 'is_active',
            'sku', 'created_at', 'updated_at',
            'galerie_images', 'galerie_images_list',
            'suggestions_utilisation', 'consignes_securite',
            'comments_list', 'is_favorite', 'comments_count', 'average_rating',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_average_rating(self, obj):
        avg = obj.comments.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else 0

    def validate_sku(self, value):
        if Product.objects.filter(sku=value).exists():
            if self.instance and self.instance.sku == value:
                return value
            raise serializers.ValidationError("Ce SKU existe déjà.")
        return value

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être positif.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Le stock ne peut pas être négatif.")
        return value

    def validate(self, data):
        prix_promotion = data.get('prix_promotion')
        prix = data.get('prix')
        
        if prix_promotion and prix_promotion >= prix:
            raise serializers.ValidationError({
                'prix_promotion': 'Le prix promotionnel doit être inférieur au prix normal.'
            })
        
        return data

    def create(self, validated_data):
        galerie_images_data = validated_data.pop('galerie_images', [])
        product = Product.objects.create(**validated_data)
        
        for index, image_data in enumerate(galerie_images_data):
            ProductImage.objects.create(
                product=product,
                image=image_data,
                ordre=index
            )
        
        return product

    def update(self, instance, validated_data):
        galerie_images_data = validated_data.pop('galerie_images', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if galerie_images_data is not None:
            instance.galerie_images.all().delete()
            for index, image_data in enumerate(galerie_images_data):
                ProductImage.objects.create(
                    product=instance,
                    image=image_data,
                    ordre=index
                )
        
        return instance


class ModelSerializer(serializers.ModelSerializer):
    image = Base64ImageField(required=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Model
        fields = ['id', 'nom', 'description', 'image', 'category_id', 'category', 'created_at']
        read_only_fields = ['id', 'created_at']
import os
import django
import sys
import base64

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from products.serializers import ProductSerializer
from products.models import Category
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

category = Category.objects.first()
if not category:
    category = Category.objects.create(nom="Test Category")

# Minimal 1x1 png base64
b64_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

data = {
    'nom': 'Test Product',
    'description': 'test',
    'prix': 10.0,
    'stock': 1,
    'sku': 'TEST4',
    'category_id': category.id,
    'image_principale': b64_image,
    'galerie_images': [b64_image]
}

serializer = ProductSerializer(data=data)
if serializer.is_valid():
    try:
        product = serializer.save()
        print("Success!", product.id)
        
        # Test perform_create behavior
        from communications.models import Notification
        Notification.objects.create(
            user=user if user else User.objects.create(email="test@test.com", password="xx"),
            title="Produit ajouté",
            message=f"Vous avez ajouté le produit : {product.nom}",
            type='SYSTEME'
        )
        print("Notification creation successful.")
    except Exception as e:
        print("Exception during save:", repr(e))
else:
    print("Errors:", serializer.errors)

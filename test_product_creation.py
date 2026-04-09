import os, sys, django
sys.path.append(r'c:\PhC\proph_couture_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from products.serializers import ProductSerializer
from products.models import Category
import uuid

category, _ = Category.objects.get_or_create(nom='Test Category')

data = {
    'nom': 'Test Product',
    'prix': 1000,
    'description': 'test',
    'stock': 10,
    'sku': str(uuid.uuid4())[:10],
    'category_id': category.id,
    'image_principale': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
}

serializer = ProductSerializer(data=data)
if serializer.is_valid():
    try:
        serializer.save()
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("Invalid data", serializer.errors)

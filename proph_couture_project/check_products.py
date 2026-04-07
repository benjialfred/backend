import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "proph_couture_project.settings")
django.setup()

from products.models import Product, Category

print(f"Categories count: {Category.objects.count()}")
print(f"Products count: {Product.objects.count()}")

for p in Product.objects.all()[:5]:
    print(f"Product: {p.nom}, Active: {p.is_active}, Featured: {p.is_featured}")

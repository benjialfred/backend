import os
import django
import sys
import traceback

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proph_couture_project.settings')
django.setup()

from orders.serializers import CreateOrderSerializer
from orders.models import Order
from products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

def test_create_order():
    try:
        # Get or create a test user
        # Remove username as it seems not to exist in this custom User model
        user, created = User.objects.get_or_create(email='test@example.com', defaults={'nom': 'Test', 'prenom': 'User', 'password': 'password123'})
        if created:
            user.set_password('password123')
            user.save()

        # Get a real product if exists, or create one
        product = Product.objects.first()
        if not product:
            print("No products in DB, creating one.")
            product = Product.objects.create(
                nom="Test Product", 
                prix=10000, 
                sku="TEST-001", 
                description="Test",
                is_active=True
            )
        
        print(f"Using Product: {product} (ID: {product.id}, Type: {type(product)})")

        # Simulate data payload from frontend
        data = {
            "payment_method": "nelsius",
            "shipping_method": "standard",
            "shipping_cost": 0,
            "shipping_address": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com",
                "street": "123 Rue",
                "city": "Douala",
                "country": "Cameroun"
            },
            "items": [
                {
                    "product": product.id, # Sending ID as frontend does
                    "product_name": product.nom,
                    "product_price": product.prix,
                    "quantity": 1
                }
            ]
        }

        print("Testing Serializer Validation and Creation...")
        serializer = CreateOrderSerializer(data=data, context={'request': type('obj', (object,), {'user': user})})
        
        if serializer.is_valid():
            print("Serializer is valid.")
            try:
                order = serializer.save(user=user)
                print(f"Order created successfully: {order.order_number}")
            except Exception as e:
                print("\n!!! ERROR DURING SAVE !!!")
                traceback.print_exc()
        else:
            print("Serializer Errors:", serializer.errors)

    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    test_create_order()

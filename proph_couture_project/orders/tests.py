from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Order, OrderItem

User = get_user_model()

class OrderModelTest(TestCase):
    """Tests pour les modèles Order"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_create_order(self):
        """Test de création d'une commande"""
        order = Order.objects.create(
            user=self.user,
            total_amount=15000.00,
            shipping_address={
                'street': '123 Rue Test',
                'city': 'Abidjan',
                'country': 'CI'
            }
        )
        
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.status, 'pending')
        self.assertTrue(order.order_number.startswith('CMD-'))
        self.assertIsNotNone(order.created_at)

class OrderAPITest(APITestCase):
    """Tests pour l'API Orders"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='api@example.com',
            password='testpass123',
            first_name='API',
            last_name='Test'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Créer une commande de test
        self.order = Order.objects.create(
            user=self.user,
            total_amount=20000.00,
            order_number='CMD-TEST-123'
        )
    
    def test_my_orders_view(self):
        """Test de la vue MyOrdersView"""
        url = '/api/orders/my-orders/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results' if hasattr(response.data, 'results') else response.data, response.data)
    
    def test_order_detail_view(self):
        """Test de la vue OrderDetailView"""
        url = f'/api/orders/{self.order.order_number}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order_number'], self.order.order_number)
    
    def test_create_order_view(self):
        """Test de la création de commande"""
        url = '/api/orders/create/'
        data = {
            'shipping_address': {
                'street': '456 Rue API',
                'city': 'Abidjan',
                'postal_code': '00225',
                'country': 'CI'
            },
            'shipping_method': 'standard',
            'shipping_cost': 2000.00,
            'items': [
                {
                    'product_name': 'Robe sur mesure',
                    'product_price': 18000.00,
                    'quantity': 1
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', response.data)